import React, { useState } from "react";

import { useNavigate, useLocation, Outlet, Routes, Route, BrowserRouter } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { TopNavBar } from "./components/TopNavBar";
import TableMakerRoutes from "./TableMakerRoutes";
import { library } from "@fortawesome/fontawesome-svg-core";
import { ScrollToTopBtn } from "./components/ScrollToTop";
import { faEdit, faTrashAlt, faClone, faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import CssBaseline from '@mui/material/CssBaseline';
import { parseJwt } from "./utils/api";
import { Container } from "react-bootstrap";
import Home  from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Signup } from "./pages/Signup";
import { EmailConfirmation } from "./pages/EmailConfirmation";
import { VerifyToken } from "./pages/VerifyToken";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ForgotUsername } from "./pages/ForgotUsername";
import { ChangePassword } from "./pages/ChangePassword";
import OAuth2Redirect from './components/OAuth2Redirect'


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
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login updateLogin={loginUpdater} authCheckAgent={checkAuthorization}/>} />
          <Route path="/profile" element={<Profile authCheckAgent={checkAuthorization} />} />
          <Route path='/oauth2/redirect/' element={<OAuth2Redirect updateLogin={loginUpdater} authCheckAgent={checkAuthorization} />} />
          <Route path="/register" element={<Signup/>} />
          <Route path="/emailConfirmation">
            <Route path=":token" element={<EmailConfirmation/>} />
          </Route>
          <Route path="/verifyToken" element={<VerifyToken/>} />
          <Route path="/forgotPassword" element={<ForgotPassword/>} />
          <Route path="/forgotUsername" element={<ForgotUsername/>} />
          <Route path="/changePassword" element={<ChangePassword/>} />
        </Route>
      </Routes>
  );

  function Layout() {
    return (
      <>
      <div className="App">
      <TopNavBar loggedInFlag={loggedIn} logoutHandler={logoutHandler} />
      <CssBaseline />
      <ScrollToTopBtn />
      <Container  className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}>
          <div className="w-100" style={{ maxWidth: "400px" }}>
           <Outlet />
         </div>
      </Container> 
    </div>
      </>
    )
  }

  function getLoginStatus() {
    var base = process.env.REACT_APP_BASENAME;
    var token = window.localStorage.getItem(base ? base + "_token" : "token");
    //if token exists
    if (token) {
      // check if it is expired
      var current_time = Date.now() / 1000;
      try {
        var jwt = parseJwt(token);
      } catch (error) {
        console.log("invalid token, removing the token");
        window.localStorage.removeItem(base ? base + "_token" : "token");
        window.localStorage.removeItem(base ? base + "_loggedinuser" : "loggedinuser");
        setLoggedIn(false);
        return false;
      }
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

  function getPageName(location) {
    var path = location.pathname;
    var pagename = path.substring(1, path.indexOf("/", 1) > 0 ? path.indexOf("/", 1) : path.length);
    return pagename;
  }
}

export default App;
