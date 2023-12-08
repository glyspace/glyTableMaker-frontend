import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { parseJwt } from '../utils/api'

function OAuth2Redirect(props) {
  const [redirectTo, setRedirectTo] = useState('/login')

  const location = useLocation()

  useEffect(() => {
    const accessToken = extractUrlParameter('token')
    if (accessToken) {
      handleLogin(accessToken)
      //const redirect = '/'
      //setRedirectTo(redirect)

      var redirectedFrom = "";
      if (location.state && location.state.redirectedFrom) {
        redirectedFrom = location.state.redirectedFrom;
      }

      if (redirectedFrom) {
        setRedirectTo(redirectedFrom);
      } else {
        setRedirectTo("/");
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

  return <Navigate to={redirectTo} />
}

export default OAuth2Redirect