import { Container } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import DialogAlert from "../components/DialogAlert";
import { ResumableUploader} from "../components/ResumableUploader";
import { Loading } from "../components/Loading";
import stringConstants from "../data/stringConstants.json";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import { axiosError } from "../utils/axiosError";
import FeedbackWidget from "../components/FeedbackWidget";

const CollectionFromFile = props => {
  useEffect(() => {
      props.authCheckAgent();

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [uploadedCollectionFile, setUploadedCollectionFile] = useState();
  const location = useLocation();
  const [collectionType, setCollectionType] = useState((location.state && location.state.collectionType) ?? "GLYCAN");
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );
  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );

  const navigate = useNavigate();

  const defaultFileType = "*/*";
  const TABLEMAKER_API = process.env.REACT_APP_API_URL;
  const [validate, setValidate] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [tag, setTag] = useState("");
  const [prefix, setPrefix] = useState("");
  const [postfix, setPostfix] = useState("");

  const fileDetails = {
    fileType: defaultFileType
  };

  useEffect(() => {
      // load existing tags
      getJson ("api/data/getglycantags", getAuthorizationHeader()).then ( (json) => {
          setTagList(json.data.data);
        }).catch (function(error) {
          if (error && error.response && error.response.data) {
              console.log("Failed to get list of existing tags");
          } else {
            axiosError(error, null, props.setAlertDialogInput);
          }
        });

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleSelectionChange = e => {
      let tag = e.target.options[e.target.selectedIndex].value;
      if (tag !== "") {
          setTag(tag);
          setValidate(false);
      }
  }
  
  const handleInputChange = e => {
      const val = e.target.value;  
      if (val.trim().length > 1) {
          setValidate(false);
      }
      //setNewValue(val);
      setTag(val);
  };

  const handleChange = e => {
      const val = e.target.value; 
      const name = e.target.name;
      if (name === "prefix") setPrefix (val);
      else setPostfix (val); 
  };

  const [tagMode, setTagMode] = useState(tag ? "new" : "existing"); // "existing" | "new" | "keepFile"

  const handleTagModeChange = (mode) => {
    setTagMode(mode);
    if (mode === "keepFile") setTag(null);
  };

  function handleSubmit(e) {
    setShowLoading(true);
    setTextAlertInput({"show": false, id: ""});

    let file = {
        identifier: uploadedCollectionFile.identifier,
        originalName: uploadedCollectionFile.originalName,
        fileFolder: uploadedCollectionFile.fileFolder,
        fileFormat: uploadedCollectionFile.fileFormat,
    }

    var url = stringConstants.api.importcollection;
    if (tag && tag.length > 0) {
      url += "?tag=" + tag;
      if (prefix & prefix.length > 0) {
        url += "&prefix=" + prefix;
      }
      if (postfix && postfix.length > 0) {
        url += "&postfix=" + postfix;
      }
    } else {
      if (prefix & prefix.length > 0) {
        url += "?prefix=" + prefix;
      } 
      if (postfix && postfix.length > 0) {
        if (url.includes("prefix")) {
          url += "&postfix=" + postfix;
        } else {
          url += "?postfix=" + postfix;
        }
      }
    }
    postJson (url, 
        file, getAuthorizationHeader()).then ( (data) => {
        setShowLoading(false);
        navigate("/collections");
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

  return (
    <>
    <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="Import Collection From File"
            subTitle="Import a collection to your list by uploading a file (downloaded using the export option)."
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
                  <Col xs={12} lg={9}>
                    <FormLabel label="Upload Collection File" className="required-asterik" />
                    <ResumableUploader
                      headerObject={getAuthorizationHeader()}
                      fileType={fileDetails.fileType}
                      uploadService={TABLEMAKER_API + stringConstants.api.upload}
                      maxFiles={1}
                      setUploadedFile={setUploadedCollectionFile}
                      required={true}
                    />
                  </Col>
                 
                  <Col xs={12} lg={9}>
                    <FormLabel label="Handle possible duplicate tags"/>
                  </Col>
                      <Col xs={12} lg={9} className="mb-2">
                        <Row>
                          <Col xs={1} lg={1}>
                          <Form.Check
                              type="radio"
                              name="tagGroup"
                              id="keepExistingTag"
                              checked={tagMode === "keepFile"}
                              onChange={() => handleTagModeChange("keepFile")}/>
                          </Col>
                          <Col>
                            <Form.Label>Keep existing glycan tags in the file</Form.Label>
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={12} lg={9} className="mb-3">
                        <Row>
                      <Col xs={2} lg={1}>
                          <Form.Check
                              type="radio"
                              name="tagGroup"
                              id="existingTag"
                              checked={tagMode === "existing"}
                              onChange={() => handleTagModeChange("existing")}/>
                      </Col>
                      <Col xs={6} lg={8}>
                          <Form.Select
                              disabled={tagMode !== "existing"}
                              onChange={handleSelectionChange}>
                              <option value="">Select</option>
                              {tagList.map((glycanTag, index) => (
                                  <option value={glycanTag.label} key={index}>
                                      {glycanTag.label}
                                  </option>
                              ))}
                          </Form.Select>
                      </Col>
                      </Row>
                  </Col>
                  <Col xs={12} lg={9} className="mb-3">
                      <Row>
                      <Col xs={2} lg={1}>
                          <Form.Check
                              type="radio"
                              name="tagGroup"
                              id="newTag"
                              checked={tagMode === "new"}
                              onChange={() => handleTagModeChange("new")}/>
                      </Col>
                      <Col xs={6} lg={8}>
                          <Form.Control
                              type="text"
                              name="tag"
                              maxLength={255}
                              disabled={tagMode !== "new"}
                              placeholder={"Enter new tag"}
                              isInvalid={validate}
                              onChange={handleInputChange}
                          />
                          <Feedback message="Please enter a valid tag" />
                      </Col>
                      </Row>
                  </Col>
                  {collectionType === "GLYCOPROTEIN" &&
                  <Col xs={12} lg={9} className="mb-3">
                  <Row>
                  <Col xs={12}>
                  <FormLabel label="Rename Glycoproteins (if necessary)"/>
                  </Col>
                  <Col>
                    <FormLabel label="Prepend" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="prefix"
                      placeholder="Enter text to prepend"
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </Col>
                  <Col>
                    <FormLabel label="Append" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="postfix"
                      placeholder="Enter text to append"
                      onChange={handleChange}
                      maxLength={10}
                    />
                  </Col>
                  </Row></Col>}
                </Form.Group>

                <div className="text-center">
                  <Button onClick={()=> navigate("/collections")} 
                    className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20"> Back to Collections</Button>

                  <Button
                    type="submit"
                    disabled={!uploadedCollectionFile}
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

export { CollectionFromFile };