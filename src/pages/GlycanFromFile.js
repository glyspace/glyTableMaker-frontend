import { Container } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import DialogAlert from "../components/DialogAlert";
import { ResumableUploader} from "../components/ResumableUploader";
import { Loading } from "../components/Loading";
import stringConstants from "../data/stringConstants.json";
import { getAuthorizationHeader, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import { axiosError } from "../utils/axiosError";
import Tag from "../components/Tag";

const GlycanFromFile = props => {

  const [searchParams] = useSearchParams();
  let type = searchParams ? searchParams.get("type") : "gws";

  useEffect(() => {
      props.authCheckAgent();

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );
  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );

  const [title, setTitle] = useState("Add Glycans From File");
  const [tag, setTag] = useState("");
  const [validate, setValidate] = useState(false);
  const navigate = useNavigate();

  const defaultFileType = "*/*";
  const TABLEMAKER_API = process.env.REACT_APP_API_URL;

  const fileDetails = {
    fileType: defaultFileType
  };

  const handleChange = e => {
    const newValue = e.target.value;  
    if (newValue.trim().length > 1) {
        setValidate(false);
    }
    setTag(newValue);
  };

  function handleSubmit(e) {
    setShowLoading(true);
    setTextAlertInput({"show": false, id: ""});

    let file = {
        identifier: uploadedGlycanFile.identifier,
        originalName: uploadedGlycanFile.originalName,
        fileFolder: uploadedGlycanFile.fileFolder,
        fileFormat: uploadedGlycanFile.fileFormat
      }

    postJson (stringConstants.api.addglycanfromfile + "?filetype=" + type.toUpperCase() + "&tag=" + tag, 
        file, getAuthorizationHeader()).then ( (data) => {
        glycanUploadSucess(data);
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

  function glycanUploadSucess(response) {
    setShowLoading(false);
    navigate("/glycans");
  }

  return (
    <>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title={title}
            subTitle="Add glycans to your list by uploading a file using one of the specified file formats."
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
                    <FormLabel label="Upload Glycan File" className="required-asterik" />
                    <ResumableUploader
                      headerObject={getAuthorizationHeader()}
                      fileType={fileDetails.fileType}
                      uploadService={TABLEMAKER_API + stringConstants.api.upload}
                      maxFiles={1}
                      setUploadedFile={setUploadedGlycanFile}
                      required={true}
                    />
                  </Col>
                  <Col xs={12} lg={9}>
                  <FormLabel label="Add Tag"/>
                    <Tag validate={validate} setValidate={setValidate}
                        setTag={setTag}
                        setAlertDialogInput={setAlertDialogInput}
                    />
                  </Col>
                </Form.Group>

                <div className="text-center">
                  <Link to="/glycans">
                    <Button className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20"> Back to Glycans</Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={!uploadedGlycanFile}
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

export { GlycanFromFile };
