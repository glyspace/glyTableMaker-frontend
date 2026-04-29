import { Box, Container, IconButton, Tooltip } from "@mui/material";
import FeedbackWidget from "../components/FeedbackWidget";
import { FormLabel, PageHeading } from "../components/FormControls";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import Table from "../components/Table";
import { useEffect, useMemo, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { useNavigate } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Loading } from "../components/Loading";
import AutoTextInput from "../components/AutoTextInput";

const Dataset = (props) => {

    let navigate = useNavigate();

    useEffect(props.authCheckAgent, []);

    useEffect(() => {
        // load existing users
        getJson ("api/account/getusers", getAuthorizationHeader()).then ( (json) => {
            setUsers(json.data.data.objects);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                console.log("Failed to get list of existing users");
            } else {
              axiosError(error, null, props.setAlertDialogInput);
            }
          });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [openTransferDialog, setOpenTransferDialog] = useState(false);
    const [openTransferCancel, setOpenTransferCancel] = useState(false);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [users, setUsers] = useState([]);
    const [transferRequestSuccess, setTransferRequestSuccess] = useState(null);
    const [showLoading, setShowLoading] = useState(false);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'datasetIdentifier', 
            header: 'ID',
            size: 50,
          },
          {
            accessorKey: 'name',
            header: 'Name',
            size: 100,
          },
          {
            accessorKey: 'noGlycans',
            header: '# Glycans',
            size: 30,
            id: "glycanNo",
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            accessorKey: 'noProteins',
            header: '# Proteins',
            id: "proteinNo",
            size: 30,
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            accessorKey: 'license.name', 
            header: 'License',
            id: "license",
            size: 100,
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            accessorFn: (row) => row.removed ? "removed" : row.retracted ? "retracted" : "published",
            header: 'Status',
            id: "retracted",
            size: 100,
            enableColumnFilter: false,
            enableSorting: false,
            Cell: ({ renderedCellValue, row }) => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                  {(renderedCellValue === "retracted" || renderedCellValue === "removed") ? <span style={{color: "red"}}>{renderedCellValue}</span>
                  : <span>{renderedCellValue}</span>
                  }
                </Box>
            ),
          },
        ],
        [],
    );
    
    const saveColumnVisibilityChanges = (columnVisibility) => {
        var columnSettings = [];
        for (var column in columnVisibility) {
            columnSettings.push ({
            "tableName": "DATASET",
            "columnName": column,
            "visible" :  columnVisibility[column] ? true: false,
            });
        }
        postJson ("api/setting/updatecolumnsetting", columnSettings, getAuthorizationHeader()).then (({ data }) => {
            console.log ("saved visibility settings");
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const transfer = (dataset) => {
      setTextAlertInput({show: false, id: ""});
      setSelectedDataset(dataset);
      if (dataset.transferRequested) {
        // there is already a transfer request, do you want to cancel it
        setOpenTransferCancel (true);
      } else {
        // open dialog to show user list and dataset details
        setTransferRequestSuccess(null);
        setOpenTransferDialog(true);
      }
    }

    const deleteTransferRequest = () => {
      setShowLoading(true);
      setTextAlertInput({show: false, id: ""});
      if (!selectedDataset) {
        setTextAlertInput ({"show": true, "id" : "", 
          "message": "Dataset must be selected to cancel transfer request!"});
        setOpenTransferCancel(false);
        return;
      }
      const url = "api/dataset/canceltransferrequest";
      const body = {"datasetIdentifier" : selectedDataset.datasetIdentifier}
      postJson (url, body, getAuthorizationHeader()).then ( (data) => {
          setOpenTransferCancel(false);
          setShowLoading(false);
      }).catch(function(error) {
        if (error && error.response && error.response.data) {
            // duplicate
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
        setOpenTransferCancel(false);
      }); 
    }

    const submitTransferRequest = () => {
      setShowLoading(true);
      setTransferRequestSuccess(null);
      setTextAlertInput({show: false, id: ""});
      if (!selectedDataset || !selectedUser || selectedUser === "") {
        setTextAlertInput ({"show": true, "id" : "", 
          "message": "Dataset and user must be selected for transfer requests!"});
        setOpenTransferDialog(false);
        return;
      }
      const url = "api/dataset/transferdatasetrequest";
      const body = {"userName" : selectedUser, "datasetIdentifier" : selectedDataset.datasetIdentifier}
      postJson (url, body, getAuthorizationHeader()).then ( (data) => {
          setTransferRequestSuccess("Transfer request has been sent to the selected user successfully!")
          setOpenTransferDialog(false);
          setShowLoading(false);
      }).catch(function(error) {
        if (error && error.response && error.response.data) {
            // duplicate
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
        setOpenTransferDialog(false);
        setShowLoading(false);
      }); 
    }

   const handleChange = e => {
      const value = e.target.value;
      setSelectedUser(value || null);
    };

    const transferForm = () => {
      return (
      <>
        <Form>
          <Form.Group
            as={Row}
            controlId="user"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="User" className="required-asterik"/>
              <AutoTextInput
                length={100}
                placeholder="Start typing user's firsname, lastname or email"
                inputValue={selectedUser}
                setInputValue={(value) => setSelectedUser(value)}
                typeahedID="user"
              />
            </Col>
          </Form.Group>
        </Form>
      </>)
    }
    
    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Your public datasets"
                  subTitle="The table below displays the list of your public datasets. New datasets may be added, existing datasets can be edited​
and retracted."
              />
              <TextAlert alertInput={textAlertInput}/>
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <div className={`alert-success ${transferRequestSuccess ? "alert" : ""}`}>
                <strong>{transferRequestSuccess}</strong>
              </div>
              <ConfirmationModal
                  showModal={openTransferDialog}
                  onCancel={() => {
                    setOpenTransferDialog(false);
                  }}
                  onConfirm={() => submitTransferRequest()}
                  title={"Transfer Dataset to selected user"}
                  body={transferForm()}
                />

              <ConfirmationModal
                  showModal={openTransferCancel}
                  onCancel={() => {
                    setOpenTransferCancel(false);
                  }}
                  onConfirm={() => deleteTransferRequest()}
                  title={"Cancel transfer request"}
                  body={"There is a pending transfer request for this dataset. Do you wish to cancel the request?"}
                />
              <Card>
                <Card.Body>
                    <div className="text-center mb-4">
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.publishdataset)}>
                Publish new dataset
                </Button>
              </div>
              <Loading show={showLoading}></Loading>
              <Table
                  authCheckAgent={props.authCheckAgent}
                  ws="api/dataset/getdatasets"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  edit={stringConstants.routes.publishdataset + "?datasetid="}
                  deletews="api/dataset/retractdataset/"
                  recoverws="api/dataset/recoverdataset/"
                  transfer={transfer}
                  initialSortColumn="name"
                  rowId="datasetIdentifier"
                  detailPanel={true}
                  deletelabel="Retract"
                  columnsettingsws="api/setting/getcolumnsettings?tablename=DATASET"
                  saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
    );
}

export default Dataset;