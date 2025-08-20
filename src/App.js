import React, { useEffect, useState } from "react";

import { useNavigate, useLocation, Outlet, Routes, Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { TopNavBar } from "./components/TopNavBar";
import { library } from "@fortawesome/fontawesome-svg-core";
import { ScrollToTopBtn } from "./components/ScrollToTop";
import { 
  faUsers,
  faTable, 
  faAngleDown,
  faAngleUp,
  faBookOpen,
  faCaretUp,
  faCaretDown, } from "@fortawesome/free-solid-svg-icons";
import { faEdit, faTrashAlt, faClone, faEyeSlash, faEye } from "@fortawesome/free-regular-svg-icons";
import CssBaseline from '@mui/material/CssBaseline';
import { parseJwt } from "./utils/api";
import { Col, Row } from "react-bootstrap";
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
import Glycan from "./pages/Glycan";
import { GlycanFromFile } from "./pages/GlycanFromFile";
import Collection from "./pages/Collection";
import Metadata from "./pages/Metadata";
import AddCoC from "./pages/AddCoC";
import { FileUpload } from "./pages/FileUpload";
import Settings from "./pages/Settings";
import Dataset from "./pages/Dataset";
import PublishDataset from "./pages/PublishDataset";
import { PublicData } from "./pages/PublicData";
import { PublicDataset } from "./pages/PublicDataset";
import Glycoproteins from "./pages/Glycoproteins";
import Glycoprotein from "./pages/Glycoprotein";
import { DatasetDetailSearch } from "./pages/DatasetDetailSearch";
import { DatasetDetailList } from "./pages/DatasetDetailList";
import { GlycoproteinFromFile } from "./pages/GlycoproteinFromFile";
import { CollectionFromFile } from "./pages/CollectionFromFile";

const items = [
  { label: stringConstants.sidebar.dashboard, id: "Dashboard", route: stringConstants.routes.dashboard },
  { label: stringConstants.sidebar.glycan, id: "Glycan", route: stringConstants.routes.glycans},  
  { label: stringConstants.sidebar.glycoprotein, id: "Glycoprotein", route: stringConstants.routes.glycoproteins},  
  { label: stringConstants.sidebar.collection, id: "Col", route: stringConstants.routes.collection},
  { label: stringConstants.sidebar.collectioncollection, id: "ColCol", route: stringConstants.routes.collectioncollection },
  { label: stringConstants.sidebar.metadata, id: "Metadata", route: stringConstants.routes.metadata},
  { label: stringConstants.sidebar.tablemaker, id: "Tablemaker", route: stringConstants.routes.tablemaker},
  { label: stringConstants.sidebar.repository, id: "Repository", route: stringConstants.routes.repository},
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
    faTable,
    faUsers,
    faAngleDown,
    faAngleUp,
    faBookOpen,
    faCaretUp,
    faCaretDown,
  );

  useEffect(checkAuthorization, [loggedIn]);

  const routes = [
    {
      path: "/",
      sidebar: () => "",
      main: () =>  <Home />,
    },
    {
      path: "/data",
      exact: true,
      main: () => <PublicData />,
      sidebar: () => "",
    },
    {
      path: "/data/dataset/:datasetId",
      main: () => <PublicDataset authCheckAgent={checkAuthorization}/>,
      sidebar: () => "",
    },
    /*  Public search */
    {
      path: "/datasetDetailSearch",
      exact: true,
      main: () => <DatasetDetailSearch />,
      sidebar: () => "",
    },
    {
      path: "/datasetDetailSearch/:searchId",
      exact: true,
      main: () => <DatasetDetailSearch />,
      sidebar: () => "",
    },
    {
      path: "/datasetDetailList/:searchId",
      exact: true,
      main: () => <DatasetDetailList />,
      sidebar: () => "",
    },
   /** {
      path: "/submitterSearch",
      exact: true,
      main: () => <SubmitterSearch />,
      sidebar: () => "",
    },
    {
      path: "/glycanSearch",
      exact: true,
      main: () => <GlycanSearch />,
      sidebar: () => "",
    },
    {
      path: "/glycanSearch/:searchId",
      exact: true,
      main: () => <GlycanSearch />,
      sidebar: () => "",
    },
    {
      path: "/glycanList/:searchId",
      exact: true,
      main: () => <GlycanList />,
      sidebar: () => "",
    },*/
    {
      path: "/login",
      main: () => <Login updateLogin={loginUpdater} authCheckAgent={checkAuthorization}/>,
      sidebar: () => "",
    },
    {
      path: "/profile",
      main: () => <Profile authCheckAgent={checkAuthorization} />,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: "/settings",
      main: () => <Settings authCheckAgent={checkAuthorization} />,
      sidebar: () => <Sidebar items={sideBarData} />,
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
      sidebar: () => <Sidebar items={sideBarData} />,
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
      path: stringConstants.routes.glycoproteins,
      main: () => <Glycoproteins authCheckAgent={checkAuthorization}/>,
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
      path: stringConstants.routes.metadata,
      main: () => <Metadata authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.tablemaker,
      main: () => <Tablemaker authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.repository,
      main: () => <Dataset authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.publishdataset,
      main: () => <PublishDataset authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addglycan,
      main: () => <Glycan authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addglycoprotein,
      main: () => <Glycoprotein authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addglycanfromfile,
      main: () => <GlycanFromFile authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addglycoproteinfromfile,
      main: () => <GlycoproteinFromFile authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.importcollection,
      main: () => <CollectionFromFile authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addcollection,
      main: () => <Collection authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.addcoc,
      main: () => <AddCoC authCheckAgent={checkAuthorization}/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.upload,
      main: () => <FileUpload authCheckAgent={checkAuthorization} type="GLYCAN"/>,
      sidebar: () => <Sidebar items={sideBarData} />,
    },
    {
      path: stringConstants.routes.glycoproteinupload,
      main: () => <FileUpload authCheckAgent={checkAuthorization} type="GLYCOPROTEIN"/>,
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

  function checkAuthorization(forceLogin = false) {
    var authorized = getLoginStatus();
    setLoggedIn(authorized); //async
    var loginNotRequiredPages = [
      "",
      "login",
      "forgotUsername",
      "forgotPassword",
      "register",
      "emailConfirmation",
      "verifyToken",
      "data",
      "datasetDetailSearch",
      "datasetDetailList"
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

    if (!authorized && (forceLogin || !loginNotRequiredPages.includes(pagename))) {
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
    window.localStorage.removeItem(base ? base + "_redirectedFrom" : "redirectedFrom");
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
