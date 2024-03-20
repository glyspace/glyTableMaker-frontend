import { Box, IconButton, Tooltip } from "@mui/material";
import { MRT_Table, MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useReducer, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ErrorIcon from '@mui/icons-material/Error';
import { Button, Container, Modal } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { useLocation } from "react-router-dom";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from '../components/DialogAlert';

const FileUpload = (props) => {
    useEffect(props.authCheckAgent, []);

    const {state} = useLocation();
    const batchUploads = state;

    const [errorMessage, setErrorMessage] = useState("");
    const [enableErrorView, setEnableErrorView] = useState(false);
    const [uploadId, setUploadId] = useState(-1);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const updateBatchUpload = () => {
        postJson ("api/data/updatebatchupload/"+ uploadId, null, getAuthorizationHeader()).then ( (data) => {
          console.log ("marked the batch upload results as read");
        }).catch (function(error) {
            axiosError(error, null, props.setAlertDialogInput);
        }
      );  
    };
    
    const errorMessageTable = () => {
    return (
        <>
        <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={enableErrorView}
        onHide={() => setEnableErrorView(false)}
        >
        <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {errorMessage ?
            <MaterialReactTable table={tableDetail}/> :
            "No Errors"
            }
        </Modal.Body>
        <Modal.Footer>
            <Button className="gg-btn-blue-reg" onClick={() => {
                updateBatchUpload();
                setEnableErrorView(false);
            }
            }>
            Mark Read
            </Button>
        </Modal.Footer>
        </Modal>
    </>
    );
    };
    

    const columns = useMemo ( 
        () => [
          {
            accessorKey: 'startDate', 
            header: 'File upload date',
            size: 50,
          },
          {
            accessorKey: 'filename',
            header: 'Original File Name',
            size: 100,
          },
          {
            accessorKey: 'glycans.length',
            header: '# of Glycans',
            size: 10,
          },
          {
            accessorKey: 'errors.length',
            header: '# of Errors',
            size: 10,
          },
        ],
        [],
    );

    const errorColumns = useMemo (
        () => [
            {
                accessorKey: 'position', 
                header: 'Position',
                size: 10,
              },
              {
                accessorKey: 'message',
                header: 'Message',
                size: 100,
              },
              {
                accessorKey: 'sequence',
                header: 'Glycan Sequence',
                size: 200,
              },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns,
        data: batchUploads,
        enableFilters: false,
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex'}}>
            <Tooltip title="Delete">
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add Tag">
              <IconButton>
                <NoteAddIcon />
              </IconButton>
            </Tooltip>
            {row.original.errors && row.original.errors.length > 0 && 
            <Tooltip title="Display Errors">
                <IconButton>
                    <ErrorIcon onClick={()=> {
                        setErrorMessage(row.original.errors);
                        setUploadId(row.original.id);
                        setEnableErrorView(true);
                    }}/>
                </IconButton>
            </Tooltip>
            }
          </Box>
        ),
        getRowId: (row) => row[props.rowId],
    });

    const tableDetail= useMaterialReactTable({
        columns: errorColumns,
        data: errorMessage ?? [],
        enableFilters: false,
    });

    return (
        <>
        {enableErrorView && errorMessageTable()}
        <Container maxWidth="xl">
            <div className="page-container">
            <PageHeading
                title="File Uploads"
                subTitle="The table below displays the list of file uploads and their status"s
            />
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
            <MaterialReactTable table={table}/>
            </div>
        </Container>
        </>
    )
};

export { FileUpload };