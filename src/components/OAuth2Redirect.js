import React, { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { parseJwt } from '../utils/api'

function OAuth2Redirect(props) {
  //const [redirectTo, setRedirectTo] = useState('/login')

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = extractUrlParameter('token')

    if (accessToken) {
      handleLogin(accessToken)
      //const redirect = '/'
      //setRedirectTo(redirect)

      var redirectedFrom = "";
      if (location.state && location.state.redirectedFrom) {
        redirectedFrom = location.state.redirectedFrom;
      } else {
        var base = process.env.REACT_APP_BASENAME;
        const redirect = window.localStorage.getItem(base ? base + "_redirectedFrom" : "redirectedFrom");
        redirectedFrom = redirect ?? "/";
      }

      if (redirectedFrom) {
        navigate(redirectedFrom);
      } else {
        navigate("/");
      }
    }
  }, [])

  const extractUrlParameter = (key) => {
    return new URLSearchParams(location.search).get(key)
  }

  const handleLogin = (accessToken) => {
    var base = process.env.REACT_APP_BASENAME;
    window.localStorage.setItem(base ? base + "_token" : "token", accessToken);
    const data = parseJwt (accessToken);
    window.localStorage.setItem(base ? base + "_loggedinuser" : "loggedinuser", data.sub);
    props.updateLogin(true);
  };

  return <></>
}

export default OAuth2Redirect