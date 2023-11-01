import { Route, Routes } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import Home  from "./pages/Home";
import { Login } from "./pages/Login";

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
            <Route path="/login" element={<Login/>} />
            </Routes>
            </>
    );
  };

export { TableMakerRoutes };