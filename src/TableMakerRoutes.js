import { Route, Routes } from "react-router-dom";
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

const TableMakerRoutes = props => {
     return (
        <>
          <Routes>
            <Route exact path='/' element={<Home/>}/>
            <Route path="/login" element={<Login updateLogin={props.updateLogin} authCheckAgent={props.authCheckAgent}/>} />
            <Route path="/profile" element={<Profile authCheckAgent={props.authCheckAgent} />} />
            <Route path='/oauth2/redirect' element={<OAuth2Redirect updateLogin={props.updateLogin} authCheckAgent={props.authCheckAgent} />} />
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