import React, { useReducer, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";
import { getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from "../components/DialogAlert";

const AddGrant = props => {
  const [validated, setValidate] = useState(false);
  const [listFundingOrganizations, setListFundingOrganizations] = useState();
  const [otherFO, setOtherFO] = useState();

  const grantPage = {
    fundingOrganization: "",
    identifier: "",
    title: "",
    url: ""
  };
  const [grant, setGrant] = useReducer((state, newState) => ({ ...state, ...newState }), grantPage);

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  useEffect(() => {
    getFundingOrganizations();
  }, [otherFO]);

  const getFundingOrganizations = () => {
    getJson ("api/util/listfundingorganizations").then (({ data }) => {
      if (data.data) {
          setListFundingOrganizations(data.data);
      }
    }).catch(function(error) {
        axiosError(error, null, setAlertDialogInput);
    });
  }

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    setGrant({ [name]: value });
  };

  function handleSubmit(e) {
    setValidate(true);

    // grant;
    if (otherFO) {
      grant.fundingOrganization = otherFO;
    }

    if (e.currentTarget.checkValidity()) {
      props.addGrant (grant);
    }
    e.preventDefault();
  }

  return (
    <>
      <DialogAlert
        alertInput={alertDialogInput}
        setOpen={input => {
            setAlertDialogInput({ show: input });
        }}
      />

      <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
        <Form.Group as={Row} controlId="fundingOrganization" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Funding Organization" className="required-asterik" />

            <Form.Control
              as="select"
              name="fundingOrganization"
              value={grant.fundingOrganization}
              onChange={handleChange}
            >
              <option value="select">select</option>
              {listFundingOrganizations &&
                listFundingOrganizations.map(fundOrg => {
                  return <option value={fundOrg}>{fundOrg}</option>;
                })}
            </Form.Control>
          </Col>
        </Form.Group>

        {grant.fundingOrganization === "Other" && (
          <>
            <Form.Group as={Row} controlId={"fundOrg"} className="gg-align-center mt-0 pt-0">
              <Col xs={12} lg={9}>
                <Form.Control
                  name="otherFO"
                  type="text"
                  placeholder="enter funding organization"
                  value={otherFO}
                  onChange={e => {
                    setOtherFO(e.target.value);
                  }}
                  maxLength={50}
                />
              </Col>
            </Form.Group>
          </>
        )}

        <Form.Group as={Row} controlId="grantNumber" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Grant Number" />
            <Form.Control type="text" name="identifier" value={grant.grantNumber} onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="title" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Grant Title" className="required-asterik" />
            <Form.Control type="text" name="title" value={grant.title} onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="url" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="URL" />
            <Form.Control type="url" name="url" value={grant.url} onChange={handleChange} />
            <Feedback message={"Enter valid URL"} />
          </Col>
        </Form.Group>

        <div className="text-center mb-4 mt-4">
          <Button className="gg-btn-outline mt-2 gg-mr-20" onClick={() => props.setShowModal(false)}>
            Cancel
          </Button>

          <Button
            type="submit"
            className="gg-btn-blue mt-2 gg-ml-20"
            disabled={!grant.title || !grant.fundingOrganization}
          >
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

AddGrant.propTypes = {
  setShowModal: PropTypes.func,
  addGrant: PropTypes.func
};

export { AddGrant };
