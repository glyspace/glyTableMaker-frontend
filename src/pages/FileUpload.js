import { Box, IconButton, Tooltip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useReducer, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { Button, Card, Container, Modal } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Link, useLocation } from "react-router-dom";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from '../components/DialogAlert';
import { ConfirmationModal } from "../components/ConfirmationModal";

const FileUpload = (props) => {
    useEffect(props.authCheckAgent, []);

    const {state} = useLocation();
    const batchUploads = state;

    const [errorMessage, setErrorMessage] = useState("");
    const [enableErrorView, setEnableErrorView] = useState(false);
    const [enableTagDialog, setEnableTagDialog] = useState(false);
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
        onHide={() => {
            updateBatchUpload();
            setEnableErrorView(false)
        }}
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
        </Modal>
    </>
    );
    };

    const handleAddTag = () => {
      // validate
      setEnableTagDialog(false);
    }

    const openAddTagDialog = () => {
      return (
        <>
        <ConfirmationModal
          showModal={enableTagDialog}
          onCancel={() => {
            setEnableTagDialog(false);
          }}
          onConfirm={() => handleAddTag()}
          title="Add Tag"
          body={
            <>
              adding a tag
            </>
          }
        />
        </>
      )
    }
    

    const columns = useMemo ( 
        () => [
          {
            accessorKey: 'startDate', 
            header: 'File upload date',
            size: 50,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
                {row.original.status==="PROCESSING" && <HourglassTopIcon color="primary"/>}
              </Box>
            ),
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
        data: batchUploads ?? [],
        enableFilters: false,
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex'}}>
            {row.original.errors && row.original.errors.length > 0 && 
            <Tooltip title="Display Errors">
                <IconButton color="error">
                    <ErrorIcon onClick={()=> {
                        setErrorMessage(row.original.errors);
                        setUploadId(row.original.id);
                        setEnableErrorView(true);
                    }}/>
                </IconButton>
            </Tooltip>
            }
            <Tooltip title="Add Tag">
              <IconButton>
                <NoteAddIcon color="primary" onClick={() => {
                  setEnableTagDialog (true);
                  setUploadId(row.original.id);
                }}/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            
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
        {enableTagDialog && openAddTagDialog()}
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
            <Card>
            <Card.Body>
            <MaterialReactTable table={table}/>
            <div className="text-center mb-2" style={{marginTop:"5px"}}>
                <Link to="/glycans">
                <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycans</Button>
                </Link>
            </div>
            </Card.Body>
            </Card>
            </div>
        </Container>
        </>
    )
};

export { FileUpload };