import React, { useState, useEffect, useReducer } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import DatasetDetailListSummary from "../components/DatasetDetailListSummary";
import { Card } from "react-bootstrap";
import FeedbackWidget from "../components/FeedbackWidget";
import { DatasetTable } from "../components/DatasetTable";
import { getJson } from "../utils/api";
import stringConstants from '../data/stringConstants.json';
import { axiosError } from "../utils/axiosError";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Container } from "@mui/material";

const DatasetDetailList = () => {
  const { searchId } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState(null);
  const [timestamp, setTimeStamp] = useState();

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const handleModifySearch = () => {
    navigate("/datasetDetailSearch/" + searchId);
  };

  useEffect(() => {
    let searchParams = "start=0";
    searchParams += "&size=1";
    searchParams += "&searchId=" + searchId;

    getJson ( stringConstants.api.listdatasetsforsearch + "?" + searchParams).then ( (json) => {
        setQuery(json.data.data.input);
    }).catch (function(error) {
        if (error && error.response && error.response.data) {
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            return;
        } else {
            axiosError(error, null, setAlertDialogInput);
            return;
        }
    });
  }, [searchId]);

  return (
    <>
      <FeedbackWidget />
      <TextAlert alertInput={textAlertInput}/>
      <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                  setAlertDialogInput({ show: input });
              }}
        />
      <Container maxWidth="xl" className="gg-container">
        <section className="content-box-md">
          {query && (
            <DatasetDetailListSummary
              data={query}
              timestamp={timestamp}
              onModifySearch={handleModifySearch}
              searchId={searchId}
            />
          )}
        </section>
      </Container>

      <Card
        style={{
          width: "95%",
          margin: "2%",
        }}
      >
        <DatasetTable ws={stringConstants.api.listdatasetsforsearch} searchId={searchId} setAlertDialogInput={setAlertDialogInput} />
      </Card>
    </>
  );
};

DatasetDetailList.propTypes = {};

export { DatasetDetailList };
