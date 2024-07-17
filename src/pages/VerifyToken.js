import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { Feedback, Title } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Container from "@mui/material/Container";
import TextAlert from "../components/TextAlert";
import { getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";

const VerifyToken = () => {
  const [confirmRegistration, setConfirmRegistration] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      token: "",
    }
  );

  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();
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

    setConfirmRegistration({ [name]: newValue });
  };

  return (
    <>
      <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Verify Sign Up"} />

          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
            alertInput={alertDialogInput}
            setOpen={input => {
                setAlertDialogInput({ show: input });
            }}
          />

          <Form noValidate validated={validated} onSubmit={(e) => handleSubmit(e)}>
            <p style={{ color: "black" }}>
              Please enter the token provided to you in verification email.
            </p>
            <Form.Group as={Row} controlId="token">
              <Col>
                <Form.Control
                  type="text"
                  name="token"
                  placeholder=" "
                  value={confirmRegistration.token}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Token</Form.Label>
                <Feedback message="Please enter a valid token." />
              </Col>
            </Form.Group>
            <br />
            <div className="text-center">
              <Button type="submit" className="gg-btn-blue">
                Verify Sign Up
              </Button>
              <hr />
              <div>
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    setTextAlertInput({show: false, id: ""});

    const token = confirmRegistration.token;

    if (e.currentTarget.checkValidity()) {

      getJson ("api/account/registrationConfirm?token=" + token, {}).then ( (data) => {
        console.log(data);
        navigate("/login");
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
            // expired or not valid etc.
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            return false;
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
      });
    }
    e.preventDefault();
  }
};

export { VerifyToken };