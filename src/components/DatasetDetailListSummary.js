import React from "react";
import { Row, Col } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

function getDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var hour = now.getHours();
  var minute = now.getMinutes();
  var second = now.getSeconds();

  if (month.toString().length === 1) {
    month = "0" + month;
  }
  if (day.toString().length === 1) {
    day = "0" + day;
  }
  if (hour.toString().length === 1) {
    hour = "0" + hour;
  }
  if (minute.toString().length === 1) {
    minute = "0" + minute;
  }
  if (second.toString().length === 1) {
    second = "0" + second;
  }
  var dateTime = year + "/" + month + "/" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

const DatasetDetailListSummary = (props) => {
  const title = "Dataset Search Summary";
  const { data, onModifySearch } = props;
  const executionTime = getDateTime();

  const {
    datasetName,
    pmid,
    username,
    lastName,
    group,
    institution,
    department,
    fundingAgency,
  } = data;

  return (
    <>
      <Card className="text-center summary-panel">
        <Card.Header as="h3" className="panelHeadBgr panelHeadText">
          {title}
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Performed on: {executionTime}</strong>
          </Card.Text>

          {/* Dataset Name */}
          {datasetName && datasetName.length > 0 && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Dataset Name:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {datasetName}
              </Col>
            </Row>
          )}

          {/* pmid */}
          {pmid && pmid && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                PMID:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {pmid}
              </Col>
            </Row>
          )}
          {/* username */}
          {username && username && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Username:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {username}
              </Col>
            </Row>
          )}
          {/* lastName */}
          {lastName && lastName && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Last Name:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {lastName}
              </Col>
            </Row>
          )}
          {/* group */}
          {group && group && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Group Name:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {group}
              </Col>
            </Row>
          )}
          {/* institution */}
          {institution && institution && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Institution:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {institution}
              </Col>
            </Row>
          )}
          {/* department */}
          {department && department && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Department:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {department}
              </Col>
            </Row>
          )}
          {/* funding agency */}
          {fundingAgency && fundingAgency && (
            <Row className="summary-table-col">
              <Col align="right" xs={6} sm={6} md={6} lg={6}>
                Funding Organization:
              </Col>
              <Col align="left" xs={6} sm={6} md={6} lg={6}>
                {fundingAgency}
              </Col>
            </Row>
          )}
          <div className="pt-3">
            <Button
              type="button"
              className="gg-btn-outline mr-4 mb-3"
              onClick={() => {
                window.location.reload();
              }}
            >
              Update Results
            </Button>
            <Button type="button" className="gg-btn-blue mb-3" onClick={onModifySearch}>
              Modify Search
            </Button>
          </div>
          <Card.Text>
            ** To perform the same search again using the current version of the database, click{" "}
            <strong>“Update Results”</strong>.
          </Card.Text>
        </Card.Body>
      </Card>
    </>
  );
};

export default DatasetDetailListSummary;
