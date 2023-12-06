import React, { useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import './App.css';
import Footer from './components/Footer';
//import { ThemeProvider } from '@emotion/react;
import "bootstrap/dist/css/bootstrap.min.css";
import { TopNavBar } from "./components/TopNavBar";
import { TableMakerRoutes } from "./TableMakerRoutes";
import { Container } from "react-bootstrap";
import { library } from "@fortawesome/fontawesome-svg-core";
import { ScrollToTopBtn } from "./components/ScrollToTop";
import { faEdit, faTrashAlt, faClone, faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import CssBaseline from '@mui/material/CssBaseline';
//import { useAuth0 } from '@auth0/auth0-react';


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const loginUpdater = flag => setLoggedIn(flag);
  const logoutHandler = e => logout(e);
  //const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  library.add(
    faTrashAlt,
    faEdit,
    faClone,
    faEyeSlash,
    faEye,
  );
  return (
    <div className="App">
      <TopNavBar loggedInFlag={loggedIn} logoutHandler={logoutHandler} />
      <CssBaseline />
      <ScrollToTopBtn />
      <Container  className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}
         >
          <div className="w-100" style={{ maxWidth: "400px" }}>
            <TableMakerRoutes updateLogin={loginUpdater} authCheckAgent={checkAuthorization}/>
            </div>
            </Container>
        {/* <Footer/> */}
    </div>
  );

  function getLoginStatus() {
    var base = process.env.REACT_APP_BASENAME;
    var token = window.localStorage.getItem(base ? base + "_token" : "token");
    //if token exists
    if (token) {
      // check if it is expired
      var current_time = Date.now() / 1000;
      var jwt = parseJwt(token);
      if (jwt.exp === "undefined") return true; // never expires
      if (jwt.exp < current_time) {
        /* expired */
        window.localStorage.removeItem(base ? base + "_token" : "token");
        window.localStorage.removeItem(base ? base + "_loggedinuser" : "loggedinuser");
        //window.localStorage.clear();
        token = null;
        return false;
      }
    }
    //if token does not exist, user hasn't logged in
    else {
      // unauthorizedMessage(DEFAULT_MESSAGES.NOTLOGGEDIN, 'login.html');
      return false;
    }
  
    //if token was cleared because of expiry
    if (!token) {
      // unauthorizedMessage(DEFAULT_MESSAGES.TIMEDOUT, 'login.html');
      return false;
    }
    return true;
  }

  function checkAuthorization() {
    var authorized = getLoginStatus();
    setLoggedIn(authorized); //async
    var loginNotRequiredPages = [
      "",
      "login",
      "forgotUsername",
      "forgotPassword",
      "register",
      "emailConfirmation",
      "verifyToken"
    ];
    var pagename = getPageName(location);

    var redirectFrom = "";
    if (location.state && location.state.redirectedFrom) {
      redirectFrom = location.state.redirectedFrom;
    } else {
      if (authorized && location.pathname === "/login") {
        redirectFrom = "/";
        navigate("/", {
          state: { redirectedFrom: redirectFrom }
        });
      } else {
        redirectFrom = location.pathname;
      }
    }

    if (!authorized && !loginNotRequiredPages.includes(pagename)) {
      navigate("/login", {
        state: { redirectedFrom: redirectFrom }
      });
    }
  }

  function logout(e) {
    e.preventDefault();
    var base = process.env.REACT_APP_BASENAME;
    window.localStorage.removeItem(base ? base + "_token" : "token");
    window.localStorage.removeItem(base ? base + "_loggedinuser" : "loggedinuser");
    setLoggedIn(false);
    navigate("/");
  }

  function parseJwt(token) {
    //var token1 = token.split(" ")[1];
    var base64Url = token.split(".")[1];
    var atobResult = atob(base64Url);
    var base64 = decodeURIComponent(
      atobResult
        .split("")
        .map(function(c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(base64);
  }

  function getPageName(history) {
    var path = location.pathname;
    var pagename = path.substring(1, path.indexOf("/", 1) > 0 ? path.indexOf("/", 1) : path.length);
    return pagename;
  }
}

export default App;
