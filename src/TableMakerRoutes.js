import { Route, Routes } from "react-router-dom";
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

const TableMakerRoutes = props => {
    const routes = [
      {
        path: "/",
        exact: true,
        main: () => <Home />,
      },{
        path: "/login",
        main: () => <Login />,
      }
    ];

    return (
        <>
          <Routes>
            {/*routes.map((element, index) => {
              return <Route key={index} path={element.path} exact={element.exact} render={() => 
                <>
              {element.sidebar() !== "" && <Row>
                <Col sm={12} md={12} lg={12} xl={2}>{element.sidebar()}</Col>
                <Col sm={12} md={12} lg={12} xl={10}>{element.main()}</Col>
              </Row>}
              {element.sidebar() === "" && (element.main())}
              </>
            } />;
            })*/}

            <Route exact path='/' element={<Home/>}/>
            <Route path="/login" element={<Login updateLogin={props.updateLogin} authCheckAgent={props.authCheckAgent}/>} />
            <Route path="/profile" element={<Profile authCheckAgent={props.authCheckAgent} />} />
            <Route path="/register" element={<Signup/>} />
            <Route path="/emailConfirmation/:token" element={<EmailConfirmation/>} />
            <Route path="/verifyToken" element={<VerifyToken/>} />
            <Route path="/forgotPassword" element={<ForgotPassword/>} />
            <Route path="/forgotUsername" element={<ForgotUsername/>} />
            <Route path="/changePassword" element={<ChangePassword/>} />
            </Routes>
            </>
    );
  };

export { TableMakerRoutes };