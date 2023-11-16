import React from "react";
import PropTypes from "prop-types";
import { Alert, AlertTitle } from '@mui/material';
import messages from '../data/messages';

/**
 * Text alert component to show error messages.
 */
export default function TextAlert(props) {

  /**
	 * getValue returns error id to display.
	 **/
  const getValue = (input) => {
    let errorID = props.alertInput.id;
    if (errorID === undefined || errorID === null || errorID === "") {
        errorID = messages.errors.defaultTextAlert.id;
    }
    if (messages.errors[errorID] === undefined) {
        errorID = messages.errors.defaultTextAlert.id;
    }

    if (input === "title") {
        if (props.alertInput.id === "" && props.alertInput.message) {
            // no title necessary
            return "";
        }
        return messages.errors[errorID].title;
    }
    else if (input === "message")
        return props.alertInput.message || messages.errors[errorID].message + (props.alertInput.custom && props.alertInput.custom !== "" ? " " + props.alertInput.custom : "");    
  };

  return (
    <>
    {props.alertInput.show && <div>
      <Alert severity="error">
         <AlertTitle>{getValue("title")}</AlertTitle>
            <span className="alert-text">
              {getValue("message")}
            </span>            
        </Alert>
    </div>}
    </>

  );
}

TextAlert.propTypes = {
  alertInput: PropTypes.object
};