import React, { useEffect, useReducer, useState } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";
import { Feedback, Title } from "../components/FormControls";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from "../components/DialogAlert";


const Profile = (props) => {
  const profile = {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    affiliationWebsite: "",
    groupName: "",
    department: "",
  };

  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    profile
  );

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  var base = process.env.REACT_APP_BASENAME;
  const username = window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser");
  const [validated, setValidate] = useState(false);
  const [isUpdate, setIsupdate] = useState(false);
  const [title, setTitle] = useState("User Profile");

  useEffect(props.authCheckAgent, []);

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleChange = (e) => {
    var name = e.currentTarget.name;
    var value = e.currentTarget.value;

    if ((!value && value === "") || value === " ") {
      setValidate(true);
    } else {
      setValidate(false);
    }

    setUserProfile({ [name]: value });
  };

  const editUser = () => {
    setTitle("Edit User Profile");
    setIsupdate(true);
  };

  return (
    <>
      <Container maxWidth="md" className="card-page-container">
        <div className="card-page-md">
          <Title title={title} />

          <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                setAlertDialogInput({ show: input });
              }}
            />

          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="firstName">
                  <Form.Control
                    type="text"
                    name="firstName"
                    disabled={!isUpdate}
                    onChange={handleChange}
                    value={userProfile.firstName}
                    required
                    maxLength={100}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={isUpdate ? "label required-asterik" : "label"}>First Name</Form.Label>
                  <Feedback className="feedback" message="First name is required" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastName">
                  <Form.Control
                    type="text"
                    name="lastName"
                    disabled={!isUpdate}
                    onChange={handleChange}
                    value={userProfile.lastName}
                    required
                    maxLength={100}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={isUpdate ? "label required-asterik" : "label"}>Last Name</Form.Label>
                  <Feedback className="feedback" message="Last name is required" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="username">
                  <Form.Control type="text" name="userName" disabled value={userProfile.userName} 
                        className={"custom-text-fields"}/>
                  <Form.Label className={"label"}>Username</Form.Label>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="email">
                  <Form.Control type="text" name="email" disabled value={userProfile.email} 
                       className={"custom-text-fields"}/>
                  <Form.Label className={"label"}>Email</Form.Label>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="groupName">
                  <Form.Control
                    type="text"
                    name="groupName"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.groupName}
                    maxLength={250}
                    className="custom-text-fields"
                  />
                  <Form.Label className={"label"}>Group Name</Form.Label>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="department">
                  
                  <Form.Control
                    type="text"
                    name="department"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.department}
                    maxLength={250}
                    className="custom-text-fields"
                  />
                  <Form.Label className={"label"}>Department</Form.Label>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="affiliation">
                  <Form.Control
                    type="text"
                    name="affiliation"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.affiliation}
                    maxLength={250}
                    className="custom-text-fields"
                  />
                  <Form.Label className={"label"}>Organization/Institution</Form.Label>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="affiliationWebsite">
                  <Form.Control
                    type="url"
                    name="affiliationWebsite"
                    onChange={handleChange}
                    disabled={!isUpdate}
                    value={userProfile.affiliationWebsite}
                    maxLength={250}
                    pattern="(\b(https?)://)?[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]"
                    className="custom-text-fields"
                  />
                  <Form.Label className={"label"}>Website</Form.Label>
                  <Feedback className={"feedback"} message="Please enter a valid affiliation website." />
                </Form.Group>
              </Col>
            </Row>
            <div className={!isUpdate ? "text-center mt-2" : "hide-content"}>
                <Button className="gg-btn-blue mt-3 gg-mr-20" onClick={() => editUser()}>
                  Edit
                </Button>
               
                <Button onClick={()=> navigate("/changePassword")} 
                  className="gg-btn-blue mt-3 gg-ml-20">Change Password</Button>
               
             </div>

            <div className={isUpdate ? "text-center mt-2" : "hide-content"}>
              <Button className="gg-btn-outline mt-3 gg-mr-20" onClick={() => handlecancel()}>
                Cancel
              </Button>
              <Button className="gg-btn-blue mt-3 gg-ml-20" type="submit" disabled={validated}>
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function getProfile() {
    getJson ("api/account/user/" + username, getAuthorizationHeader()).then (({ data }) => {
        setUserProfile(data.data);
    }).catch(function(error) {
        axiosError(error, null, setAlertDialogInput);
      });
  }

  function handlecancel() {
    setTitle("User Profile");
    setIsupdate(false);
    getProfile();
  }

  function handleSubmit(e) {
    setValidate(true);

    if (e.currentTarget.checkValidity()) {
        postJson("api/account/update/"+ username, userProfile, getAuthorizationHeader()).then (({ data }) => {
            setTitle("User Profile");
            setIsupdate(false);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    e.preventDefault();
  }
};

Profile.propTypes = {
  authCheckAgent: PropTypes.func,
};

export { Profile };