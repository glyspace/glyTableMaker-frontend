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
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddCircleOutline } from "@mui/icons-material";

const Glycoprotein = (props) => {

    const navigate = useNavigate();
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showAddSite, setShowAddSite] = useState(false);
    const [showGlycanTable, setShowGlycanTable] = useState(true);
    const [showStartEnd, setShowStartEnd] = useState(false);
    const [showAlternatives, setShowAlternatives] = useState(false);
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

    const siteState = {
        type: "",
        glycans: [],
        positions: [{"position" : -1, "aminoacid": ""}],
    }

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);
    const [siteSelection, setSiteSelection] = useReducer(reducer, siteState);

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

    const glycanColumns = useMemo(
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

    const handleAddSite = () => {
        var sites = [...userSelection.sites];
        sites.push (siteSelection);
        setUserSelection ({"sites": sites});
        setSiteSelection ({ "type": "", "glycans": [], 
            "positions": [{"position" : -1, "aminoacid": ""}]});
    }

    const handleTypeChange = e => {
        const selected = e.target.options[e.target.selectedIndex].value;
        setSiteSelection ({"type" : selected});
        setShowGlycanTable(selected !== "UNKNOWN");
        setShowStartEnd(selected === "RANGE");
        if (selected === "RANGE" || selected === "ALTERNATIVE") {
            const positions = [...siteSelection.positions];
            if (positions.length < 2) {
                positions.push ({
                    "position": -1,
                    "aminoacid": "",
                });
            }
            setSiteSelection ({"positions" : positions});
        } else {
            setSiteSelection ({"positions" : [{"position" : -1, "aminoacid": ""}]});
        }
        setShowAlternatives (selected === "ALTERNATIVE");
    };

    const handlePositionChange = (e, position, amino) => {
        const val = e.target.value;
        if (amino) {
            position.aminoacid = val;
        } else {
            position.position = Number.parseInt(val);
        }
    };

    const handleAddPosition = () => {
        const positions = [...siteSelection.positions];
        positions.push ({
            "position": -1,
            "aminoacid": "",
        });
        setSiteSelection ({"positions" : positions});
    }

    const handleDeletePosition = (index) => {
        var positions = siteSelection.positions;
        var updated = [
            ...positions.slice(0, index),
            ...positions.slice(index + 1)
        ];
        setSiteSelection ({"positions": updated});
    }

    const handleGlycanSelectionChange = (selected) => {
        // append new selections
        const previous = [...siteSelection.glycans];
        selected.forEach ((glycan) => {
            const found = siteSelection.glycans.find ((item) => item.glycanId === glycan.glycanId);
            if (!found) {
                previous.push (glycan);
            }
        })
        setSiteSelection({"glycans" : previous});
    }

    const addSiteForm = () => {
        return (
            <>
            <Row style={{marginBottom: "10px"}}>
                <Col xs={2} lg={2}>
                    <FormLabel label="Type" className="required-asterik"/>
                </Col>
                <Col xs={4} lg={4}>
                    <Form.Select
                    name={"siteType"}
                    value={siteSelection.siteType}
                    onChange={handleTypeChange}
                    >
                    <option value="EXPLICIT">Explicit</option>
                    <option value="RANGE">Range</option>
                    <option value="ALTERNATIVE">Alternative</option>
                    <option value="UNKNOWN">Unknown</option>
                    </Form.Select>
                </Col>
                <Col xs={6} lg={6}></Col>
              </Row>  
              {!showStartEnd && showGlycanTable && 
              siteSelection.positions.map ((pos, index) => {
                return (
                    <Row style={{marginBottom: "10px"}}>
                        <Col xs={2} lg={2}>
                            <FormLabel label="Position" className="required-asterik"/>
                        </Col>
                        <Col xs={4} lg={4}>
                            <Form.Control
                            type="text"
                            name={"position"}
                            placeholder="Enter the position"
                            onChange={(e)=> handlePositionChange(e, pos, false)}
                            >
                            </Form.Control>
                        </Col>
                        <Col xs={4} lg={4}>
                        <Form.Control
                            type="text"
                            name={"aminoacid"}
                            placeholder="Enter the aminoacid"
                            onChange={(e)=>handlePositionChange(e, pos, true)}
                            >
                            </Form.Control>
                        </Col>
                        <Col xs={2} lg={2}>
                        {showAlternatives && index > 1 &&
                        <Tooltip title="Remove this position">
                        <IconButton color="error" onClick={(event) => {handleDeletePosition(index)}}>
                        <DeleteIcon />
                        </IconButton>
                         </Tooltip>}
                        {showAlternatives && index === siteSelection.positions.length-1 && 
                        <Tooltip title="Add another position">
                        <IconButton color="primary" onClick={handleAddPosition}>
                          <AddCircleOutline />
                        </IconButton></Tooltip>
                        }</Col>
                    </Row>
                );
                })
              }
              {showStartEnd && 
              <>
              <Row style={{marginBottom: "10px"}}>
              <Col xs={2} lg={2}>
                  <FormLabel label="Start Position" className="required-asterik"/>
              </Col>
              <Col xs={4} lg={4}>
                  <Form.Control
                  type="text"
                  name={"position"}
                  placeholder="Enter the position"
                  onChange={(e)=>handlePositionChange(e, siteSelection.positions[0], false)}
                  >
                  </Form.Control>
              </Col>
              <Col xs={4} lg={4}>
              <Form.Control
                  type="text"
                  name={"aminoacid"}
                  placeholder="Enter the aminoacid"
                  onChange={(e)=>handlePositionChange(e, siteSelection.positions[0], true)}
                  >
                  </Form.Control>
              </Col>
              <Col xs={2} lg={2}></Col>
                </Row>
                <Row style={{marginBottom: "10px"}}>
                <Col xs={2} lg={2}>
                    <FormLabel label="End Position" className="required-asterik"/>
                </Col>
                <Col xs={4} lg={4}>
                    <Form.Control
                    type="text"
                    name={"position"}
                    placeholder="Enter the position"
                    onChange={(e)=>handlePositionChange(e, siteSelection.positions[1], false)}
                    >
                    </Form.Control>
                </Col>
                <Col xs={4} lg={4}>
                <Form.Control
                    type="text"
                    name={"aminoacid"}
                    placeholder="Enter the aminoacid"
                    onChange={(e)=>handlePositionChange(e, siteSelection.positions[1], true)}
                    >
                    </Form.Control>
                </Col>
                <Col xs={2} lg={2}></Col>
                </Row>
                </>
              }
              {showGlycanTable && 
              <Row>
                <FormLabel label="Glycans" className="required-asterik"/>
                <div style={{"textAlign": "right", "marginTop" : "10px", "marginBottom" : "10px"}}>
                <Button variant="contained" className="gg-btn-blue-sm">
                        Add Selected Glycans
                </Button>
                </div>
                <Table
                    authCheckAgent={props.authCheckAgent}
                    ws="api/data/getglycans"
                    columns={glycanColumns}
                    columnFilters={[{"id":"glytoucanID","value":"G"}]}
                    enableRowActions={false}
                    setAlertDialogInput={setAlertDialogInput}
                    initialSortColumn="dateCreated"
                    rowSelection={true}
                    rowSelectionChange={handleGlycanSelectionChange}
                    rowId="glycanId"
                />
                <div style={{"textAlign": "right", "marginTop" : "10px", "marginBottom" : "10px"}}>
                <Button variant="contained" className="gg-btn-blue-sm">
                        Add Selected Glycans
                </Button>
                </div>
                </Row>}
            </>
        )
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
                {showAddSite && (
                <Dialog
                    maxWidth="xl"
                    fullWidth="true"
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    scroll="paper"
                    centered
                    open={showAddSite}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setShowAddSite(false)
                    }}
                >
                    <DialogTitle id="parent-modal-title">
                        <Typography id="parent-modal-title" variant="h6" component="h2">
                        Add Site
                        </Typography>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => setShowAddSite(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                        >
                    <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        <Typography id="parent-modal-description" sx={{ mt: 2 }}>
                        {addSiteForm()}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        
                        <Button className="gg-btn-outline-reg"
                            onClick={()=> {
                                setShowAddSite(false);
                            }}>Cancel</Button>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=>handleAddSite()}>Submit</Button>
                    </DialogActions>   
                </Dialog>)}
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
                            <Button variant="contained" className="gg-btn-blue mt-2" 
                                onClick={()=> {
                                    setSiteSelection ({ "type": "EXPLICIT", "glycans": [], 
                                        "positions": [{"position" : -1, "aminoacid": ""}]});
                                    setShowStartEnd(false);
                                    setShowAlternatives(false);
                                    setShowGlycanTable(true);
                                    setShowAddSite(true);
                                }}>
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