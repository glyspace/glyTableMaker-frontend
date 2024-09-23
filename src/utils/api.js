import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useContext } from "react";
import { AccordionContext, useAccordionButton } from "react-bootstrap";

const TABLEMAKER_API = process.env.REACT_APP_API_URL;
const base = process.env.REACT_APP_BASENAME;
//const OAUTH2_REDIRECT_URI = "http://localhost:3000/oauth2/redirect";
const OAUTH2_REDIRECT_URI = process.env.REACT_APP_OAUTH2_REDIRECT_URI;

const urlRegex = /http[s]?:\/\/.(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gi;

/**
 * Gets JSON from REST api call.
 * @param {string} url - url for REST api call.
 * @param {string} headers - header for REST api call.
 */
export const getJson = (url, headers = {}) => {
  return axios.get(TABLEMAKER_API + url, {
    headers
  });
};

export const getBlob = (url, headers = {}) => {
  const options = {
    method: "GET",
    headers: headers,
    url: TABLEMAKER_API + url,
    responseType: "blob"
  };
  return axios(options);
};

export const postTo = (url, headers = {}) => {
  const options = {
    method: "POST",
    headers: headers,
    url: TABLEMAKER_API + url
  };

  return axios(options);
};

export const postFormDataTo = (url, formData = {}, headers = {}) => {
  const formDataElement = new FormData();

  Object.keys(formData).forEach(key => {
    formDataElement.append(key, formData[key]);
  });

  const myHeaders = {
    "Content-Type": "multipart/form-data",
    ...headers
  };

  const options = {
    method: "POST",
    headers: myHeaders,
    data: formDataElement,
    url: TABLEMAKER_API + url
  };

  return axios(options);
};

export const postJson = (url, data = {}, headers = {}) => {
  const myHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  const options = {
    method: "POST",
    headers: myHeaders,
    data: data,
    url: TABLEMAKER_API + url
  };

  return axios(options);
};

export const putJson = (url, data = {}, headers = {}) => {
  const myHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  const options = {
    method: "PUT",
    headers: myHeaders,
    data: data,
    url: TABLEMAKER_API + url
  };

  return axios(options);
};

export const deleteJson = (url, headers={}) => {
  const myHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  const options = {
    method: "DELETE",
    headers: myHeaders,
    url: TABLEMAKER_API + url
  };

  return axios(options);
}


export const postFormDataTo1 = (url, formData = {}, headers = {}) => {
  // const formDataElement = new FormData();

  // Object.keys(formData).forEach(key => {
  //   formDataElement.append(key, formData[key]);
  // });

  // const myHeaders = {
  //   "Content-Type": "multipart/form-data",
  //   ...headers
  // };

  const options = {
    method: "POST",
    headers: headers,
    data: formData,
    url: TABLEMAKER_API + url
  };

  return axios(options);
};

export const postToAndGetBlob = (url,  data = {}, headers = {}) => {
  const options = {
    method: "POST",
    headers: headers,
    url: TABLEMAKER_API + url,
    data: data,
    responseType: "blob"
  };

  return axios(options);
};

export const getPageData = (url, headers = {}) => {
  return axios.get(url, {
    responseType: 'blob',
    headers
  });
};

export const getAuthorizationHeader = () => {
  const headers = {};
  headers["Authorization"] = "Bearer " + window.localStorage.getItem(base ? base + "_token" : "token") || "";
  return headers;
};

export function getSocialLoginUrl(name) {
  return `${TABLEMAKER_API}oauth2/authorization/${name}?redirect_uri=${OAUTH2_REDIRECT_URI}`
}

export function parseJwt(token) {
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

export function isValidURL (url) {
  return urlRegex.exec(url);
}

export function validateEmail(email) {
  if (/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  return false;
}

export const postJsonAsync = async (url, data = {}, headers = {}) => {
  const myHeaders = {
    "Content-Type": "application/json",
    ...headers
  };

  const options = {
    method: "POST",
    headers: myHeaders,
    data: data,
    url: TABLEMAKER_API + url
  };

  return await axios(options);
}

export const getJsonAsync = async (url, headers = {}) => {
  return await axios.get(TABLEMAKER_API + url, {
    headers
  });
};

export function CustomToggle({ children, eventKey }) {
  const currentEventKey = useContext(AccordionContext);
  const decoratedOnClick = useAccordionButton(eventKey, () =>
    console.log("toggle")
  );
  const isCurrentEventKey = currentEventKey.activeEventKey === eventKey;

  return (
      <FontAwesomeIcon
      icon={["fas", isCurrentEventKey ? "angle-up" : "angle-down"]}
      size="1x"
      title="Collapse and Expand"
      onClick={decoratedOnClick}
      className={"font-awesome-color"}
      >
      {children}
      </FontAwesomeIcon>
  );
}
