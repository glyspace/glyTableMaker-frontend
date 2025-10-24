import React, { useReducer, useState, useMemo, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { Feedback, FormLabel } from "../components/FormControls";
import moleculeExamples from "../data/moleculeExamples";
import ExampleSequenceControl from "../components/ExampleSequenceControl";
import Container from "@mui/material/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box } from "@mui/material";
import GlycoGlyph from "../components/GlycoGlyph";
import { Loading } from "../components/Loading";
import { getAuthorizationHeader, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { axiosError } from "../utils/axiosError";
import Composition from "../components/Composition";
import FeedbackWidget from "../components/FeedbackWidget";
import Tag from "../components/Tag";
import { Dialog, DialogContent, DialogActions, DialogTitle, IconButton, Typography, Tooltip } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";

const Glycan = (props) => {

    const [searchParams] = useSearchParams();
    let type = searchParams ? searchParams.get("type") : "sequence";
    const [subType, setSubType] = useState ("composition-single");
    
    const compositionLabel = subType === "composition-single" ? "Single Letter Code" 
                            : subType === "composition-byonic" ?
                              "Byonic Encoding" : subType === "composition-gg" ? "GlycoGenius Encoding" : "ProteinProspector Encoding";

    useEffect(props.authCheckAgent, []);

    const [glycoGlyphDialog, setGlycoGlyphDialog] = useState(type ? type === "draw" : false);
    const [compositionDialog, setCompositionDialog] = useState(false);
    const [showComposition, setShowComposition] = useState(type ? type === "composition" : false);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [error, setError] = useState(false);
    const [tag, setTag] = useState("");
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );
    const navigate = useNavigate();

    const initialState = {
        glytoucanId: "",
        sequence: "",
        sequenceType: "GLYCOCT",
        glycoGlyphName: "",
        composition: [],
        compositionType : [],
        compositionString: ""
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if ((name === "sequence" || name === "glytoucanId") && newValue.trim().length > 1) {
            setValidate(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleClassSelect = e => {
        const select = e.target.options[e.target.selectedIndex].value;
        setUserSelection({ sequenceType: select });
    };

    const handleCompositionTypeChange = e => {
      const select = e.target.options[e.target.selectedIndex].value;
      setUserSelection ({compositionString: ""});
      setSubType (select);
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        let t=null;
        e && e.preventDefault();
        if (type === "sequence") {
            if (userSelection.sequence === "" || userSelection.sequence.trim().length < 1) {
                setValidate(true);
                setError(true);
                return;
            }
        } else if (type === "glytoucan") {
            if (userSelection.glytoucanId === "" || userSelection.glytoucanId.trim().length < 1) {
                setValidate(true);
                setError(true);
                return;
            }
        } else if (type === "composition") {
            if (userSelection.composition === "" || userSelection.composition.length < 1) {
              setValidate(true);
              setError(true);
              return;
          }
        } else if (type === "composition-string") {
            t = (subType === "composition-single" ? "COMPACT" : (subType === "composition-byonic" ? "BYONIC" : 
              subType === "composition-gg" ? "GLYCOGENIUS" : "PROTEINPROSPECTOR"));
            if (userSelection.compositionString === "" || userSelection.compositionString.trim().length < 1) {
              setValidate(true);
              setError(true);
              return;
          }
        } 

        const glycan = { 
            sequence: userSelection.sequence,
            glytoucanID: userSelection.glytoucanId,
            composition: userSelection.composition && userSelection.composition.length > 0 ? userSelection.composition : 
                  userSelection.compositionString && userSelection.compositionString.length > 0 ? userSelection.compositionString.split("\n") : null,
            format: userSelection.sequenceType}
        
        addGlycan(glycan, t);
        
    };

    const handleBackToDraw = e => {
        setError(false);
        setTextAlertInput({"show": false, id: ""});
        setGlycoGlyphDialog(true);
    }

    function handleSequenceChange(inputSequence) {    
        setTextAlertInput({"show": false, id: ""});
        setUserSelection({ sequence: inputSequence, sequenceType: "GLYCOCT" });
    }

    function addGlycan(glycan, type=null) {
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        if (glycan.composition && glycan.composition.length > 0) {
          const comps = glycan.composition;
          const gList = comps.map ((comp, index) => {
            const g = { 
              composition: comp,
              type: (userSelection.compositionType && userSelection.compositionType[index]) ? userSelection.compositionType[index] : null,
            }
            return g;
          });
          let url = "api/data/addglycanfromlist?tag=" + encodeURIComponent(tag);
          if (type) url += "&compositionType="+type;
            postJson (url, gList, getAuthorizationHeader()).then ( (data) => {
              addGlycanSuccess(data);
            }).catch (function(error) {
              if (error && error.response && error.response.data) {
                  if (type === "draw") {
                      setGlycoGlyphDialog(false);
                  }
                  setError(true);
                  setTextAlertInput ({"show": true, "message": error.response.data["message"]});
              } else {
                  axiosError(error, null, setAlertDialogInput);
              }
              setShowLoading(false);
            }
          );
        }  else {
          let url = "api/data/addglycan";
          if (type) url += "?compositionType="+type;
          if (!type && userSelection.compositionType && userSelection.compositionType.length > 0 && userSelection.compositionType[0]) 
              url += "?compositionType="+userSelection.compositionType[0];
          postJson (url, glycan, getAuthorizationHeader()).then ( (data) => {
              addGlycanSuccess(data);
            }).catch (function(error) {
              if (error && error.response && error.response.data) {
                  if (type === "draw") {
                      setGlycoGlyphDialog(false);
                  }
                  setError(true);
                  setTextAlertInput ({"show": true, "message": error.response.data["message"]});
              } else {
                  axiosError(error, null, setAlertDialogInput);
              }
              setShowLoading(false);
            }
          );
        }
    }

    function addGlycanSuccess() {
        setShowLoading(false);
        navigate("/glycans");
    }

    const deleteComposition = (comp) => {
      var compositions = userSelection.composition;
      const index = compositions.findIndex ((item) => item === comp);
      var updated = [
          ...compositions.slice(0, index),
          ...compositions.slice(index + 1)
      ];
      var compTypes = userSelection.compositionType;
      var updatedTypes = [
        ...compTypes.slice(0, index),
        ...compTypes.slice(index + 1)
      ];
      setUserSelection ({"composition": updated});
      setUserSelection ({"compositionType" : updatedTypes});
    }

    const addComposition = ( comp, type ) => {
      var compositions = [...userSelection.composition];
      var compTypes = [...userSelection.compositionType]
      const index = compositions.findIndex ((item) => item === comp.composition);
      if (index === -1) { // not found
        compositions.push(comp.composition);
        compTypes.push(type)
        setUserSelection ({"composition": compositions});
        setUserSelection ({"compositionType" : compTypes});
      }
    }

    const compColumns = useMemo(
      () => [
        {
          header: 'Composition List',
          enableColumnFilter: false,
          enableSorting: false,
          enableHiding: false,
          Cell: ({ row, index }) => (
          <div key={index} style={{ textAlign: "left" }}>
              <div>
                  {row.original}
              </div>
          </div>
          ),
        },
      ],
      [],
    );

    const compositionTable= useMaterialReactTable({
      columns: compColumns,
      data: userSelection.composition ?? [],
      enableFilters: false,
      enableRowActions: true,
      positionActionsColumn: 'last',
      renderRowActions: ({ row }) => (
        <Box sx={{ display: 'flex'}}>
          <Tooltip title="Delete">
              <IconButton color="error">
                <DeleteIcon 
                onClick={()=> {
                    deleteComposition (row.original)
                }}/>
              </IconButton>
            </Tooltip>
        </Box>
      ),
      renderToolbarInternalActions: ({ table }) => (
        getToolbar(table)
      ),
      getRowId: (row) => row
    });

    const getToolbar = (table) => {
      return (
        <Box>
            <Tooltip title="Create a new composition and add it to the list">
            <Button className="gg-btn-blue-reg"
                  onClick={()=>setCompositionDialog(true)}>Add Composition</Button>
            </Tooltip>
        </Box>
      )
    }

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        <GlycoGlyph
            show={glycoGlyphDialog}
            glySequenceChange={handleSequenceChange}
            glySequence={userSelection.sequence}
            setInputValue={setUserSelection}
            inputValue={userSelection}
            title={"GlycoGlyph"}
            setOpen={(input) => {
                setGlycoGlyphDialog(input)
            }}
            submit={(input) => addGlycan(input)}
        />
        {type === "composition" && (
          <Dialog
            maxWidth={'md'}
            fullWidth={true}
            style={{ margin: 40 }}
            aria-labelledby="parent-modal-title"
            aria-describedby="parent-modal-description"
            scroll="paper"
            centered
            open={showComposition}
            onClose={(event, reason) => {
                setShowComposition(false);
                navigate ("/glycans");
            }}>
          <DialogTitle id="parent-modal-title">
              <Typography id="parent-modal-title" variant="h6" component="h2">
              Add Compositions
              </Typography>
          </DialogTitle>
          <IconButton
              aria-label="close"
              onClick={() => {
                setShowComposition(false);
                navigate ("/glycans");
              }}
              sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
              }}
              >
            <CloseIcon />
          </IconButton>
          <DialogContent>
                 <Loading show={showLoading}></Loading>
                 <div className="gg-align-center mb-3">
                  <MaterialReactTable table={compositionTable} />
                </div>
                  <Col xs={12} lg={9}>
                  <Form.Group>
                    <FormLabel label="Add Tag"/>
                      <Tag validate={validate} setValidate={setValidate}
                          setTag={setTag}
                          setAlertDialogInput={setAlertDialogInput}
                          gettagws="api/data/getglycantags"
                      />
                    </Form.Group>
                  </Col>
          </DialogContent>
          <DialogActions>
              <Button className="gg-btn-outline-reg"
                  onClick={()=> {
                      setShowComposition(false);
                      navigate ("/glycans");
                  }}>Cancel</Button>
              <Button className="gg-btn-blue-reg"
                  onClick={()=>handleSubmit()}>Add Glycans</Button>
          </DialogActions>
            
          </Dialog>
        )}
         <Composition
            show={compositionDialog}
            setAlertDialogInput={setAlertDialogInput}
            title={"Glycan Composition"}
            setOpen={(input) => {
                setCompositionDialog(input)
            }}
            submit={(input, type) => addComposition(input, type)}
        />
        <Container maxWidth="xl">
            <div className="page-container">
             <PageHeading title="Add Glycan" subTitle="Please provide the information for the new glycan." />
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
                { type === "glytoucan" && (
                <Form.Group
                  as={Row}
                  controlId="glytoucanId"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="GlyTouCan ID" className="required-asterik"/>
                    <Form.Control
                      type="text"
                      name="glytoucanId"
                      placeholder="Enter GlyTouCan ID of the glycan"
                      value={userSelection.glytoucanId}
                      onChange={handleChange}
                      minLength={8}
                      maxLength={10}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Please enter a valid Glytoucan ID" />
                    </Col>
                </Form.Group>) }
                { type === "composition-string" && (
                <Form.Group
                  as={Row}
                  controlId="composition"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Composition input type"/>
                    <Form.Select
                      name={"compType"}
                      value={subType}
                      style={{ marginBottom: "30px"}}
                      onChange={handleCompositionTypeChange}
                    >
                    <option value="composition-single">Single Letter Code</option>
                    <option value="composition-byonic">Byonic Encoding</option>
                    <option value="composition-pp">ProteinProspector Encoding</option>
                    <option value="composition-gg">GlycoGenius Encoding</option>
                    </Form.Select>
                    <FormLabel label={compositionLabel} className="required-asterik"/>
                    <Form.Control
                      as="textarea"
                      rows="10"
                      name="compositionString"
                      placeholder="Enter composition of glycan, one composition per line"
                      value={userSelection.compositionString}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Please enter a valid composition value" />
                    <Row>
                      <Col className="gg-align-left">
                          <ExampleSequenceControl
                            setInputValue={id => {
                              setUserSelection({ compositionString: id });
                            }}
                            inputValue={moleculeExamples.glycan[subType].examples}
                          />
                      </Col>
                    </Row>
                    </Col>
                    <Col xs={12} lg={9}>
                      <FormLabel label="Add Tag"/>
                        <Tag validate={validate} setValidate={setValidate}
                            setTag={setTag}
                            setAlertDialogInput={setAlertDialogInput}
                            gettagws="api/data/getglycantags"
                        />
                    </Col>
                </Form.Group>) }
                {/* Sequence Type */}
                { type === "sequence" && (
                <Form.Group
                  as={Row}
                  controlId="sequenceType"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Sequence Format" className="required-asterik" />
                    <Form.Control
                      as="select"
                      name="sequenceType"
                      placeholder="GlycoCT (first dropdown by default)"
                      value={userSelection.sequenceType}
                      onChange={handleClassSelect}
                      disabled={readOnly}
                      required={true}
                    >
                      <option value="GLYCOCT">GlycoCT</option>
                      <option value="GWS">GlycoWorkbench</option>
                      <option value="WURCS">WURCS</option>
                      
                    </Form.Control>
                    <Feedback message="Sequence Format is required"></Feedback>
                  </Col>
                </Form.Group> )}
                {/* Sequence */}
                { type === "sequence" && (
                <Form.Group
                  as={Row}
                  controlId="sequence"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Sequence" className="required-asterik" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="sequence"
                      placeholder="Enter glycan sequence"
                      value={userSelection.sequence}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                      maxLength={5000}
                      readOnly={readOnly}
                    />
                    <Feedback message="Please enter Valid Sequence" />
                    <Row>
                      <Col className="gg-align-left">
                        {userSelection.sequenceType && !readOnly && (
                          <ExampleSequenceControl
                            setInputValue={id => {
                              setUserSelection({ sequence: id });
                            }}
                            inputValue={moleculeExamples.glycan[userSelection.sequenceType].examples}
                          />
                        )}
                      </Col>
                      <Col className="text-right text-muted">
                        {userSelection.sequence && userSelection.sequence.length > 0
                          ? userSelection.sequence.length
                          : "0"}
                        /5000
                      </Col>
                    </Row>
                </Col>
                </Form.Group>)}
                {/* type === "draw" && (
                    <Form.Group
                    as={Row}
                    className="gg-align-center mb-3"
                  >
                    <Col xs="auto">
                        <Button
                          className="gg-btn-blue"
                          onClick={() => setGlycoGlyphDialog(true)}>
                          Draw with Glyco Glyph
                        </Button>
                    </Col>
                </Form.Group>
                )*/}  
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Button onClick={()=> navigate("/glycans")}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycans</Button>
                { (type !== "draw" || !error) &&
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleSubmit}>
                Submit
                </Button> }
                { type === "draw" && error && 
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleBackToDraw}>
                Draw Glycan
                </Button> }
            </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
}

export default Glycan;