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
import GlycanTypeTable from "../components/GlycanTypeTable";
import { ScrollToTop } from "../components/ScrollToTop";

const Glycoprotein = (props) => {

    const navigate = useNavigate();
    const [validate, setValidate] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showAddSite, setShowAddSite] = useState(false);
    const [showPosition, setShowPosition] = useState(true);
    const [showGlycanSelection, setShowGlycanSelection] = useState(false);
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
        proteinName: "",
        name: "",
        geneSymbol: "",
        sites : [],
    };

    const siteState = {
        type: "",
        glycans: [],
        positions: [{"location" : -1, "aminoAcid": ""}],
    }

    const aminoacidMap = {
        "A" : "Ala",
        "R" : "Arg",
        "N" : "Asn",
        "D" : "Asp",
        "C" : "Cys",
        "Q" : "Gln",
        "E" : "Glu",
        "G" : "Gly",
        "H" : "His",
        "I" : "Ile",
        "L" : "Leu",
        "K" : "Lys",
        "M" : "Met",
        "F" : "Phe",
        "P" : "Pro",
        "S" : "Ser",
        "T" : "Thr",
        "W" : "Trp",
        "Y" : "Tyr",
        "V" : "Val",
        "B" : "Asx",
        "Z" : "Glx",
    }

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);
    const [siteSelection, setSiteSelection] = useReducer(reducer, siteState);
    const [selectedGlycans, setSelectedGlycans] = useState([]);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'type', 
            header: 'Type',
            size: 50,
          },
          {
            accessorKey: 'positions',
            header: 'Position',
            size: 100,
            Cell: ({ cell }) => (
                <>
                {cell.getValue() && cell.getValue().length === 1 &&
                    <span>{cell.getValue()[0].location}</span>}
                {cell.row.original.type === "RANGE" && 
                    cell.getValue() && cell.getValue().length > 1 &&
                    <span>{`${cell.getValue()[0].location} - ${cell.getValue()[1].location}`}</span>
                }
                {cell.row.original.type === "ALTERNATIVE" && 
                    cell.getValue() && cell.getValue().length > 1 &&
                    cell.getValue().map ((pos, index) => {
                    return <span>
                    {index !== cell.getValue().length - 1 &&
                        `${pos.location} | `
                    } 
                    {index === cell.getValue().length - 1 &&
                        `${pos.location}`
                    }
                    </span>
                })}
              </>
            ),
          },
          {
            accessorKey: 'glycans', 
            header: 'Glycan',
            Cell: ({ cell }) => (
                <>
                <ul style={{listStyleType: "none"}}>
                {cell.getValue() && cell.getValue().length > 0 &&
                    cell.getValue().map ((glycan, index) => {
                    return <li><img src={"data:image/png;base64, " + glycan.glycan.cartoon} alt="cartoon" /></li>
                    })
                }
                </ul>
                </>
            ),
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

        // re-organize the sites
        const sites = [];
        userSelection.sites.forEach ((site) => {
            const positionList = site.positions;
            sites.push ({
                "type": site.type,
                "position" : { "positionList" : positionList},
                "glycans" : site.glycans,
            });
        })
       
        // add the glycoprotein
        const glycoprotein = {
            "name": userSelection.name,
            "proteinName": userSelection.proteinName,
            "sequence" : userSelection.sequence,
            "geneSymbol" : userSelection.geneSymbol,
            "uniprotId": userSelection.uniprotId,
            "sites" : sites,
        }

        setShowLoading(true);
        let apiURL = "api/data/addglycoprotein";
        postJson (apiURL, glycoprotein, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/glycoproteins");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );

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

    const deleteFromGlycanTable = (id) => {
        var glycans = siteSelection.glycans;
        const index = glycans.findIndex ((item) => item["glycanId"] === id);
        var updated = [
            ...glycans.slice(0, index),
            ...glycans.slice(index + 1)
        ];
        setSiteSelection ({"glycans": updated});
    }

    const handleAddSite = () => {
        var sites = [...userSelection.sites];
        sites.push (siteSelection);
        setUserSelection ({"sites": sites});
        setSiteSelection ({ "type": "", "glycans": [], 
            "positions": [{"location" : -1, "aminoAcid": ""}]});
        setShowAddSite(false);
    }

    const handleTypeChange = e => {
        const selected = e.target.options[e.target.selectedIndex].value;
        setSiteSelection ({"type" : selected});
        setShowPosition(selected !== "UNKNOWN");
        setShowStartEnd(selected === "RANGE");
        if (selected === "RANGE" || selected === "ALTERNATIVE") {
            const positions = [...siteSelection.positions];
            positions.forEach ((pos) => pos.aminoAcid = "");
            if (positions.length < 2) {
                positions.push ({
                    "location": -1,
                    "aminoAcid": "",
                });
            }
            setSiteSelection ({"positions" : positions});
        } else {
            setSiteSelection ({"positions" : [{"location" : -1, "aminoAcid": ""}]});
        }
        setShowAlternatives (selected === "ALTERNATIVE");
    };

    const handlePositionChange = (e, index, minValue) => {
        setValidate(false);
        const val = e.target.value;
        const positions = [...siteSelection.positions];
        if (positions[index]) {
            try {
                const num = Number.parseInt(val);
                if (Number.isNaN(num)) {
                    throw new Error("Invalid number format");
                }
                if (num < 0 || num > userSelection.sequence.length)
                    throw new Error("Invalid number range");
                if (minValue && num < minValue) {
                    throw new Error("Invalid number range");
                }
                positions[index].location = num;
                positions[index].aminoAcid = getAminoAcidFromSequence(positions[index].location);
            } catch (error) {
                setValidate(true);
                return null;
            }
        }
       
        setSiteSelection ("positions", positions);   
    }

    const getAminoAcidFromSequence = (location) => {
        if (userSelection.sequence && userSelection.sequence.length >= location) {
            const amino = aminoacidMap [userSelection.sequence.charAt(location-1)];
            if (amino) return amino;
            else return "Invalid";
        } else {
            return "Invalid";
        }
    }

    const handleAddPosition = () => {
        const positions = [...siteSelection.positions];
        positions.push ({
            "location": -1,
            "aminoAcid": "",
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
            const found = siteSelection.glycans.find ((item) => item.glycan.glycanId === glycan.glycanId);
            if (!found) {
                previous.push ({"glycan" : glycan, "type": "Glycan", "glycosylationType" : "N-linked",
                    "glycosylationSubType": "High mannose",
                });
            }
        })
        setSelectedGlycans(previous);
    }

    const handleGlycanTypeChange = (data) => {
        console.log("site selection: " + siteSelection.glycans);
        console.log("selected glycans" + selectedGlycans);
       /* const glycans = [...siteSelection.glycans];
        glycans.forEach ((entry) => {
            if (entry.glycan.glycanId === glycanId) {
                entry[field] = value;
            }
        });

        setSiteSelection({"glycans": glycans});*/
    }

    const handleGlycanSelect = () => {
        console.log("selected glycans" + selectedGlycans);
        setTextAlertInput({"show": false, id: ""});
        const selected=[];
        selectedGlycans.forEach ((glycan) => {
            if (!glycan.glycan.glytoucanID || glycan.glycan.glytoucanID.length === 0) {
                // error, not allowed to select this for the collection
                setTextAlertInput ({"show": true, 
                    "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + glycan.glycanId + " is not added."
                });
                ScrollToTop();
            } else {
                selected.push (glycan);
            }
        });

        setSiteSelection({"glycans": selected});
        setShowGlycanSelection(false);
    }

    const handleClose = (event, reason) => {
        if (reason && reason === "backdropClick")
            return;
        setTextAlertInput({"show": false, id: ""});
        setShowGlycanSelection(false);
    };

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
              {!showStartEnd && showPosition && 
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
                            onChange={(e)=> handlePositionChange(e, index)}
                            isInvalid={validate}
                            />
                            <Feedback message="Position should be a valid number within the range" />
                        </Col>
                        <Col xs={2} lg={2}>
                            <FormLabel label="Amino Acid"/>
                        </Col>
                        <Col xs={2} lg={2}>
                        <Form.Control
                            type="text"
                            name={"aminoacid"}
                            value={siteSelection.positions[index].aminoAcid}
                            disabled
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
                  onChange={(e)=>handlePositionChange(e, 0)}
                  isInvalid={validate}
                  />
                  <Feedback message="Position should be a valid number within the range" />
              </Col>
              <Col xs={4} lg={4}>
              <Form.Control
                  type="text"
                  name={"aminoacid"}
                  value={siteSelection.positions[0].aminoAcid}
                  disabled
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
                    onChange={(e)=>handlePositionChange(e, 1, siteSelection.positions[0].location)}
                    isInvalid={validate}
                    />
                    <Feedback message="Position should be a valid number within the range" />
                </Col>
                <Col xs={4} lg={4}>
                <Form.Control
                    type="text"
                    name={"aminoacid"}
                    value={siteSelection.positions[1].aminoAcid}
                    disabled
                    >
                    </Form.Control>
                </Col>
                <Col xs={2} lg={2}></Col>
                </Row>
                </>
              } 

              <Row>
                <FormLabel label="Glycans" className="required-asterik"/>
                <div style={{"textAlign": "right", "marginTop" : "10px", "marginBottom" : "10px"}}>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    onClick={()=> setShowGlycanSelection(true)}>
                         Add Glycan(s)
                </Button>
                </div>
                <GlycanTypeTable 
                    rowId="glycanId"
                    data={siteSelection.glycans} 
                    handleGlycanTypeChange={handleGlycanTypeChange}
                    delete={deleteFromGlycanTable}
                    enableRowActions={true}
                />
              </Row>

              {showGlycanSelection && (
                <Dialog
                    maxWidth="lg"
                    fullWidth="true"
                    open={showGlycanSelection}
                    onClose={handleClose}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                    >
                    <DialogTitle>Select Glycan(s)</DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                        >
                    <CloseIcon />
                    </IconButton>
                    <TextAlert alertInput={textAlertInput}/>
                    <DialogContent dividers>{
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
                    />}</DialogContent>
                    <DialogActions>
                    <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycanSelection(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                    </DialogActions>
                </Dialog>
            )}
            </>
        )
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
                    onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        )}
        </div>
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
                        <Form.Group
                            as={Row}
                            controlId="name"
                            className="gg-align-center mb-3"
                            >
                            <Col xs={12} lg={9}>
                                <FormLabel label="Name"/>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Enter a name for glycprotein"
                                    value={userSelection.name}
                                    onChange={handleChange}
                                />    
                            </Col>
                        </Form.Group>
                        {userSelection.proteinName &&
                        <>
                        <Form.Group as={Row} controlId="proteinName" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Protein Name" />
                            <Form.Control type="text" name="proteinName" value={userSelection.proteinName} disabled />
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
                        {userSelection.proteinName && 
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleSubmit}>
                            Submit
                        </Button>}
                    </div>
                </Card.Body>
            </Card>
            {userSelection.proteinName && 
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
                                        "positions": [{"location" : -1, "aminoAcid": ""}]});
                                    setShowStartEnd(false);
                                    setShowAlternatives(false);
                                    setShowPosition(true);
                                    setShowAddSite(true);
                                    setSelectedGlycans([]);
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