import { Container } from "@mui/material";
import { useEffect, useReducer, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import FeedbackWidget from "../components/FeedbackWidget";
import ExcelParameters from "../components/ExcelParameters";

const GlycanFromFile = props => {

  const [searchParams] = useSearchParams();
  let type = searchParams ? searchParams.get("type") : "gws";

  useEffect(() => {
      props.authCheckAgent();

      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showLoading, setShowLoading] = useState(false);
  const [uploadedGlycanFile, setUploadedGlycanFile] = useState();
  const [excelParameters, setExcelParameters] = useState({"columnNo": 1, "startRow": 1, "sheetNumber" : 1, "sheetName": null});
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

  function handleSubmit(e) {
    setShowLoading(true);
    setTextAlertInput({"show": false, id: ""});

    let file = {
        identifier: uploadedGlycanFile.identifier,
        originalName: uploadedGlycanFile.originalName,
        fileFolder: uploadedGlycanFile.fileFolder,
        fileFormat: uploadedGlycanFile.fileFormat,
        excelParameters: excelParameters
    }

    postJson (stringConstants.api.addglycanfromfile + "?filetype=" + type.toUpperCase() + "&tag=" + tag, 
        file, getAuthorizationHeader()).then ( (data) => {
        setShowLoading(false);
        navigate("/glycans");
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
            title="Add Glycans From File"
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
                  {type === "excel" && 
                  <>
                  <ExcelParameters setParameters={setExcelParameters}/>
                  </>}
                  <Col xs={12} lg={9}>
                  <FormLabel label="Add Tag"/>
                    <Tag validate={validate} setValidate={setValidate}
                        setTag={setTag}
                        setAlertDialogInput={setAlertDialogInput}
                        gettagws="api/data/getglycantags"
                    />
                  </Col>
                </Form.Group>

                <div className="text-center">
                  <Button onClick={()=> navigate("/glycans")} 
                    className="gg-btn-blue5 gg-btn-outline mt-2 gg-mr-20"> Back to Glycans</Button>

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
