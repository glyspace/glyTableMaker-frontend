import React, { useReducer } from "react";
import { Card } from "react-bootstrap";
import { DatasetTable } from "../components/DatasetTable";
import FeedbackWidget from "../components/FeedbackWidget";
import stringConstants from '../data/stringConstants.json';
import DialogAlert from "../components/DialogAlert";

const PublicData = () => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
  
    return (
        <>
        <FeedbackWidget />
        <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
        <Card
            style={{
            // marginLeft: "5%",
            // marginRight: "5%",
            width: "95%",
            margin: "2%",
            // marginTop: window.innerHeight / 8
            }}
        >
            <DatasetTable ws={stringConstants.api.getpublicdatasets} setAlertDialogInput={setAlertDialogInput}/>
            {/* <PublicListDataset /> */}
        </Card>
        </>
    );
};

PublicData.propTypes = {};

export { PublicData };