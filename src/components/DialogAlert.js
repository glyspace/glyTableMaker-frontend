import React from "react";
import { Link } from 'react-router-dom';
import { Navbar } from 'react-bootstrap';
import PropTypes from "prop-types";
import messages from '../data/messages';
import routeConstants from '../data/routeConstants';
import Button from 'react-bootstrap/Button';
import { Dialog } from "@mui/material";

/**
 * Dialog alert component to show error messages.
 */
export default function DialogAlert(props) {

    /**
	 * getID returns error id to display.
	 **/
    const getID = () => {
        let errorID = props.alertInput.id;
        if (errorID === undefined || errorID === null || errorID === "") {
            errorID = messages.errors.defaultDialogAlert.id;
        }
        if (messages.errors[errorID] === undefined) {
            errorID = messages.errors.defaultDialogAlert.id;
        }

        return errorID;
    };

  return (
        <Dialog
            open={props.alertInput.show}
            classes= {{
                paper: "alert-dialog",
                root: "alert-dialog-root"
            }}
            disableScrollLock
            onClose={() => props.setOpen(false)} 
        >    
            <h5 className= "alert-dialog-title">{messages.errors[getID()].title}</h5>
            <div className="alert-dialog-content">
                <div className="alert-dialog-content-text">
                    {messages.errors[getID()].message}
                    {messages.errors[getID()].showContactUs && <>{' '}{messages.errors.contactUsMsg}{' '}
                        <Navbar.Text
                            as={Link}
                            to={routeConstants.contactUs}
                            style={{padding:0}}
                        >
                            contact us
                        </Navbar.Text>{'.'}</>}
                </div>
                <Button
                    className= "gg-btn-outline"
                    style={{ float: "right" }}
                    onClick={() => props.setOpen(false)}
                >
                    Ok
                </Button>
            </div>
        </Dialog>
  );
}

DialogAlert.propTypes = {
  alertInput: PropTypes.object,
  setOpen: PropTypes.func
};