import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { CustomToggle } from "../utils/api";
import { Databases } from "../pages/Databases";

const DatabasesOnDataset = props => {
  return (
    <>
      {!props.fromPublicDatasetPage ? (
        <Accordion defaultActiveKey={0} className="mb-4">
          <Card>
            {!props.fromPublicDatasetPage ? 
            <Card.Header>
              <Row>
                <Col className="font-awesome-color">
                  <span className="descriptor-header">Databases/Resources</span>
                </Col>

                <Col style={{ textAlign: "right" }}>
                  <CustomToggle eventKey={0} classname={"font-awesome-color"} />
                </Col>
              </Row>
            </Card.Header> : <></>}
            <Accordion.Collapse eventKey={0}>
              <Card.Body>
                <Databases
                  addDatabase={props.addDatabase}
                  associatedDatasources={props.associatedDatasources}
                  delete={props.delete}
                />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      ) : (
        <Databases associatedDatasources={props.associatedDatasources} fromPublicDatasetPage={props.fromPublicDatasetPage} />
      )}
    </>
  );
};

export { DatabasesOnDataset };