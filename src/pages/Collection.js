import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getBlob, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Autocomplete, Container, TextField, Typography } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";
import MetadataTreeView from "../components/MetadataTreeView";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ScrollToTop } from "../components/ScrollToTop";

let idCounter = 1000;

const Collection = (props) => {
    const [searchParams] = useSearchParams();
    let collectionId = searchParams.get("collectionId");
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [validate, setValidate] = useState(false);
    const [validMetadata, setValidMetadata] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");
    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );

    const collection = {
        name: "",
        description: "",
        glycans: [],
        metadata: [],
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, collection);

    const [showGlycanTable, setShowGlycanTable] = useState(false);
    const [selectedGlycans, setSelectedGlycans] = useState([]);
    const [initialSelection, setInitialSelection] = useState({});
    const [enableAddMetadata, setEnableAddMetadata] = useState(false);

    const[categories, setCategories] = useState([]);
    const [options, setOptions] = useState([]);
    const [namespace, setNamespace] = useState(null);
    const [selectedMetadataValue, setSelectedMetadataValue] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);
    const [selectedDatatype, setSelectedDatatype]  = useState(null);

    const [isVisible, setIsVisible] = useState(false);

    const [downloadReport, setDownloadReport] = useState(null);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
    const [fileFormat, setFileFormat] = useState("GWS");
    const [glycanStatus, setGlycanStatus] = useState(null);
    const [tag, setTag] = useState(null);
    const [glycanStatusList, setGlycanStatusList] = useState([]);
    const [glycanTags, setGlycanTags] = useState([]);

    const glycanRef = useRef(null);
    const metadataRef = useRef(null);
    const handleClick = (ref) => {
        ref.current?.scrollIntoView({behavior: 'smooth'});
    };

    // Show button when page is scrolled upto given distance
    const toggleSaveVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    useEffect(() => {
        props.authCheckAgent();
        getCategories();
        getStatusList();
        getGlycanTags();
        window.addEventListener("scroll", toggleSaveVisibility);
    }, []);

    useEffect(() => {
        if (collectionId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId]);

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

    function getCategories() {
        getJson ("api/metadata/getcategories", getAuthorizationHeader()).then (({ data }) => {
            setCategories(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const onInputChange = (event, value, reason) => {
        if (value) {
          getTypeAhead(value);
          setSelectedMetadataValue(value);
        } else { 
          setOptions([]);
        }
    };

    const handleDatatypeSelection = (event, itemId, isSelected) => {
        if (isSelected && typeof itemId === 'number') {  // datatype selected
            // find namespace of the datatype and display appropriate value field
            // locate the datatype
            categories.map ((element) => {
                if (element.dataTypes) {
                    var datatype = element.dataTypes.find ((item) => item.datatypeId === itemId);
                    if (datatype) {
                        setSelectedDatatype(datatype);
                        setNamespace (datatype.namespace.name);
                        return;
                    }
                }
            });
            // clear input value
            //setSelectedMetadataValue("");
            setOptions([]);
            setSelectedOption(null);
            setValidMetadata(false);
        }
    }

    const getTypeAhead =  (searchTerm) => {
        getJson ("api/util/gettypeahead?namespace=" + namespace + "&limit=10&value=" + searchTerm, 
                getAuthorizationHeader()).then (({ data }) => {
            setOptions(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const fetchData = async () => {
        setShowLoading(true);
        getJson ("api/data/getcollection/" + collectionId, getAuthorizationHeader())
            .then ((json) => {
                setUserSelection (json.data.data);
                if (json.data.data.glycans) {
                    setSelectedGlycans (json.data.data.glycans);
                    let initialIds = {};
                    json.data.data.glycans.forEach ((glycan) => {
                        initialIds[glycan.glycanId] = true;
                    });
                    setInitialSelection(initialIds);
                }
                setShowLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setShowLoading(false);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                setShowLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue && newValue.trim().length > 1) {
            setValidate(false);
            setError(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        if (userSelection.name === "" || userSelection.name.trim().length < 1) {
            setValidate(true);
            setError(true);
            return;
        }

        const metadata = [];
        userSelection.metadata.map ((m) => {
            if (m.new) {
                m.metadataId = null;
            }
            metadata.push(m);
        });

        const collection = { 
            collectionId: collectionId ? collectionId : null,
            name: userSelection.name,
            description: userSelection.description,
            glycans: userSelection.glycans,
            metadata: metadata,
        }
        
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        let apiURL = collectionId ? "api/data/updatecollection" : "api/data/addcollection";

        postJson (apiURL, collection, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/collections");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
        e.preventDefault();
    }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'glytoucanID', 
            header: 'GlyTouCan ID',
            size: 50,
          },
          {
            accessorKey: 'cartoon',
            header: 'Image',
            size: 150,
            columnDefType: 'display',
            Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
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
          {
            accessorKey: 'mass', 
            header: 'Mass',
            size: 80,
            Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
          }
        ],
        [],
      );
    
    const metadatacolumns = useMemo(
    () => [
        {
        accessorKey: 'type.name', 
        header: 'Name',
        size: 50,
        id: 'name',
        },
        {
        accessorKey: 'type.description',
        header: 'Description',
        size: 100,
        },
        {
        accessorKey: 'value',
        header: 'Value',
        size: 150,
        },
    ],
    [],
    );

    const listGlycans = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getglycans"
                columns={columns}
                columnFilters={[{"id":"glytoucanID","value":"G"}]}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="dateCreated"
                rowSelection={true}
                rowSelectionChange={handleGlycanSelectionChange}
                rowId="glycanId"
            />
            </>
        );
    };

    const addMetadataForm = () => {
        return (
            <>
                <Row>
                    <Col md={6}>
                    <MetadataTreeView data={categories}
                        onItemSelectionToggle={handleDatatypeSelection}/>
                    </Col>
                    <Col md={6}>

                    
                        <Autocomplete
                            freeSolo
                            disabled={!namespace}
                            id="typeahead"
                            options={options}
                            onChange={(e, value) => {setSelectedOption(value);}}
                            onInputChange={onInputChange}
                            getOptionLabel={(option) => option}
                            style={{ width: 400 }}
                            renderInput={(params) => (
                            <TextField {...params} 
                                error={validMetadata} 
                                helperText={validMetadata ? validationMessage : ""}
                                disabled={!namespace} label="Value" variant="outlined" />
                            )}
                        />
                        
                    
                    </Col>
                </Row>
            </>
        )
    }

    const handleGlycanSelect = () => {
        console.log("selected glycans" + selectedGlycans);
        setTextAlertInput({"show": false, id: ""});
        const selected=[];
        selectedGlycans.forEach ((glycan) => {
            if (!glycan.glytoucanID || glycan.glytoucanID.length === 0) {
                // error, not allowed to select this for the collection
                setTextAlertInput ({"show": true, 
                    "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + glycan.glycanId + " is not added."
                });
                ScrollToTop();
            } else {
                selected.push (glycan);
            }
        });

        setUserSelection({"glycans": selected});
        let initialIds = {};
        selected.forEach ((glycan) => {
            initialIds[glycan.glycanId] = true;
        });
        setInitialSelection(initialIds);
        setShowGlycanTable(false);
    }

    const deleteFromTable = (id) => {
        var glycans = userSelection.glycans;
        const index = glycans.findIndex ((item) => item["glycanId"] === id);
        var updated = [
            ...glycans.slice(0, index),
            ...glycans.slice(index + 1)
        ];
        setUserSelection ({"glycans": updated});
        setSelectedGlycans(updated);
        let initialIds = {};
        updated.forEach ((glycan) => {
            initialIds[glycan.glycanId] = true;
        });
        setInitialSelection(initialIds);
    }

    const deleteMetadataFromTable = (id) => {
        var metadata = userSelection.metadata;
        const index = metadata.findIndex ((item) => item["metadataId"] === id);
        var updated = [
            ...metadata.slice(0, index),
            ...metadata.slice(index + 1)
        ];
        setUserSelection ({"metadata": updated});
    }

    const handleGlycanSelectionChange = (selected) => {
        // append new selections
        const previous = [...selectedGlycans];
        selected.forEach ((glycan) => {
            const found = selectedGlycans.find ((item) => item.glycanId === glycan.glycanId);
            if (!found) {
                previous.push (glycan);
            }
        })
        setSelectedGlycans(previous);
    }

    const handleAddMetadata = () => {
        console.log("adding metadata " + selectedMetadataValue);
        setTextAlertInput({"show": false, id: ""});
        if (selectedOption) {
            // get the canonical form
            getJson ("api/util/getcanonicalform?namespace=" + namespace + "&synonym=" + selectedMetadataValue,
                getAuthorizationHeader()).then ((data) => {
                if (data.data && data.data.data) {
                    const m = {
                        metadataId: idCounter,
                        new: true,
                        type: selectedDatatype,
                        value: data.data.data.label,
                        valueUri: data.data.data.uri,
                    }
                    addMetadata(m);
                }
            
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInput ({"show": true, "message": error.response.data.message });
                } else {
                    axiosError(error, null, setAlertDialogInput);
                }  
            });
        } else {
            const m = {
                metadataId: idCounter,
                new: true,
                type: selectedDatatype,
                value: selectedMetadataValue,
                valueUri: null,
            }
            addMetadata(m);
        }
    }

    const addMetadata = (m) => {
        idCounter++;
        var metadata = userSelection.metadata;
        if (metadata === null) 
            metadata = [];
        
        // check if the metadata already exists, if so, we need to check if it is allowed to be multiple
        if (!selectedDatatype.multiple) {
            const existing = metadata.find ((meta) => meta.type.name === selectedDatatype.name);
            if (existing) {
                setTextAlertInput ({"show": true, "message": "Multiple copies are not allowed for " + selectedDatatype.name});
                ScrollToTop();
                setEnableAddMetadata(false);
                return;
            }
        }

        setShowLoading(true);
        // validate the values
        postJson("api/util/ismetadatavalid", m).then ( (data) => {
            setShowLoading(false);
            // check if valid
            if (data.data.data) {
                metadata.push(m);
                var updated = [...metadata];
                setUserSelection ({"metadata": updated});
                setValidMetadata(false);
                setEnableAddMetadata(false);
            } else {
                // invalid
                setValidMetadata(true);
                setValidationMessage(data.data.message);
            }
            }).catch (function(error) {
            if (error && error.response && error.response.data) {
                ScrollToTop();
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableAddMetadata(false);
            }
        );
    }

    const handleChangeDownloadForm = e => {
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
    
        let url = "api/data/downloadcollectionglycans?filetype=" + fileFormat;
        if (glycanStatus) url += "&status=" + glycanStatus;
        if (tag) url += "&tag=" + tag;
        url += "&collectionid=" + collectionId;
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
                    onChange={handleChangeDownloadForm}
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
                  onChange={handleChangeDownloadForm}>
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
        <Container maxWidth="xl">
            <div className="page-container">
            <div className="scroll-to-top-save">
        {isVisible && (
            <div>
                <Button variant="contained" className="gg-btn-blue-sm" 
                    disabled={error} onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        )}
        </div>
             <PageHeading title={collectionId ? "Edit Collection" : "Add Collection"} subTitle="Please provide the information for the new collection." />
             {downloadReport &&
              displayDownloadReport()
            }
            <Card>
            <Card.Body>
            <div className="mt-4 mb-4">
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
            {showGlycanTable && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={showGlycanTable}
                    onHide={() => setShowGlycanTable(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Glycans:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listGlycans()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycanTable(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                     </Modal.Footer>
                </Modal>
            )}
            
            <ConfirmationModal
                showModal={enableAddMetadata}
                onCancel={() => {
                    setEnableAddMetadata(false);
                }}
                onConfirm={() => handleAddMetadata()}
                title={"Add Metadata"}
                body={addMetadataForm()}
            />
            <Form>
                <Form.Group
                  as={Row}
                  controlId="name"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name of the collection"
                      value={userSelection.name}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Name is required"></Feedback>
                    </Col>
                </Form.Group>
                
                {/* Description */}
                <Form.Group
                  as={Row}
                  controlId="description"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Description" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="description"
                      placeholder="Enter description"
                      value={userSelection.description}
                      onChange={handleChange}
                      required={false}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                </Col>
                </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Button onClick={()=> navigate("/collections")}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Collections</Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={handleSubmit}>
                    Submit
                </Button> 
            </div>
            <div className="text-center mb-2">
                <Button onClick={()=> handleClick(metadataRef)}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Metadata</Button>
                <Button className="gg-btn-outline mt-2 gg-ml-20" 
                    onClick={()=> handleClick(glycanRef)}>
                    Glycans
                </Button> 
            </div>
            </Card.Body>
          </Card>
          <Card ref={glycanRef} style={{marginTop: "15px"}}>
            <Card.Body>
            <h5 class="gg-blue" style={{textAlign: "left"}}>
                Glycans in the Collection</h5>
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setShowGlycanTable(true)}>
                         Add Glycan
                        </Button>
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20"
                           disabled={error || !collectionId} onClick={()=>setOpenDownloadDialog(true)}> 
                        Download
                </Button>
                        </div>
                    </Col>
                    </Row>
                
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "glytoucanID"
                    data = {userSelection.glycans}
                    columns={columns}
                    enableRowActions={true}
                    delete={deleteFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                />
            </Card.Body>
          </Card>
          <Card ref={metadataRef} style={{marginTop: "15px"}}>
            <Card.Body>
            <h5 class="gg-blue" style={{textAlign: "left"}}>
                Metadata</h5>
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setEnableAddMetadata(true)}>
                         Add Metadata
                        </Button>
                        </div>
                    </Col>
                    </Row>
                
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "metadataId"
                    data = {userSelection.metadata}
                    columns={metadatacolumns}
                    enableRowActions={true}
                    delete={deleteMetadataFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                />
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
};

export default Collection;