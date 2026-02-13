import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Feedback, Title } from "../components/FormControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "@mui/material/Container";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { getAuthorizationHeader, putJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import FeedbackWidget from "../components/FeedbackWidget";

const ChangePassword = () => {
  const { state } = useLocation();
  const { forceLogout } = state ? state : false;
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const [validated, setValidated] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEye, setShowEye] = useState(false);
  const [showEye2, setShowEye2] = useState(false);
  const [showEye3, setShowEye3] = useState(false);
  const [viewCurrentPassword, setViewCurrentPassword] = useState(false);
  const [viewNewPassword, setViewNewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );


  const history = useNavigate();

  const handleChange = (e) => {
    //setValidated(true);
    const name = e.target.name;
    const newValue = e.target.value;

    setShowError(false);
    setTextAlertInput({"show": false, id: ""});
    if (newValue) {
      if (name === "currentPassword") setShowEye(true);
      if (name === "newPassword") setShowEye2(true);
      if (name === "confirmPassword") setShowEye3(true);
    }
    setUserInput({ [name]: newValue });
    if (!e.currentTarget.checkValidity()) {
      if (name === "currentPassword") setShowEye(false);
      if (name === "newPassword") setShowEye2(false);
      if (name === "confirmPassword") setShowEye3(false);
    }
  };

  return (
    <>
      <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Change Password"} />

          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                setAlertDialogInput({ show: input });
              }}
            />
          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Form.Group as={Row} controlId="currentpassword">
              <Col>
                <Form.Control
                  type={viewCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  placeholder=" "
                  value={userInput.currentPassword}
                  onChange={handleChange}
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Current Password</Form.Label>
                <Feedback className={"feedback"} message="Please enter current password." />

                {showEye &&
                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewCurrentPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewCurrentPassword(!viewCurrentPassword)}
                />}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="newpassword">
              <Col>
                <Form.Control
                  type={viewNewPassword ? "text" : "password"}
                  placeholder=" "
                  name="newPassword"
                  value={userInput.newPassword}
                  onChange={handleChange}
                  pattern="^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{5,30}$"
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>New Password</Form.Label>
                <Feedback className={"feedback"} message="Password must contain at least:" />
                <Feedback className="feedback ml-2" message={`* 5 - 30 characters in length,`} />
                <Feedback className="feedback ml-2" message={`* at least 1 uppercase character,`} />
                <Feedback className="feedback ml-2" message={`* at least 1 lowercase character,`} />
                <Feedback className="feedback ml-2" message={`* at least 1 numeric value,`} />
                <Feedback className="feedback ml-2" message={`* at least 1 special character (!@#$%^&).`} />

                {showEye2 &&
                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewNewPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewNewPassword(!viewNewPassword)}
                />}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="confirmpassword">
              <Col>
                <Form.Control
                  type={viewConfirmPassword ? "text" : "password"}
                  placeholder=" "
                  value={userInput.confirmPassword}
                  onChange={handleChange}
                  name="confirmPassword"
                  required
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Confirm Password</Form.Label>
                <Feedback className={"feedback"} message="Please confirm password." />

                {showEye3 &&
                <FontAwesomeIcon
                  key={"view"}
                  icon={["far", viewConfirmPassword ? "eye" : "eye-slash"]}
                  size="xs"
                  title="password"
                  className={"password-visibility"}
                  onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                />}
              </Col>
            </Form.Group>

            <Row className="mt-2">
              <Col md={6}>
                  <Button onClick={()=> navigate("/profile")}
                  className="link-button-outline mt-3">Cancel</Button>
              </Col>
              <Col md={6}>
                <Button type="submit" className="link-button mt-3" disabled={showError}>
                  Submit
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    setValidated(true);
    setTextAlertInput({"show": false, "id": ""});
    var base = process.env.REACT_APP_BASENAME;
    const username = window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser");

    if (userInput.newPassword !== userInput.confirmPassword) {
        setTextAlertInput ({"show": true, "id" : "", "message": "New and confirm passwords must match."});
    } else if (e.currentTarget.checkValidity()) {
      const changePassword = {
        currentPassword: userInput.currentPassword,
        newPassword: userInput.newPassword,
      };

      putJson ("api/account/" + username + "/password", changePassword, getAuthorizationHeader()).then ( (data) => {
        passwordChangeSuccess(data);
      }).catch (function(error) {
        setShowError(true);
        if (error && error.response && error.response.data) {
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
      });
    } else {
      setShowEye(false);
      setShowEye2(false);
      setShowEye3(false);
    }
    e.preventDefault();
  }

  function passwordChangeSuccess(response) {
    console.log(response);
    if (forceLogout) {
      var base = process.env.REACT_APP_BASENAME;
      window.localStorage.removeItem(base ? base + "_token" : "token");
      window.localStorage.removeItem(base ? base + "_loggedinuser" : "loggedinuser");
      window.localStorage.removeItem(base ? base + "_loggedinuserrole" : "loggedinuserrole");
      history ("/login");
    } else {
      history("/profile");
    }
  }

};

export { ChangePassword };