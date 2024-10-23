import { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Container } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";
import FeedbackWidget from "../components/FeedbackWidget";

const AddCoC = (props) => {
    const [searchParams] = useSearchParams();
    let cocId = searchParams.get("cocId");
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

    const coc = {
        name: "",
        description: "",
        collections: [],
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, coc);

    const [showCollectionTable, setShowCollectionTable] = useState(false);
    const [selectedCollections, setSelectedCollections] = useState([]);
    const [initialSelection, setInitialSelection] = useState({});

    const [isVisible, setIsVisible] = useState(false);

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
        window.addEventListener("scroll", toggleSaveVisibility);
    }, []);

    useEffect(() => {
        if (cocId) 
            fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cocId]);

    const fetchData = async () => {
        setShowLoading(true);
        getJson ("api/data/getcoc/" + cocId, getAuthorizationHeader())
            .then ((json) => {
                if (json.data.data) {
                    const coc = { 
                        collectionId: json.data.data.collectionId,
                        name: json.data.data.name,
                        description: json.data.data.description,
                        collections: json.data.data.children,
                    }
                    setUserSelection (coc);
                    if (json.data.data.children) {
                        setSelectedCollections (json.data.data.children);
                        let initialIds = {};
                        json.data.data.children.forEach ((collection) => {
                            initialIds[collection.collectionId] = true;
                        });
                        setInitialSelection(initialIds);
                    }
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

        const coc = { 
            collectionId: cocId ? cocId : null,
            name: userSelection.name,
            description: userSelection.description,
            children: userSelection.collections,
        }
        
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        let apiURL = cocId ? "api/data/updatecoc" : "api/data/addcoc";

        postJson (apiURL, coc, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/coc");
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
            accessorKey: 'name', 
            header: 'Name',
            size: 50,
          },
          {
            accessorKey: 'description', 
            header: 'Description',
            size: 200,
          },
        ],
        [],
      );

    const listCollections = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getcollections"
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

    const handleCollectionSelect = () => {
        setUserSelection({"collections": selectedCollections});
        let initialIds = {};
        selectedCollections.forEach ((collection) => {
            initialIds[collection.collectionId] = true;
        });
        setInitialSelection(initialIds);
        setShowCollectionTable(false);
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
        let initialIds = {};
        updated.forEach ((collection) => {
            initialIds[collection.collectionId] = true;
        });
        setInitialSelection(initialIds);
    }

    const handleCollectionSelectionChange = (selected) => {
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
             <PageHeading title={cocId ? "Edit Collection (of Collections)" : "Add Collection (of Collections)"} subTitle="Please provide the information for the new collection." />
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
                <Button onClick={()=> navigate("/coc")}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Collections of Collections</Button>
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
                Collections in the Collection</h5>
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
                    columns={columns}
                    enableRowActions={true}
                    delete={deleteFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                    initialSortColumn="name"
                />
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
};

export default AddCoC;