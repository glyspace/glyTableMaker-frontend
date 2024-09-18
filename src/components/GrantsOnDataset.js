import React from "react";
import { Row, Col, Accordion, Card } from "react-bootstrap";
import { Grants } from "../pages/Grants";
import { CustomToggle } from "../utils/api";

const GrantsOnDataset = props => {
  return (
    <>
      {!props.fromPublicDatasetPage ? (
        <Accordion defaultActiveKey={0} className="mb-4">
          <Card>
            <Card.Header>
              <Row>
                <Col className="font-awesome-color">
                  <span className="descriptor-header">Grants</span>
                </Col>

                <Col style={{ textAlign: "right" }}>
                  <CustomToggle eventKey={0} classname={"font-awesome-color"} />
                </Col>
              </Row>
            </Card.Header>
            <Accordion.Collapse eventKey={0}>
              <Card.Body>
                <Grants
                  addGrant={props.addGrant}
                  grants={props.grants}
                  delete={props.delete}
                />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      ) : (
        <Grants grants={props.grants} fromPublicDatasetPage={props.fromPublicDatasetPage} />
      )}
    </>
  );
};

export { GrantsOnDataset };
