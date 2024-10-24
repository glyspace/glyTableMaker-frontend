import { useMemo, useEffect, useState, useReducer } from 'react';
import Container from "@mui/material/Container";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { FormLabel, PageHeading } from "../components/FormControls";
import { Link } from "react-router-dom";
import { NavDropdown, Nav } from "react-bootstrap";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import stringConstants from '../data/stringConstants.json';
import DialogAlert from '../components/DialogAlert';
import { StatusMessage } from '../components/StatusMessage';
import Table from '../components/Table';
import { getAuthorizationHeader, getBlob, getJson } from '../utils/api';
import { axiosError } from '../utils/axiosError';
import { Loading } from '../components/Loading';
import { ConfirmationModal } from '../components/ConfirmationModal';
import FeedbackWidget from "../components/FeedbackWidget";
import TextAlert from '../components/TextAlert';
import { postJson } from '../utils/api';

const Glycans = (props) => {
  const [infoError, setInfoError] = useState("");
  const [glytoucanHash, setGlytoucanHash] = useState("");
  const [date, setDate] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [showLoading, setShowLoading] = useState(false);

  const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
  );

  const [batchUpload, setBatchUpload] = useState(false);
  const [downloadReport, setDownloadReport] = useState(null);
  const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
  const [fileFormat, setFileFormat] = useState("GWS");
  const [glycanStatus, setGlycanStatus] = useState(null);
  const [tag, setTag] = useState(null);
  const [glycanStatusList, setGlycanStatusList] = useState([]);
  const [glycanTags, setGlycanTags] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps 
  useEffect(props.authCheckAgent, []);

  useEffect (() => {
    getStatusList();
    getGlycanTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveColumnVisibilityChanges = (columnVisibility) => {
    var columnSettings = [];
    for (var column in columnVisibility) {
      columnSettings.push ({
        "tableName": "GLYCAN",
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

  function getStatusList() {
    getJson ("api/util/getregistrationstatuslist").then (({ data }) => {
        setGlycanStatusList(data.data);
    }).catch(function(error) {
        axiosError(error, null, setAlertDialogInput);
    });
  }

  function getGlycanTags() {
    getJson ("api/data/getglycantags", getAuthorizationHeader()).then (({ data }) => {
        setGlycanTags(data.data);
    }).catch(function(error) {
        axiosError(error, null, setAlertDialogInput);
    });
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'glytoucanID', 
        header: 'GlyTouCan ID',
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: 'cartoon',
        header: 'Image',
        size: 150,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
      },
      {
        accessorKey: 'mass', 
        header: 'Mass',
        size: 80,
        Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
      },
      {
        accessorKey: 'glycanCollections.length',
        header: '# Collections',
        id: "collectionNo",
        size: 30,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: 'information',
        header: 'Error',
        size: 150,
        enableColumnFilter: false,
        Cell: ({ row }) => (
          (row.original.error) &&

          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Error">
              <IconButton onClick={() => {
                  setGlytoucanHash(row.original.glytoucanHash);
                  setDate(row.original.dateCreated);
                  setInfoError(row.original.error);
                  setShowInfoModal(true);}}>
                <InfoIcon style={{ color: '#2f78b7' }}/>
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
      {
        accessorFn: (row) => row.tags.map(tag => tag.label),
        header: 'Tags',
        id: "tags",
        size: 100,
        Cell: ({ cell }) => (
          <ul id="tags">
                {cell.getValue() && cell.getValue().length > 0 && cell.getValue().map((tag, index) => (
                <li key={index} className="tag_in_table">
                    <span className='tag-title'>{tag}</span>
                </li>
                ))}
            </ul>
        ),
      },
    ],
    [],
  );

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;
    setTextAlertInput({"show": false, id: ""});

    if (name === "type") {
      setFileFormat(newValue);
    } else if (name === "status") {
      if (newValue && newValue.length > 0)
        setGlycanStatus(newValue);
    } else if (name === "tag") {
      if (newValue && newValue.length > 0)
        setTag(newValue);
    }
};

  const download = () => {
    setShowLoading(true);
    setTextAlertInput({"show": false, id: ""});

    let url = "api/data/downloadglycans?filetype=" + fileFormat;
    if (glycanStatus) url += "&status=" + glycanStatus;
    if (tag) url += "&tag=" + tag;
    getBlob (url, getAuthorizationHeader()).then ( (data) => {
        const contentDisposition = data.headers.get("content-disposition");
        const fileNameIndex = contentDisposition.indexOf("filename=") + 10;
        const fileNameEndIndex = contentDisposition.indexOf(":");
        const fileName = contentDisposition.substring(fileNameIndex, fileNameEndIndex);
        const reportId = contentDisposition.substring(fileNameEndIndex+1, contentDisposition.length - 1);

        //   window.location.href = fileUrl;
        var fileUrl = URL.createObjectURL(data.data);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = fileUrl;
        a.download = fileName;
        a.click();

        window.URL.revokeObjectURL(fileUrl);
        getDownloadReport(reportId);
        setShowLoading(false);
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
            //setTextAlertInput ({"show": true, "message": error.response.data.message });
            // read blob as json
            error.response.data.text().then( (resp) => {
                const { message } = JSON.parse (resp);
                getDownloadReport(message);
            });
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
        setShowLoading(false);
      }
    );
    setOpenDownloadDialog(false);    
}

const getDownloadReport = (reportId) => {
    //get the report with reportId
    getJson ("api/table/getreport/" + reportId, getAuthorizationHeader()).then ((data) => {
        setDownloadReport (data.data.data);
    }).catch (function(error) {
        if (error && error.response && error.response.data) {
            setTextAlertInput ({"show": true, "message": error.response.data.message });
        } else {
            axiosError(error, null, setAlertDialogInput);
        }  
    });
}

  const displayDownloadReport = () => {
    return (
        <>
        <div style={{ marginTop: "15px"}}/>
        <Typography variant="h6" color={downloadReport.success ? "": "red"}>{downloadReport.message}</Typography>
        <div>
        {downloadReport.errors && "Errors:"}  
        {downloadReport.errors && downloadReport.errors.map ((error) => {
                    return <li>{error}</li>
                })
        }
        {downloadReport.warnings && "Warnings:"}  
        {downloadReport.warnings && downloadReport.warnings.map ((warning) => {
                    return <li>{warning}</li>
                })
        }
        </div>
        </>
    )
  };

  const downloadForm = () => {
    return (
    <>
      <Form>
        <Form.Group
          as={Row}
          controlId="fileType"
          className="gg-align-center mb-3"
        >
          <Col xs={12} lg={9}>
            <FormLabel label="File Type" className="required-asterik"/>
            <Form.Select
                as="select"
                name="type"
                onChange={handleChange}
              >
                <option key={0} value="GWS">
                      Glycoworkbench
                </option>
                <option key={1} value="EXCEL">
                      EXCEL
                </option>
              </Form.Select>
          </Col>
        </Form.Group>
        <Form.Group
          as={Row}
          controlId="status"
          className="gg-align-center mb-3"
        >
          <Col xs={12} lg={9}>
            <FormLabel label="Status"/>
            <Form.Select
              as="select"
              name="status"
              onChange={handleChange}>
                  <option key="select" value="">
                      Select
                  </option>
                  {glycanStatusList && glycanStatusList.map((n , index) =>
                      <option
                      key={index}
                      value={n}>
                      {n}
                      </option>
                  )}
          </Form.Select>
          </Col>
        </Form.Group>
        <Form.Group
          as={Row}
          controlId="tag"
          className="gg-align-center mb-3"
        >
          <Col xs={12} lg={9}>
            <FormLabel label="Tag"/>
            <Form.Select
              as="select"
              name="tag"
              onChange={handleChange}>
                  <option key="select" value="">
                      Select
                  </option>
                  {glycanTags && glycanTags.map((n , index) =>
                      <option
                      key={index}
                      value={n.label}>
                      {n.label}
                      </option>
                  )}
          </Form.Select>
          </Col>
        </Form.Group>
        </Form>
        </>
      );
  };

  return (
    <>
    <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
    <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
              title="Your Glycans"
              subTitle="The table below displays a list of all glycans that have been uploaded. New glycans may be added, old glycans can be edited, and unused glycans can
              be removed."
          />
          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
          <ConfirmationModal
            showModal={openDownloadDialog}
            onCancel={() => {
              setOpenDownloadDialog(false);
            }}
            onConfirm={() => download()}
            title={"Download Glycans"}
            body={downloadForm()}
          />
          <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showInfoModal}
            onHide={() => setShowInfoModal(false)}
          >
            <Modal.Header closeButton className= "alert-dialog-title">
              <Modal.Title id="contained-modal-title-vcenter" >
                Glytoucan Registration Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>{infoError ? 
              "Glycan is submitted to Glytoucan on " + date + 
              ". Registration failed with the following error: " + infoError : glytoucanHash ? 
              "Glycan is submitted to Glytoucan on " + date + 
              ". Glytoucan assigned temporary hash value: " + glytoucanHash : ""} </Modal.Body>
            <Modal.Footer>
            <Button className="gg-btn-blue-reg" onClick={() => setShowInfoModal(false)}>
              OK
            </Button>
            </Modal.Footer>
          </Modal>  
          {downloadReport &&
              displayDownloadReport()
          }
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
              <Nav className={ "gg-dropdown-nav"} style={{display:"inline-block", borderRadius:".5rem"}} >
                  <div
                    type="button"
                    className="gg-btn-blue-sm gg-dropdown-btn"
                    style={{
                      marginLeft: "0px"
                    }}>
                      <span style={{display:"inline-block"}}>
                        <NavDropdown
                          className={ "gg-dropdown-navbar gg-dropdown-navitem"}
                          style={{display:"inline-block", padding: "0px !important"}}
                          title="Add a Glycan"
                          id="gg-dropdown-navbar1"
                        >
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=sequence`}>
                            Sequence
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=glytoucan`}>
                            GlyTouCan ID
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=composition`}>
                            Composition
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=draw`}>
                            Draw Glycan
                          </NavDropdown.Item>
                        </NavDropdown>
                      </span>
                  </div>
                </Nav>

                <Nav className={ "gg-dropdown-nav"} 
                  style={{display:"inline-block", borderRadius:".5rem"}} 
                  disabled={batchUpload}>
                  <div
                    type="button"
                    className="gg-btn-blue-sm gg-dropdown-btn"
                    style={{
                      marginLeft: "5px"
                    }}>
                      <span  style={{display:"inline-block"}}>
                        <NavDropdown
                          className={ "gg-dropdown-navbar gg-dropdown-navitem"}
                          style={{display:"inline-block", padding: "0px !important"}}
                          title="Add Glycan(s) from File"
                          id="gg-dropdown-navbar2"
                        >
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycanfromfile}?type=gws`}>
                            Glycoworkbench File (.gws)
                          </NavDropdown.Item>
                        </NavDropdown>
                      </span>
                  </div>
                </Nav>
                <Button variant="contained" className="gg-btn-blue-sm" style={{marginLeft:"5px", marginTop:"-1px"}}
                    onClick={()=>setOpenDownloadDialog(true)}> 
                        Download
                </Button>
                <StatusMessage
                  ws="api/data/checkbatchupload"
                  pageURL={stringConstants.routes.upload}
                  setBatchUpload={setBatchUpload}
                  setAlertDialogInput={setAlertDialogInput}/>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getglycans"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  deletews="api/data/deleteglycan/"
                  addtagws="api/data/addglycantag/"
                  gettagws="api/data/getglycantags"
                  initialSortColumn="dateCreated"
                  rowId="glycanId"
                  detailPanel={true}
                  columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCAN"
                  saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </Card.Body>
          </Card>
       </div>
       <Loading show={showLoading}></Loading>
     </Container>
    </>
  )
}

export default Glycans;