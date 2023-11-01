import React, { useState, useEffect } from "react";

import { useNavigate, useLocation, BrowserRouter } from "react-router-dom";
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


function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const loginUpdater = flag => setLoggedIn(flag);
  const logoutHandler = e => logout(e);
  const history = useNavigate();

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
            <TableMakerRoutes/>
            </div>
            </Container>
        {/* <Footer/> */}
    </div>
  );

  function logout(e) {
    e.preventDefault();
    //var base = process.env.REACT_APP_BASENAME;
    //window.localStorage.removeItem(base ? base + "_token" : "token");
    //window.localStorage.removeItem(base ? base + "_loggedinuser" : "loggedinuser");
    setLoggedIn(false);
    history.push("/");
  }
}



export default App;
