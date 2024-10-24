import { useEffect, useMemo, useReducer, useState } from "react";
import FeedbackWidget from "../components/FeedbackWidget";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { useNavigate } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import Table from "../components/Table";

const Glycoprotein = (props) => {

    const navigate = useNavigate();
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showAddSite, setShowAddSite] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const initialState = {
        uniprotId: "",
        sequence: "",
        name: "",
        geneSymbol: "",
        sites : [],
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'type', 
            header: 'Type',
            size: 50,
          },
          {
            accessorKey: 'position', 
            header: 'Position',
            size: 50,
          },
          {
            accessorKey: 'glycan', 
            header: 'Glycan',
            
            size: 80,
          },
        ],
        [],
      );

    useEffect(props.authCheckAgent, []);



    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "uniprotId" && newValue.trim().length > 1) {
            setValidate(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (userSelection.uniprotId === "" || userSelection.uniprotId.trim().length < 1) {
            setValidate(true);
            return;
        }
       
        //TODO add the glycoprotein

        e.preventDefault();
    };

    const getProteinFromUniProt = (uniprotId) => {
        //get the report with reportId
        getJson ("api/util/getproteinfromuniprot/" + uniprotId).then ((data) => {
            setUserSelection(data.data.data);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }  
        });
    }

    const deleteFromTable = (id) => {
        var sites = userSelection.sites;
        const index = sites.findIndex ((item) => item["id"] === id);
        var updated = [
            ...sites.slice(0, index),
            ...sites.slice(index + 1)
        ];
        setUserSelection ({"sites": updated});
    }

    const saveColumnVisibilityChanges = (columnVisibility) => {
        var columnSettings = [];
        for (var column in columnVisibility) {
        columnSettings.push ({
            "tableName": "SITE",
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

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        <Container maxWidth="xl">
            <div className="page-container">
             <PageHeading title="Add Glycoprotein" subTitle="Please provide the information for the new glycoprotein." />
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
                    <Form>
                        <Form.Group
                        as={Row}
                        controlId="uniprotId"
                        className="gg-align-center mb-3"
                        >
                        <Col xs={12} lg={9}>
                            <FormLabel label="UniProt ID" className="required-asterik"/>
                            <Form.Control
                            type="text"
                            name="uniprotId"
                            placeholder="Enter UniProt ID for the protein"
                            value={userSelection.uniprotId}
                            onChange={handleChange}
                            minLength={6}
                            maxLength={10}
                            required={true}
                            isInvalid={validate}
                            />
                            <Feedback message="Please enter a valid UniProt ID" />
                            {userSelection.uniprotId !== "" && userSelection.uniprotId.length > 5 && (
                            <Button
                                variant="contained"
                                onClick={() => getProteinFromUniProt(userSelection.uniprotId)}
                                className="gg-btn-blue-reg btn-to-lower mt-3"
                            >
                                Retrieve Protein Information from UniProt
                            </Button>
                            )}
                            </Col>
                        </Form.Group>
                        {userSelection.name &&
                        <>
                        <Form.Group as={Row} controlId="name" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Name" />
                            <Form.Control type="text" name="name" value={userSelection.name} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="sequence" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Sequence" />
                            <Form.Control as="textarea" rows="5" name="sequence" value={userSelection.sequence} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="gene" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Gene Symbol" />
                            <Form.Control type="text" name="gene" value={userSelection.geneSymbol} disabled />
                            
                            </Col>
                        </Form.Group>
                        </>}
                    </Form>
                    
                    <Loading show={showLoading}></Loading>
                    </div>
                    <div className="text-center mb-2">
                        <Button onClick={()=> navigate("/glycoproteins")}
                            className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycoproteins</Button>
                        {userSelection.name && 
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleSubmit}>
                            Submit
                        </Button>}
                    </div>
                </Card.Body>
            </Card>
            {userSelection.name && 
            <Card style={{marginTop: "15px"}}>
                <Card.Body>
                    <h5 className="gg-blue" style={{textAlign: "left"}}>
                         Sites</h5> 
                    <Row>
                        <Col md={12} style={{ textAlign: "right" }}>
                        <div className="text-right mb-3">
                            <Button variant="contained" className="gg-btn-blue mt-2" onClick={()=> setShowAddSite(true)}>
                                    Add Site
                            </Button>
                            </div>
                        </Col>
                    </Row>
                    <Table 
                        authCheckAgent={props.authCheckAgent}
                        rowId = "id"
                        data = {userSelection.sites}
                        columns={columns}
                        enableRowActions={true}
                        delete={deleteFromTable}
                        setAlertDialogInput={setAlertDialogInput}
                    />
                </Card.Body>
            </Card>}
            </div>
        </Container>
        </>
    );
}

export default Glycoprotein;