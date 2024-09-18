import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Row, Col, Button, Table, Modal } from "react-bootstrap";
import { Loading } from "../components/Loading";
import { AddDatabase } from "./AddDatabase";

const Databases = props => {
  const [showLoading, setShowLoading] = useState(false);
  const [showModal, setShowModal] = useState();

  const getDatabaseModal = () => {
    return (
      <>
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Add Database/Resource</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddDatabase
              addDatabase={props.addDatabase}
              setShowModal={setShowModal}
            />
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    );
  };

  const getDatabaseTable = () => {
    return (
      <>
        {props.associatedDatasources &&
          props.associatedDatasources.map((datasource, index) => {
            return (
              <Table hover style={{ border: "none" }}>
                <tbody style={{ border: "none" }}>
                  <tr style={{ border: "none" }} key={index}>
                    {props.fromPublicDatasetPage
                      ? databasePublicTable(datasource, index)
                      : databaseTable(datasource, index)}
                  </tr>
                </tbody>
              </Table>
            );
          })}
      </>
    );
  };

  const databaseTable = (database, index) => {
    return (
      <>
        <td key={index} style={{ border: "none" }}>
          <div>
            <h5>
              <a href={database.url} target={"_blank"}>
                <strong>{database.name}</strong>
              </a>
            </h5>
          </div>

          <div>
            <Row>
              <Col>{database.identifier}</Col>
            </Row>
          </div>
        </td>

        <td className="text-right" style={{ border: "none" }}>
          <FontAwesomeIcon
            icon={["far", "trash-alt"]}
            size="lg"
            title="Delete"
            className="caution-color table-btn"
            onClick={() => props.delete(database.id)}
          />
        </td>
      </>
    );
  };

  const databasePublicTable = (database, index) => {
    return (
      <>
        <div>
          <Row>
            <Col md={3}>
              <a href={database.url} target={"_blank"}>
                <strong>{database.name}</strong>
              </a>
            </Col>
          </Row>
        </div>

        <div>
          <Row>
            <Col>{database.identifier}</Col>
          </Row>
        </div>
      </>
    );
  };

  return (
    <>
      {!props.fromPublicDatasetPage && (
        <>
          <div className="text-center mt-2 mb-4">
            <Button
              className="gg-btn-blue"
              onClick={() => {
                setShowModal(true);
              }}
            >
              Add Database
            </Button>
          </div>
          {showModal && getDatabaseModal()}
        </>
      )}

      {getDatabaseTable()}

      {showLoading ? <Loading show={showLoading} /> : ""}
    </>
  );
};

Databases.propTypes = {
  fromPublicDatasetPage: PropTypes.bool,
  associatedDatasources: PropTypes.array,
  delete: PropTypes.func,
  addDatabase: PropTypes.func,
};

export { Databases };
