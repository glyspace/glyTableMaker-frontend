import axios from "axios";

const TABLEMAKER_API = process.env.REACT_APP_API_URL;
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

export const postFormDataToCallBack = (url, data = {}, headers = {}, onSuccess, onFailure) => {
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
  
    axios(options).then(response=> 
        { onSuccess ? onSuccess(response.data) : defaultSuccess(response.data)})
        .catch (err => {onFailure ? onFailure (err) : defaultFailure (err)});
};

function defaultSuccess (data) {
    return data;
}

function defaultFailure (error) {
    console.log(error);
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

export const postToAndGetBlob = (url, headers = {}) => {
  const options = {
    method: "POST",
    headers: headers,
    url: TABLEMAKER_API + url,
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