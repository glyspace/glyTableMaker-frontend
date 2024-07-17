import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { axiosError } from "../utils/axiosError";
import { getJson } from "../utils/api";
import FeedbackWidget from "../components/FeedbackWidget";

const ForgotPassword = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    username: "",
  });

  const [validated, setValidated] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );
  const handleChange = (e) => {
    const name = e.target.name;
    const newValue = e.target.value;

    setUserInput({ [name]: newValue });
  };

  return (
    <>
    <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Forgot Password"} />

          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                setAlertDialogInput({ show: input });
              }}
            />

          {showSuccessMessage && (
            <Alert variant="success" style={{ textAlign: "justify" }}>
              {showSuccessMessage}
              <div className="text-center"><Link to="/login">Return To Log In</Link></div>
            </Alert>
          )}

          {showSuccessMessage === "" && (
            <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
              <Form.Group as={Row} controlId="username">
                <Col>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder=" "
                    value={userInput.username}
                    onChange={handleChange}
                    required
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>Username</Form.Label>
                  <Feedback message="Please enter your username." />
                </Col>
              </Form.Group>
              <br />
              <div className="text-center">
                <Button type="submit" className="gg-btn-blue">
                  Submit
                </Button>
                <hr />
                <div>
                  <Link to="/login">Return To Log In</Link>
                </div>
                <div>
                  <Link to="/forgotUsername">Forgot username</Link>
                </div>
              </div>
            </Form>
          )}
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    setTextAlertInput({show: false, id: ""});
    setShowSuccessMessage("");
    if (e.currentTarget.checkValidity() === true) {
      const username = userInput.username;
      getJson ("api/account/"+username+ "/password", {}).then ( (data) => {
        passwordRecoverySuccess();
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {  // system error/internal error 
            axiosError(error, null, setAlertDialogInput);
        }
      });
    }
  }

  function passwordRecoverySuccess() {
    setShowSuccessMessage(
      `Your password is reset and a new password was sent to the email address of this account. 
      If you do not receive the email in the next few minutes please also check your Junk mail folder.`
    );
  }
};

export { ForgotPassword };