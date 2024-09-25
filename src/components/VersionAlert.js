import React from "react";
import PropTypes from "prop-types";
import { Alert, AlertTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CloseIcon from "@mui/icons-material/Close";
import { Card, Col, Row } from "react-bootstrap";
import { Loading } from "./Loading";

export default function VersionAlert(props) {
  const [open, setOpen] = React.useState(true);
  const [style, setStyle] = React.useState("gg-tooltip event-alerts-mb");

  return (
    <div>
      {props.data && props.data.map((obj) => (
        <Collapse in={open} className={style}>
          <Card className="event-alerts-border" >
            <Loading show={props.pageLoading} />
            <Alert
              classes={{
                message: "alert-banner-message",
                icon: "alert-banner-icon gg-align-middle",
              }}
              severity="info"
              action={
                <IconButton
                  aria-label="close"
                  // color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                    setStyle(!style);
                  }}
                >
                  <CloseIcon fontSize="inherit" className="gg-blue" />
                </IconButton>
              }
            >
              <Row>
                {/* {props.data.map((obj) => ( */}
                <Col xs={12} sm={"auto"} className={"mt-1 mb-1"}>
                  <>
                    <AlertTitle>
                      <h5 className={"gg-blue"}>{obj.title}</h5>
                    </AlertTitle>
                    <div>
                      {obj.description}
                    </div>
                    {obj.url && obj.url_name &&
                    <div>
                      <a href={obj.url}>
                        <span className="gg-link">{obj.url_name}</span>
                      </a>
                    </div>}
                  </>
                </Col>
                {/* ))} */}
              </Row>
            </Alert>
          </Card>
        </Collapse>
      ))}
    </div>
  );
}
VersionAlert.propTypes = {
  data: PropTypes.object,
};