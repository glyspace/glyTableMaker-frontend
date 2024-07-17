import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { useParams, Link } from "react-router-dom";
import { Form } from "react-bootstrap";
import { Title } from "../components/FormControls";
import { getJson } from "../utils/api";
import Container from "@mui/material/Container";
import FeedbackWidget from "../components/FeedbackWidget";

const EmailConfirmation = () => {
  const [variant, setVariant] = useState("success");
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  let { token } = useParams();

  useEffect(() => {
    //wsCall("emailconfirm", "GET", { token: token }, false, null, tokenSuccess, tokenFailure);
    getJson ("api/account/registrationConfirm?token=" + token, {}).then ( () => {
        tokenSuccess();
    }).catch (function(error) {
        tokenFailure();
    });
  }, [token]); // passing an empty array as second argument triggers the callback in useEffect only after the initial render thus replicating `componentDidMount` lifecycle behaviour

  return (
    <>
    <FeedbackWidget />
      <Container maxWidth="sm" className="card-page-container">
        <div className="card-page-sm">
          <Title title={"Email Confirmation"} />
          <Form>
            <div>
              <Alert variant={variant} show={unauthorized} className="alert-message line-break-1">
                {errorMessage}
              </Alert>
            </div>
            <br />
            <hr />
            <div className="text-center">
              <Link to="/login">Login</Link>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function tokenSuccess() {
    setUnauthorized(true);
    setErrorMessage("Your account has been successfully activated. Please login.");
  }

  function tokenFailure(response) {
    console.log(response);
    setUnauthorized(true);
    setVariant("danger");
    setErrorMessage(
      "The link from your email has already expired. Please return to sign up and create an account."
    );
  }
};

export { EmailConfirmation };