import { Box, IconButton, Tooltip } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useReducer, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HistoryIcon from '@mui/icons-material/History';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import PendingIcon from '@mui/icons-material/Pending';
import { Alert, Button, Card, Container, Modal, Row } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from '../components/DialogAlert';
import { ConfirmationModal } from "../components/ConfirmationModal";
import Tag from "../components/Tag";
import FeedbackWidget from "../components/FeedbackWidget";

const FileUpload = (props) => {
    useEffect(props.authCheckAgent, []);
    const navigate = useNavigate();

    const [batchUploads, setBatchUploads] = useState([]);
    const [error, setError] = useState("");
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
    const [enableReportSent, setEnableReportSent] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
      fetchData();
    }, []);
  
    const fetchData = async () => {
      getJson ("api/data/checkbatchupload?type=" + props.type, getAuthorizationHeader()).then ( (json) => {
        setBatchUploads(json.data.data);
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
          if  (error.response.data["code"] === 404 || error.response.status === 404) {
            console.log ("no active batch upload");
          } else {
            setError("Failed to get most recent batch upload");
          }
        } else {
          axiosError(error, null, props.setAlertDialogInput);
        }
      });
    }
    
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

    const sendEmail = (errorId, isError) => {
      props.authCheckAgent();
      setEnableReportSent(false);
      postJson ("api/data/senderrorreport/" + errorId + "?isUpload=" + !isError, null, getAuthorizationHeader()).then ( (data) => {
          console.log ("reported the errors");
          setEnableReportSent(true);
      }).catch (function(error) {
          axiosError(error, null, setAlertDialogInput);
      }
    );
    }

    const deleteUpload = (uploadId) => {
        props.authCheckAgent();
        deleteJson ("api/data/deletefileupload/" + uploadId, getAuthorizationHeader()).then ( (data) => {
           fetchData();
        }).catch (function(error) {
            axiosError(error, null, setAlertDialogInput);
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
              <Tag validate={validate}
                setValidate={setValidate}
                setTag={setTag}
                setAlertDialogInput={setAlertDialogInput}
                gettagws="api/data/getglycantags"
              />
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
                {row.original.status==="WAITING" && <HistoryIcon color="primary"/>}
              </Box>
            ),
          },
          {
            accessorKey: 'filename',
            header: 'Original File Name',
            size: 100,
          },
          {
            accessorFn: (row) => row.glycans.length - (row.existingCount ?? 0) ,
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

    const glycoproteincolumns = useMemo ( 
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
              {row.original.status==="PROCESSING" &&  <Tooltip title="Still processing"><HourglassTopIcon color="primary"/></Tooltip>}
              {row.original.status==="WAITING" && <Tooltip title="Waiting for glycan registration"><PendingIcon color="primary"/></Tooltip>}
            </Box>
          ),
        },
        {
          accessorKey: 'filename',
          header: 'Original File Name',
          size: 100,
        },
        {
          accessorFn: (row) => row.glycoproteins.length - (row.existingCount ?? 0) ,
          header: '# of New Glycoproteins',
          size: 10,
        },
        {
          accessorKey: 'existingCount',
          header: '# of Existing Glycoproteins',
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
                header: 'Sequence (if any)',
                size: 200,
              },
        ],
        [],
    );

    const table = useMaterialReactTable({
        columns: props.type === "GLYCOPROTEIN" ? glycoproteincolumns : columns,
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
              <IconButton color="primary" disabled={row.original.status==="PROCESSING" || row.original.status === "WAITING"}>
                <NoteAddIcon
                onClick={() => {
                  setEnableTagDialog (true);
                  setUploadId(row.original.id);
                }}/>
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton color="error" disabled={row.original.status==="PROCESSING" || row.original.status === "WAITING"}>
                <DeleteIcon 
                onClick={()=> {
                    setUploadId (row.original.id);
                    //deleteUpload(row.original.id);
                    setShowDeleteModal(true);
                }}/>
              </IconButton>
            </Tooltip>
            {(row.original.status==="PROCESSING" || row.original.status === "WAITING" ) && 
            <Tooltip title="Report error to developers">
            <IconButton color="primary">
              <ForwardToInboxIcon  onClick={() => {
                sendEmail(row.original.id, false);
              }}/>
            </IconButton>
          </Tooltip>
            }
            
          </Box>
        ),
        getRowId: (row) => row.id,
        muiToolbarAlertBannerProps: error
          ? {
              color: 'error',
              children: 
                <div>
                <Row>Error loading data</Row>
                <Row>{errorMessage}</Row>
              </div>,
            }
          : undefined,
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
                  sendEmail(row.original.id, true);
                }}/>
              </IconButton>
            </Tooltip>
          </Box>
        ),
        getRowId: (row) => row.id
    });

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        {enableErrorView && errorMessageTable()}
        {enableTagDialog && openAddTagDialog()}

        <ConfirmationModal
            showModal={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={() => {
              deleteUpload (uploadId);
              setShowDeleteModal (false);
            }}
            title="Confirm Delete"
            body="Are you sure you want to delete this file upload? You will loose the ability to tag the glycans (as a group) uploaded from this file!"
        />
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
            <Alert variant="success" show={enableReportSent} className="alert-message line-break-1">
                The report is sent successfully!
            </Alert>
            <Card>
            <Card.Body>
            <MaterialReactTable table={table}/>
            <div className="text-center mb-2" style={{marginTop:"5px"}}>
                <Button onClick={()=> navigate(props.type === "GLYCOPROTEIN" ? "/glycoproteins" : "/glycans")} 
                  className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to {props.type === "GLYCOPROTEIN" ? 'Glyocproteins' : 'Glycans'}</Button>
            </div>
            </Card.Body>
            </Card>
            </div>
        </Container>
        </>
    )
};

export { FileUpload };