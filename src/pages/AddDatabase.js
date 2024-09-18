import React, { useReducer, useState} from "react";
import PropTypes from "prop-types";
import { Row, Col, Form, Button } from "react-bootstrap";
import { FormLabel, Feedback } from "../components/FormControls";

const AddDatabase = props => {
  const [validated, setValidate] = useState(false);

  const databaseResource = {
    name: "",
    identifier: "",
    url: ""
  };
  const [database, setDatabase] = useReducer((state, newState) => ({ ...state, ...newState }), databaseResource);

  const handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    setDatabase({ [name]: value });
  };

  function handleSubmit(e) {
    setValidate(true);

    if (e.currentTarget.checkValidity()) {
      props.addDatabase (database);
      props.setShowModal(false);
    }
    e.preventDefault();
  }

  return (
    <>
      <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>

         <Form.Group as={Row} controlId="title" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Database/Resource Name" className="required-asterik" />
            <Form.Control 
                type="text" 
                name="name" 
                required 
                value={database.name} onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="identifier" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="Identifier in Database" />
            <Form.Control type="text" name="identifier" value={database.identifier} onChange={handleChange} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} controlId="url" className="gg-align-center mb-3">
          <Col xs={12} lg={9}>
            <FormLabel label="URL" />
            <Form.Control type="url" name="url" value={database.url} onChange={handleChange} />
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
            disabled={!database.name }
          >
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
};

AddDatabase.propTypes = {
  setShowModal: PropTypes.func,
  addDatabase: PropTypes.func
};

export { AddDatabase };
