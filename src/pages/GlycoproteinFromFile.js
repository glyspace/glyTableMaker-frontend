import { useEffect, useReducer, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { ResumableUploader } from "../components/ResumableUploader";
import { Button, Card, CardBody, Col, Container, Form, Row } from "react-bootstrap";
import { FormLabel, PageHeading } from "../components/FormControls";
import Tag from "../components/Tag";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import { Loading } from "../components/Loading";
import stringConstants from "../data/stringConstants.json";
import { axiosError } from "../utils/axiosError";
import { Slider } from "@mui/material";

const GlycoproteinFromFile = props => {

    const [searchParams] = useSearchParams();
    let type = searchParams ? searchParams.get("type") : "BYONIC";

    const marks = [
        {
          "value": 0,
          "label": "Byonic Order",
          "description": "Assign glycans to the sites based on the order given by the Byonic software. First glycan will be assigned to first glycosylation site and so on."
        },
        {
          "value": 1,
          "label": "Alternative",
          "description": "Any glycan will be treated as potential candidate for any side. Each glycan will be assigned the explicit amino acids identified by Byonic."
        },
        {
          "value": 2,
          "label": "Range",
          "description": "Any glycan will be assigned to the entire peptide. Sites assigned by Byonic will be ignored instead the glycan will be treated as glycosylation from peptide start to peptide end with no explicit site assignment."
        }
    ]
  
    useEffect(() => {
        props.authCheckAgent();
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const [showLoading, setShowLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState();
    const [glycanOrder, setGlycanOrder] = useState("ALTERNATIVE");
    const [compType, setCompType] = useState("BYONIC");
    const [glycanOrderDescription, setGlycanOrderDescription] = useState (marks[1].description);
    
    const [alertDialogInput, setAlertDialogInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
    );
    const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
      );
  
    const [tag, setTag] = useState("");
    const [validate, setValidate] = useState(false);
    const navigate = useNavigate();
  
    const defaultFileType = "*/*";
    const TABLEMAKER_API = process.env.REACT_APP_API_URL;
  
    const fileDetails = {
      fileType: defaultFileType
    };

    const handleCompositionTypeChange = e => {
      const select = e.target.options[e.target.selectedIndex].value;
      setCompType(select);
    };

    function handleSubmit(e) {
        setShowLoading(true);
        setTextAlertInput({"show": false, id: ""});
    
        let file = {
            identifier: uploadedFile.identifier,
            originalName: uploadedFile.originalName,
            fileFolder: uploadedFile.fileFolder,
            fileFormat: uploadedFile.fileFormat,
        }
    
        postJson (stringConstants.api.addglycoproteinfromfile + "?filetype=" + type.toUpperCase() + "&tag=" + tag 
                      + (type == "byonic" ? "&glycanorder=" + glycanOrder : "&compositiontype=" + compType), 
            file, getAuthorizationHeader()).then ( (data) => {
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
      }
    
      function valuetext(value) {
        setGlycanOrder(value == 0 ? "BYONICORDER" : value== 1 ? "ALTERNATIVE" : "RANGE");
        return value;
     }

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
          <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                title="Add Glycoproteins From File"
                subTitle="Add glycoproteins to your list by uploading a file using one of the specified file formats."
              />
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
                />
              <Card>
                <Card.Body>
                <TextAlert alertInput={textAlertInput}/>
                  <Form noValidate onSubmit={e => handleSubmit(e)} className="mt-4 mb-4">
    
                    {/* File Upload */}
                    <Form.Group as={Row} controlId="fileUploader" className="gg-align-center mb-35">
                      <Col xs={12} lg={9} style={{ marginBottom: "40px"}}>
                        <FormLabel label="Upload Glycoprotein File" className="required-asterik" />
                        <ResumableUploader
                          headerObject={getAuthorizationHeader()}
                          fileType={fileDetails.fileType}
                          uploadService={TABLEMAKER_API + stringConstants.api.upload}
                          maxFiles={1}
                          setUploadedFile={setUploadedFile}
                          required={true}
                        />
                      </Col>
                     
                      <Col xs={12} lg={9} style={{ marginBottom: "40px"}}>
                      <FormLabel label="Add Tag"/>
                        <Tag validate={validate} setValidate={setValidate}
                            setTag={setTag}
                            setAlertDialogInput={setAlertDialogInput}
                            gettagws="api/data/getglycantags"
                        />
                      </Col>
                      {type && type == 'bynoic' &&
                      <Col xs={12} lg={9}>
                        <FormLabel label="Handle multiple Glycan Annotations per Peptide"/>
                        <Col>
                            <Slider
                            aria-label="Multiple Glycans handling"
                            defaultValue={glycanOrder === "BYONICORDER" ? 0: glycanOrder==="ALTERNATIVE" ? 1: 2}
                            valueLabelDisplay="off"
                            getAriaValueText={valuetext}
                            shiftStep={1}
                            step={1}
                            marks={marks}
                            min={0}
                            max={2}
                            onChange={(event, newValue) => {
                                setGlycanOrderDescription(marks[newValue].description);
                            }}
                            sx={{
                                "& .MuiSlider-mark": {
                                    width: 10,
                                    height: 10,
                                    backgroundColor: '#1976d2',
                                },
                            }}
                            /></Col>
                        
                        {glycanOrderDescription && 
                        <div style={{marginLeft: "20px"}}>
                            <h6>{glycanOrderDescription}</h6></div>
                        }
                        </Col>}

                      {type && type == 'excel' &&
                        <Col xs={12} lg={9}>
                          <FormLabel label="Glycan composition format"/>
                          <Col>
                          </Col>
                          <Form.Select
                                name={"compType"}
                                value={compType}
                                style={{ marginBottom: "30px"}}
                                onChange={handleCompositionTypeChange}
                              >
                              <option value="COMPACT">Composition (single letter)</option>
                              <option value="BYONIC">Composition (byonic)</option>
                          </Form.Select>
                          </Col>}
                    </Form.Group>
                        
                    <div className="text-center">
                      <Button onClick={()=> navigate("/glycoproteins")} 
                        className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20"> Back to Glycoproteins</Button>
    
                      <Button
                        type="submit"
                        disabled={!uploadedFile}
                        className="gg-btn-blue mt-2 gg-ml-20"
                      >
                        Submit
                      </Button>
                    </div>
                    <Loading show={showLoading}></Loading>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Container>
        </>
      );
    };
    
    export { GlycoproteinFromFile };