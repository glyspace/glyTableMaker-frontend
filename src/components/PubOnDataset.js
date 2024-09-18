import React from "react";
import { Link } from "react-router-dom";
import { Form, Row, Col, Button, Accordion, Card, Image } from "react-bootstrap";
import { PublicationCard } from "./PublicationCard";
import plusIcon from "../images/icons/plus.svg";
import { FormLabel } from "./FormControls";
import { CustomToggle } from "../utils/api";
import { Tooltip } from "@mui/material";

const PubOnDataset = props => {
  return (
    <>
      <>
        <Accordion defaultActiveKey={0} className="mb-4">
          <Card>
            <Card.Header>
              <Row>
                <Col className="font-awesome-color">
                  <span className="descriptor-header">Associated Papers</span>
                </Col>

                <Col style={{ textAlign: "right" }}>
                  <CustomToggle eventKey={0} classname="font-awesome-color" />
                </Col>
              </Row>
            </Card.Header>
            <Accordion.Collapse eventKey={0}>
              <Card.Body>
                {!props.fromPublicDatasetPage ? (
                  <>
                    <Form.Group as={Row} controlId="publications" className="mt-2 mb-3">
                      <Col xs={12} lg={9}>
                        <FormLabel label="Add Publication" />
                        <Row>
                          <Col md={6}>{props.getPublicationFormControl()}</Col>
                          <Col md={1}>
                            <Button
                              className="gg-btn-outline-reg"
                              onClick={() => props.getPublication()}
                              disabled={props.newPubMedId && props.newPubMedId.length > 0 ? false : true}
                            >
                              <Tooltip
                                  disableTouchListener
                                  interactive
                                  arrow
                                  placement={"bottom-start"}
                                  classes={{ tooltip: "gg-tooltip" }}
                                  title={<>Add Paper</>}
                                >
                              <Link>
                                  <Image src={plusIcon} alt="plus button" />
                                </Link>
                              </Tooltip>
                            </Button>
                          </Col>
                        </Row>
                      </Col>
                    </Form.Group>

                    {props.publications.map((pub, pubIndex) => {
                      return (
                        <PublicationCard key={pubIndex} {...pub} enableDelete deletePublication={props.deleteRow} />
                      );
                    })}
                  </>
                ) : props.publications.length < 1 ? (
                  <p className="no-data-msg-publication">No data available.</p>
                ) : (
                  props.publications.map((pub, pubIndex) => {
                    return <PublicationCard key={pubIndex} {...pub} />;
                  })
                )}
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </>
    </>
  );
};

export { PubOnDataset };
