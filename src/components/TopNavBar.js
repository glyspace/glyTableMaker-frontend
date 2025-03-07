import React from "react";
import "./TopNavBar.css";
import { Link } from "react-router-dom";
import { Nav, Navbar, Col, NavDropdown, NavLink } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../images/glygen-logoW-top.svg";
import { BiLogOut } from "react-icons/bi";
import { BiLogIn } from "react-icons/bi";
import { FaUserGear } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { FaUserPlus } from "react-icons/fa";
import stringConstants from '../data/stringConstants.json';

const TopNavBar = (props) => {
  return (
    <React.Fragment>
      <Navbar collapseOnSelect className="gg-blue-bg topbar" expand="lg">
        <Navbar.Brand>
          <Link to="/">
            <img src={logo} alt="GlyGen logo" />
          </Link>
        </Navbar.Brand>
        {<Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-dark" />}
        <Navbar.Collapse className="gg-blue-bg" id="basic-navbar-nav">
          <Col xs={12} sm={12} md={12} lg={6} xl={8}>
          <Nav activeKey={window.location.pathname}>
              <LinkContainer className="gg-nav-link" to="/" exact>
                <Nav.Link>HOME</Nav.Link>
              </LinkContainer>
              {/* Top bar menu links when logged in */}
              <LinkContainer className="gg-nav-link" to={stringConstants.routes.dashboard} exact>
                <Nav.Link>PUBLISH</Nav.Link>
              </LinkContainer>
              <NavDropdown className={"gg-dropdown-navbar gg-nav-link"} title="SEARCH" id="basic-nav-dropdown" exact="true">
                <LinkContainer to="/glycanSearch">
                  <NavDropdown.Item className="gg-nav-link">
                    By Glycan
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/glycoproteinSearch">
                  <NavDropdown.Item className="gg-nav-link">
                    By Glycoprotein
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/datasetDetailSearch">
                  <NavDropdown.Item className="gg-nav-link">
                    By Dataset Detail
                  </NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
            </Nav>
          </Col>
          <Col xs={12} sm={12} md={12} lg={6} xl={4} className="align-right-header">
            <Nav activeKey={window.location.pathname}>
              {/* Top bar right side links when logged in */}
              {props.loggedInFlag && (
                <>
                  <NavDropdown title="USER" id="basic-nav-dropdown" className="gg-nav-link gg-dropdown-navbar">
                    <LinkContainer to="/profile">
                      <NavDropdown.Item className="dropdown-item">
                      <span style={{ paddingRight: "10px" }}>
                        <FaUser key={"user"} size="16px" className="mb-1" title="user" />
                      </span>PROFILE</NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to="/settings">
                      <NavDropdown.Item className="dropdown-item">
                      <span style={{ paddingRight: "10px" }}>
                        <FaUserGear key={"settings"} size="16px" className="mb-1" title="settings" />
                      </span>
                        SETTINGS</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                  <LinkContainer to="/dummy" className="gg-nav-link">
                    <Nav.Link onClick={props.logoutHandler}>
                      <span style={{ paddingRight: "10px" }}>
                        <BiLogOut key={"logout"} className="mb-1" size="22px" title="logout" />
                      </span>
                      LOG OUT
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
              {/* Top bar right side links when not logged in */}
              {!props.loggedInFlag && (
                <>
                  <LinkContainer to="/login" className="gg-nav-link" exact>
                    <Nav.Link>
                      <span style={{ paddingRight: "10px" }}>
                        <BiLogIn key={"login"} size="22px" className="mb-1" title="login" />
                      </span>
                      LOG IN
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register" className="gg-nav-link" exact>
                    <Nav.Link>
                      <span style={{ paddingRight: "10px" }}>
                        <FaUserPlus key={"signup"} size="22px" className="mb-1" title="signup" />
                      </span>
                      SIGN UP
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Col>
        </Navbar.Collapse>
      </Navbar>
    </React.Fragment>);
}


export { TopNavBar };