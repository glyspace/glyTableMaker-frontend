import { Container } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import DialogAlert from "../components/DialogAlert";
import { ResumableUploader} from "../components/ResumableUploader";
import { Loading } from "../components/Loading";
import stringConstants from "../data/stringConstants.json";
import { getAuthorizationHeader, postJson } from "../utils/api";
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

  const fileDetails = {
    fileType: defaultFileType
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

    postJson (stringConstants.api.importcollection, 
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