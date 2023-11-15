import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button, Alert } from "react-bootstrap";
import "./Login.css";
import { Feedback, Title } from "../components/FormControls";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

const ForgotUsername = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    email: "",
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
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Forgot Username"} />

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
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <Form.Group as={Row} controlId="email">
              <Col>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder=" "
                  value={userInput.email}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Email address</Form.Label>
                <Feedback message="Please enter a valid email." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit" className="gg-btn-blue">
                Submit
              </Button>
              <hr />
              <Link to="/login">Return To Log In</Link>
            </div>
            &nbsp;&nbsp;
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const email = userInput.email;
      getJson ("api/account/recover?email="+email, {}).then ( (data) => {
        usernameRecoverySuccess();
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {  // system error/internal error 
            axiosError(error, null, setAlertDialogInput);
        }
      });

    }
    e.preventDefault();
  }

  function usernameRecoverySuccess() {
    setShowSuccessMessage(
      `An email with information to access your account was sent to email address. If you do not receive the email in the next few minutes please also check your Junk mail folder.`
    );
  }
};

export { ForgotUsername };