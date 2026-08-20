import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { useContext } from "react";
import { AccordionContext, useAccordionButton } from "react-bootstrap";

const TABLEMAKER_API = process.env.REACT_APP_API_URL;
const base = process.env.REACT_APP_BASENAME;
//const OAUTH2_REDIRECT_URI = "http://localhost:3000/oauth2/redirect";
const OAUTH2_REDIRECT_URI = process.env.REACT_APP_OAUTH2_REDIRECT_URI;

var cartoonSetting = {"display": "extended", "redEnd": "y"};

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

export function getSocialLoginUrl(name, redirectedFrom) {
  if (redirectedFrom) {
    window.localStorage.setItem(base ? base + "_redirectedFrom" : "redirectedFrom", redirectedFrom);
  }
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
  const urlRegex = /http[s]?:\/\/.(?:www\.)?[-a-zA-Z0-9@%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/gi;
  var m = null;
  m = urlRegex.exec(url);
  return m;
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

export const getCartoon = (glycan, display, redEnd) => {
  var id = glycan.glycanId;
  if (glycan && glycan.glytoucanID && glycan.glytoucanID.length > 0) {
    id = glycan.glytoucanID;
  }

  var url = "api/util/getcartoon?glytoucanId=" + id;
  if (display) url += "&display=" + display;
  if (redEnd) url += "&redEnd=" + redEnd;
  return axios.get(TABLEMAKER_API + url);
}

export const getCartoonById = (id, display, redEnd) => {
  if (cartoonSetting !== null) { 
    display = cartoonSetting.display; 
    redEnd = cartoonSetting.redEnd;
  }
  var url = "api/util/getcartoon?glytoucanId=" + id;
  if (display) url += "&display=" + display;
  if (redEnd) url += "&redEnd=" + redEnd;
  return axios.get(TABLEMAKER_API + url);
}

export function getCartoonSetting () {
    cartoonSetting = {};
    getJson("api/setting/getsettings", getAuthorizationHeader()).then (({ data }) => {
        if (data.data && data.data.length > 0) {
            data.data.forEach ((setting) => {
                if (setting.name && setting.name.toLowerCase() === "display") {
                    cartoonSetting.display = setting.value;
                }
                if (setting.name && setting.name.toLowerCase() === "redend") {
                    cartoonSetting.redEnd = setting.value;
                }
            });
        } else {
            cartoonSetting = {"display": "extended", "redEnd": "y"}; // default
        }
    }).catch(function(error) {
        console.log ("Could not load cartoon settings " + error);
    });
}

export async function loadCartoons(glycans) {
  const updated = [];

  for (const glycan of glycans) {
      await getCartoon(glycan, cartoonSetting.display, cartoonSetting.redEnd).then ((json) => {
          updated.push({
          ...glycan,
          cartoon: json.data.data, 
          });
      }).catch(function(error) {
            console.log ("could not get the cartoon " + error);
            updated.push({...glycan });
      });
  }

  return updated;
}

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

export function getContributorString (contrib) {
      var c = "";
      if (contrib.user && contrib.user.length > 0) {
          c += contrib.user[0].name;
          if (contrib.user.length > 1) {
              c+= " and " + (contrib.user.length - 1);
              c+= " other(s) are involved";
          }
      } 
      if (contrib.software && contrib.software.length > 0) {
          if (c.length !== 0) c+= "; ";
          c += contrib.software[0].name;
          if (contrib.software.length > 1) {
              c+= " and " + (contrib.software.length - 1);
              c+= " tool(s)";
          }
      }
      return c;
  }
