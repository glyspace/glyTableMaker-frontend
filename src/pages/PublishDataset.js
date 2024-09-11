import { Container } from "@mui/material";
import FeedbackWidget from "../components/FeedbackWidget";
import { Accordion, AccordionContext, Button, Card, Col, Form, Modal, Row, useAccordionButton } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useMemo, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { PublicationCard } from "../components/PublicationCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

const PublishDataset = (props) => {
    const [searchParams] = useSearchParams();
    let datasetId = searchParams.get("datasetId");
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInputLicense, setTextAlertInputLicense] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const dataset = {
        name: "",
        description: "",
        collections: [],
    };

    const [publications, setPublications] = useState([]);

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, dataset);

    const [showCollectionTable, setShowCollectionTable] = useState(false);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const [showLicenseDialog, setShowLicenseDialog] = useState(false);

    const [licenseOptions, setLicenseOptions] = useState([]);
    const [selectedLicense, setSelectedLicense] = useState(-1);

    // Show button when page is scrolled upto given distance
    const toggleSaveVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    function CustomToggle({ children, eventKey }) {
        const currentEventKey = useContext(AccordionContext);
        const decoratedOnClick = useAccordionButton(eventKey, () =>
          console.log("toggle")
        );
        const isCurrentEventKey = currentEventKey.activeEventKey === eventKey;

        return (
            <FontAwesomeIcon
            icon={["fas", isCurrentEventKey ? "angle-up" : "angle-down"]}
            size="1x"
            title="Collapse and Expand"
            onClick={decoratedOnClick}
            className={"font-awesome-color"}
            >
            {children}
            </FontAwesomeIcon>
        );
    }

    useEffect(() => {
        props.authCheckAgent();
        window.addEventListener("scroll", toggleSaveVisibility);
        getLicenseOptions();
    }, []);

    const getLicenseOptions = () => {
        getJson ("api/util/licenses").then (({ data }) => {
            if (data.data) {
                setLicenseOptions(data.data);
                setSelectedLicense(data.data.find ((l) => l.id === 5));
            }
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
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
        setTextAlertInput({"show": false, id: ""});

        if (userSelection.name === "" || userSelection.name.trim().length < 1) {
            setValidate(true);
            setError(true);
            return;
        }

        if (userSelection.collections.length < 1) {
            setError(true);
            setTextAlertInput({"show": true, "message": "At least one collection should be added before publishing the dataset"});
            return;
        }

        let valid = true;
        userSelection.collections.forEach ((collection) => {
            if (collection.errors && collection.errors.length > 0) {
                valid = false;
            }
        });
        
        if (!valid) {
            setError(true);
            setTextAlertInput({"show": true, "message": "There are errors in the selected collections. Dataset cannot be published!"});
            return;
        }

        setShowLicenseDialog (true);
    }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'name', 
            header: 'Name',
            size: 50,
          },
          {
            accessorFn: (row) => row.glycans.length, 
            header: '# Glycans',
            size: 25,
          },
          {
            accessorFn: (row) => row.description,
            header: 'Description',
            size: 200,
          },
        ],
        [],
    );

    const tableColumns = useMemo (
        () => [
            {
              accessorKey: 'name', 
              header: 'Name',
              size: 50,
            },
            {
              accessorFn: (row) => row.glycans ? row.glycans.length : 0, 
              header: '# Glycans',
              size: 25,
            },
            {
              accessorKey: 'errors',
              header: 'Errors',
              size: 200,
              Cell: ({ cell }) => (
                <ul id="errors">
                      {cell.getValue() && cell.getValue().length > 0 && cell.getValue().map((err, index) => (
                      <li key={index}>
                          <span>{err.message}</span>
                      </li>
                      ))}
                  </ul>
              ),
            },
            {
                accessorKey : 'warnings',
                header: 'Warnings',
                size: 200,
                Cell: ({ cell }) => (
                    <ul id="warnings">
                          {cell.getValue() && cell.getValue().length > 0 && cell.getValue().map((err, index) => (
                          <li key={index}>
                              <span>{err.message}</span>
                          </li>
                          ))}
                      </ul>
                  ),
              },
          ],
          [],
    );

    const listCollections = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/dataset/getcollections"
                columns={columns}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="name"
                rowSelection={true}
                rowSelectionChange={handleCollectionSelectionChange}
                rowId="collectionId"
            />
            </>
        );
    };

    const handleLicenseChange = e => {
        const licenseId = e.target.value;
        const newLicense = licenseOptions.find ((l) => l.id.toString() === licenseId);
        setSelectedLicense (newLicense);
    }

    const listLicenseOptions = () => {
        return (
            <>
            <TextAlert alertInput={textAlertInputLicense}/>
            <Row>
            <Col>
            <Form.Select
                    as="select"
                    name="license"
                    required={true}
                    onChange={handleLicenseChange}
                >
                    {licenseOptions && licenseOptions.map((l , index) =>
                        <option
                        selected={l.id === selectedLicense.id}
                        key={index}
                        value={l.id}>
                        {l.name}
                        </option>
                    )}
                </Form.Select>
                 <Feedback message="License is required"></Feedback>
            </Col>
            <Col>
                <Form.Group
                  as={Row}
                  controlId="name"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={12} style={{ textAlign: "left" }}>
                    <FormLabel label={selectedLicense.name}/>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  controlId="attribution"
                  className="gg-align-center mb-3"
                >
                  <Col xs={4} lg={4} style={{ textAlign: "left" }}>
                    <FormLabel label="Attribution"/>
                  </Col>
                  <Col xs={8} lg={8}>
                  <Form.Label>{selectedLicense.attribution}</Form.Label>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  controlId="distribution"
                  className="gg-align-center mb-3"
                >
                  <Col xs={4} lg={4} style={{ textAlign: "left" }}>
                    <FormLabel label="Distribute, remix, ​adapt and build upon"/>
                  </Col>
                  <Col xs={8} lg={8}>
                  <Form.Label>{selectedLicense.distribution}</Form.Label>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  controlId="commercial"
                  className="gg-align-center mb-3"
                >
                  <Col xs={4} lg={4} style={{ textAlign: "left" }}>
                    <FormLabel label="Commercial Use"/>
                  </Col>
                  <Col xs={8} lg={8}>
                  <Form.Label>{selectedLicense.commercialUse ? "Allowed" : "Not Allowed"}</Form.Label>
                  </Col>
                </Form.Group>
                <Form.Group
                  as={Row}
                  controlId="url"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={12}>
                  <a
                    href={selectedLicense.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedLicense.url}
                  </a>
                  </Col>
                </Form.Group>
            </Col>
            </Row>
            </>
        )
    }

    const populateCollectionData = (colList, pubList) => {
        let nextSelectedCollections = [...colList];
        let nextPublications = [...pubList];
        nextSelectedCollections.forEach ((collection) => {
            if (collection.metadata) {
                collection.metadata.forEach ((metadata) => {
                    if (metadata.type.datatypeId === 2 || metadata.type.name === "Evidence") {
                        const publicationIdentifier = metadata.value;
                        // get the publication details
                        getJson ("api/util/getpublication?identifier=" + publicationIdentifier).then (({ data }) => {
                            const found = nextPublications.find ((p) => p.id === data.data.id);
                            if (!found) {
                                nextPublications.push (data.data);
                            }
                            setPublications([...nextPublications]);
                        }).catch(function(error) {
                            axiosError(error, null, setAlertDialogInput);
                        });
                        
                    }
                })
            }
            /*getJson ("api/dataset/checkcollectionforerrors?collectionid=" + collection.collectionId,
                getAuthorizationHeader()).then (({ data }) => {
                    let errors = [];
                    let warnings = [];
                    if (data.data) {
                        data.data.forEach ((err) => {
                            if (err.errorLevel == 0) {
                                warnings.push (err.message);
                            } else {
                                errors.push (err.message);
                            }
                        })
                    }
                    collection["errors"] = errors;
                    collection["warnings"] = warnings;
                    setSelectedCollections(nextSelectedCollections);
                }).catch(function(error) {
                    axiosError(error, null, setAlertDialogInput);
                });*/
        });
        
    } 

    const handleCollectionSelect = () => {
        setTextAlertInput({"show": false, id: ""});
        setUserSelection({"collections": selectedCollections});
        setShowCollectionTable(false);
        populateCollectionData(selectedCollections, publications);
    }

    const deleteFromTable = (id) => {
        var collections = userSelection.collections;
        const index = collections.findIndex ((item) => item["collectionId"] === id);
        var updated = [
            ...collections.slice(0, index),
            ...collections.slice(index + 1)
        ];
        setUserSelection ({"collections": updated});
        setSelectedCollections(updated);
        setPublications([]);
        populateCollectionData(updated, []);
    }

    const handleCollectionSelectionChange = (selected) => {
        setTextAlertInput({"show": false, id: ""});
        // append new selections
        const previous = [...selectedCollections];
        selected.forEach ((collection) => {
            const found = selectedCollections.find ((item) => item.collectionId === collection.collectionId);
            if (!found) {
                previous.push (collection);
            }
        })
        setSelectedCollections(previous);
    }

    const handlePublish = () => {
        setTextAlertInputLicense({"show": false, "message" : ""});
        if (!selectedLicense) {
            // error
            setTextAlertInputLicense ({"show": true, "message": "License must be selected before publishing!"})
            return;
        }
        setShowLoading(true);
        const dataset = {
            "name": userSelection.name,
            "description": userSelection.description,
            "collections": userSelection.collections,
            "license": selectedLicense,
        };
        //publish the dataset
        postJson ("api/dataset/publishdataset", dataset, getAuthorizationHeader()).then ((data) => {
            console.log("published successfully");
            navigate(stringConstants.routes.repository);
        }).catch(function(error) {
            axiosError(error, setShowLoading, setAlertDialogInput);
        });
        setShowLoading(false);
        setShowLicenseDialog(false);
    }

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
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
            <PageHeading title={datasetId ? "Edit Dataset" : "Publish Dataset"} subTitle="Please provide the information for the dataset." />
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
            {showCollectionTable && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={showCollectionTable}
                    onHide={() => setShowCollectionTable(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Collections:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listCollections()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowCollectionTable(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleCollectionSelect}>Add Selected Collections</Button>
                     </Modal.Footer>
                </Modal>
            )}
            {showLicenseDialog && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={showLicenseDialog}
                    onHide={() => setShowLicenseDialog(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select License:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listLicenseOptions()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowLicenseDialog(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handlePublish}>Publish Dataset</Button>
                     </Modal.Footer>
                </Modal>
            )}
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
                      placeholder="Enter name of the dataset"
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
                <Button onClick={()=> navigate(stringConstants.routes.repository)}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Datasets</Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={handleSubmit}>
                    Submit
                </Button> 
            </div>
            </Card.Body>
          </Card>
          <Card style={{marginTop: "15px"}}>
            <Card.Body>
            <h5 class="gg-blue" style={{textAlign: "left"}}>
                Collections in the Dataset</h5>
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setShowCollectionTable(true)}>
                         Add Collection
                        </Button>
                        </div>
                    </Col>
                    </Row>
                
                <Table
                    authCheckAgent={props.authCheckAgent}
                    rowId = "collectionId"
                    data = {userSelection.collections}
                    columns={tableColumns}
                    enableRowActions={true}
                    delete={deleteFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                    initialSortColumn="name"
                />
            </Card.Body>
          </Card>
        <Accordion defaultActiveKey={0} className="mb-4" style={{marginTop: "15px"}}>
          <Card>
            <Card.Header>
              <Row>
                <Col className="font-awesome-color">
                  <span className="gg-blue" style={{fontWeight: 500, fontSize: "1.25rem"}}>Publications</span>
                </Col>

                <Col style={{ textAlign: "right" }}>
                  <CustomToggle eventKey={0}/>
                </Col>
              </Row>
            </Card.Header>
            <Accordion.Collapse eventKey={0}>
              <Card.Body>
              {publications.length < 1 ? (
                  <p className="no-data-msg-publication">No data available.</p>
                ) : (
                  publications.map((pub, pubIndex) => {
                    return <PublicationCard key={pubIndex} {...pub} />;
                  }) 
                )}
                </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>    
        </div>
      </Container>
        </>
    )
}

export default PublishDataset;