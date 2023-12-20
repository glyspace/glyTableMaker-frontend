import React, { useEffect, useState } from "react";

import { useNavigate, useLocation, Outlet, Routes, Route } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { TopNavBar } from "./components/TopNavBar";
import { library } from "@fortawesome/fontawesome-svg-core";
import { ScrollToTopBtn } from "./components/ScrollToTop";
import { faEdit, faTrashAlt, faClone, faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import CssBaseline from '@mui/material/CssBaseline';
import { parseJwt } from "./utils/api";
import { Col, Container, Row } from "react-bootstrap";
import Home  from "./pages/Home";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Signup } from "./pages/Signup";
import { EmailConfirmation } from "./pages/EmailConfirmation";
import { VerifyToken } from "./pages/VerifyToken";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ForgotUsername } from "./pages/ForgotUsername";
import { ChangePassword } from "./pages/ChangePassword";
import OAuth2Redirect from './components/OAuth2Redirect';
import stringConstants from './data/stringConstants.json';
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Collections from "./pages/Collections";
import Glycans from "./pages/Glycans";
import CoC from "./pages/CoC";
import Tablemaker from "./pages/Tablemaker";

const items = [
  { label: stringConstants.sidebar.dashboard, id: "Dashboard", route: stringConstants.routes.dashboard },
  { label: stringConstants.sidebar.glycan, id: "Glycan", route: stringConstants.routes.glycans},  
  { label: stringConstants.sidebar.collection, id: "Col", route: stringConstants.routes.collection},
  { label: stringConstants.sidebar.collectioncollection, id: "ColCol", route: stringConstants.routes.collectioncollection },
  { label: stringConstants.sidebar.tablemaker, id: "Tablemaker", route: stringConstants.routes.tablemaker},
];  

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const loginUpdater = flag => setLoggedIn(flag);
  const logoutHandler = e => logout(e);
  const [sideBarData, setSidebarData] = useState(items);
  const navigate = useNavigate();
  const location = useLocation();

  library.add(
    faTrashAlt,
    faEdit,
    faClone,
    faEyeSlash,
    faEye,
  );

  useEffect(checkAuthorization, [loggedIn]);

  const routes = [
    {
      path: "/",
      sidebar: () => loggedIn ? <Sidebar items={sideBarData}/> : "",
      main: () => loggedIn ? <Dashboard authCheckAgent={checkAuthorization}/> : <Home />,
    },
    {
      path: "/login",
      main: () => <Login updateLogin={loginUpdater} authCheckAgent={checkAuthorization}/>,
      sidebar: () => "",
    },
    {
      path: "/profile",
      main: () => <Profile authCheckAgent={checkAuthorization} />,
      sidebar: () => "",
    },
    {
      path: "/oauth2/redirect/",
      main: () => <OAuth2Redirect updateLogin={loginUpdater} authCheckAgent={checkAuthorization} />,
      sidebar: () => "",
    },
    {
      path: "/register",
      main: () => <Signup/>,
      sidebar: () => "",
    },
    {
      path: "/emailConfirmation/:token",
      main: () => <EmailConfirmation/>,
      sidebar: () => "",
    },
    {
      path: "/verifyToken",
      main: () => <VerifyToken/>,
      sidebar: () => "",
    },
    {
      path: "/forgotPassword",
      main: () => <ForgotPassword/>,
      sidebar: () => "",
    },
    {
      path: "/forgotUsername",
      main: () => <ForgotUsername/>,
      sidebar: () => "",
    },
    {
      path: "/changePassword",
      main: () => <ChangePassword/>,
      sidebar: () => "",
    },
    {
      path: stringConstants.routes.dashboard,
      main: () => <Dashboard authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.glycans,
      main: () => <Glycans authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.collection,
      main: () => <Collections authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.collectioncollection,
      main: () => <CoC authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.tablemaker,
      main: () => <Tablemaker authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
  ];

  return (
      <Routes>
        <Route element={<Layout />}>
        {routes.map((element, index) => {
          return <Route key={index} path={element.path} element={
            <>
              {element.sidebar() !== "" && <Row>
                <Col sm={12} md={12} lg={12} xl={2}>{element.sidebar()}</Col>
                <Col sm={12} md={12} lg={12} xl={10}>{element.main()}</Col>
              </Row>}
              {element.sidebar() === "" && (element.main())}
          </>
          } />
        })}
        </Route>
      </Routes>

/*

          <Route path="/" element={!loggedIn ? <Home/> : 
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><Dashboard authCheckAgent={checkAuthorization}/></Col>
            </Row>}/>
          <Route path="/login" element={<Container  className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh" }}><div className="w-100" style={{ maxWidth: "400px" }}><Login updateLogin={loginUpdater} authCheckAgent={checkAuthorization}/></div></Container>} />
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
          <Route path={stringConstants.routes.dashboard} element={
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><Dashboard authCheckAgent={checkAuthorization}/></Col>
            </Row>
          }/>
          <Route path={stringConstants.routes.glycans} element={
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><Glycans authCheckAgent={checkAuthorization}/></Col>
            </Row>
          }/>
          <Route path={stringConstants.routes.collection} element={
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><Collections authCheckAgent={checkAuthorization}/></Col>
            </Row>
          }/>
          <Route path={stringConstants.routes.collectioncollection} element={
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><CoC authCheckAgent={checkAuthorization}/></Col>
            </Row>
          }/>
          <Route path={stringConstants.routes.tablemaker} element={
            <Row>
              <Col sm={12} md={12} lg={12} xl={2}><Sidebar items={sideBarData} /></Col>
              <Col sm={12} md={12} lg={12} xl={10}><Tablemaker authCheckAgent={checkAuthorization}/></Col>
            </Row>
          }/>
        </Route>
      </Routes>*/
  );

  function Layout() {
    return (
      <>
      <div className="App">
      <TopNavBar loggedInFlag={loggedIn} logoutHandler={logoutHandler} />
      <CssBaseline />
      <ScrollToTopBtn />
      <Outlet />
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
