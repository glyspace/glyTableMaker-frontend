import { Box, IconButton, Tooltip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useReducer, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import { Button, Card, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteJson, getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from '../components/DialogAlert';
import { ConfirmationModal } from "../components/ConfirmationModal";

const FileUpload = (props) => {
    useEffect(props.authCheckAgent, []);

    const { state} = useLocation();
    const { data, fetch} = state;
    const batchUploads = data;
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");
    const [enableErrorView, setEnableErrorView] = useState(false);
    const [enableTagDialog, setEnableTagDialog] = useState(false);
    const [uploadId, setUploadId] = useState(-1);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [tag, setTag] = useState("");
    const [validate, setValidate] = useState(false);

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

    const handleChange = e => {
      const newValue = e.target.value;  
      if (newValue.trim().length > 1) {
          setValidate(false);
      }
      setTag(newValue);
  };

    const handleAddTag = () => {
      // validate
      props.authCheckAgent();
      setValidate(false);
      if (tag.length < 1) {
        setValidate(true);
        return;
      }
      postJson ("api/data/addtagforfileupload/" + uploadId, tag, getAuthorizationHeader()).then ( (data) => {
          setEnableTagDialog(false);
      }).catch (function(error) {
          axiosError(error, null, setAlertDialogInput);
          setEnableTagDialog(false);
        }
      );
    }

    const sendEmail = (errorId) => {
      props.authCheckAgent();
      postJson ("api/data/senderrorreport/" + errorId, null, getAuthorizationHeader()).then ( (data) => {
          console.log ("reported the errors");
      }).catch (function(error) {
          axiosError(error, null, setAlertDialogInput);
          setEnableTagDialog(false);
      }
    );
    }

    const deleteUpload = (uploadId) => {
        props.authCheckAgent();
        deleteJson ("api/data/deletefileupload/" + uploadId, getAuthorizationHeader()).then ( (data) => {
           navigate ("/glycans");
        }).catch (function(error) {
            axiosError(error, null, setAlertDialogInput);
            setEnableTagDialog(false);
        }
      );
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
              <Form>
                <Form.Group
                  as={Row}
                  controlId="tag"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Tag" className="required-asterik"/>
                    <Form.Control
                      type="text"
                      name="tag"
                      placeholder="Enter tag for all the glycans from this file"
                      value={tag}
                      required={true}
                      isInvalid={validate}
                      onChange={handleChange}
                    />
                    <Feedback message="Please enter a valid tag" />
                    </Col>
                </Form.Group>
                </Form>
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
            accessorFn: (row) => row.glycans.length - (row.existingCount ?? 0),
            header: '# of New Glycans',
            size: 10,
          },
          {
            accessorKey: 'existingCount',
            header: '# of Existing Glycans',
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
                <DeleteIcon onClick={()=> {
                    deleteUpload(row.original.id);
                }}/>
              </IconButton>
            </Tooltip>
            
          </Box>
        ),
        getRowId: (row) => row.id,
    });

    const tableDetail= useMaterialReactTable({
        columns: errorColumns,
        data: errorMessage ?? [],
        enableFilters: false,
        enableRowActions: true,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex'}}>
            <Tooltip title="Report error to developers">
              <IconButton>
                <ForwardToInboxIcon color="primary" onClick={() => {
                  sendEmail(row.original.id);
                }}/>
              </IconButton>
            </Tooltip>
          </Box>
        ),
        getRowId: (row) => row.id
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