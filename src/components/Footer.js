import React from "react";
import { Link } from "react-router-dom";
import logoFooter from "../images/glygen-logoW-top.svg";
import { Navbar, Col, Row, Container } from "react-bootstrap";
//import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import "../App.css";
import useCustomStyles from "../utils/useCustomStyles";
import { useTheme } from "@emotion/react";

const styles = (theme) => ({
  navbarText: {
    color: "#fff !important",
  },
  link: {
    color: "#afd9fd !important",
    "&:hover": {
      color: "#57affa !important",
    },
  },
  univLogo: {
    padding: "10px",
  },
  footerUnivLogo: {
    padding: "20px 10px 0 10px",
  },
});


export default function Footer() {
  const theme = useTheme();
  const classes = useCustomStyles(styles, theme);
  return (
    <React.Fragment>
      <div className="gg-blue-bg gg-align-center">
        <Container maxWidth="xl" className="justify-content-center text-center">
          <Row className="justify-content-center mt-1 mb-1">
            <Col xs={12} md={12} className="mt-2">
              <Navbar.Brand>
                <Link to="/">
                  <img className="justify-content-center" src={logoFooter} alt="GlyGen logo" />
                </Link>
              </Navbar.Brand>
            </Col>
            <Col xs={12} md={"auto"}>
            <Box display="flex" className="box-footer">
                <Navbar.Text className={classes.navbarText}>
                  GlyGen is supported and funded by the{" "}
                  <a
                    href="https://commonfund.nih.gov/glycoscience"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.link}
                  >
                    NIH Glycoscience Common Fund{" "}
                  </a>
                  under the grant #{" "}
                  <a
                    href="https://reporter.nih.gov/project-details/9942478"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={classes.link}
                  >
                    1U01GM125267&nbsp;-&nbsp;01
                  </a>
                </Navbar.Text>
             
            </Box>
             </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
}