import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Badge, Button } from "react-bootstrap";
import { getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { useNavigate } from "react-router-dom";

const StatusMessage = props => {
  const [batchUploadResponse, setBatchUploadResponse] = useState();
  const [unread, setUnread] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    getJson ("api/data/checkbatchupload", getAuthorizationHeader()).then ( (json) => {
      props.setBatchUpload && props.setBatchUpload(true);
      setBatchUploadResponse(json.data.data);
      countUnreadErrors (json.data.data);
    }).catch (function(error) {
      if (error && error.response && error.response.data) {
        if  (error.response.data["code"] === 404 || error.response.status === 404) {
          console.log ("no active batch upload");
        } else {
          setBatchUploadResponse("Failed to get most recent batch upload");
        }
      } else {
        axiosError(error, null, props.setAlertDialogInput);
      }
    });
  }, []);

  const countUnreadErrors = (uploads) => {
    let count = 0;
    if (uploads && uploads.length > 0) {
      uploads.forEach(element => {
        count += element.accessedDate ? 0 : element.errors ? element.errors.length : 0;
      });
    }
    setUnread(count);
  };

  return (
    <>
      <Button variant="primary" 
        onClick={()=> {
          navigate("/glycans/fileupload", { state: batchUploadResponse});
        }}
        className="gg-btn-blue-sm" 
        style={{marginTop: "-2px", marginLeft: "10px"}}>
        Upload Status&nbsp;
        {unread > 0 ? <Badge bg="danger">
          {unread}</Badge> : ""}
        <span className="visually-hidden">errors</span>
      </Button>
    </>
  );

};

StatusMessage.propTypes = {
  setBatchUpload: PropTypes.func,
};

export { StatusMessage };
