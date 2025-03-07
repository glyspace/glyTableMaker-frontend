/* eslint-disable react/display-name */
import React, { useEffect, useReducer, useState } from "react";
import "./Search.css";
import { useParams } from "react-router-dom";
import { Title } from "../components/FormControls";
import { Tab, Tabs, Container } from "react-bootstrap";
import DatasetDetailSearchUser from "../components/DatasetDetailSearchUser";
import FeedbackWidget from "../components/FeedbackWidget";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { axiosError } from "../utils/axiosError";
import { getJson } from "../utils/api";
import stringConstants from '../data/stringConstants.json';
import { Card } from "react-bootstrap";

const DatasetDetailSearch = (props) => {
  const { searchId } = useParams();

  const [searchData, setSearchData] = useState(null);

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  useEffect(() => {
    if (searchId) {
      let searchParams = "start=0";
      searchParams += "&size=1";
      searchParams += "&searchId=" + searchId;

      getJson ( stringConstants.api.listdatasetsforsearch + "?" + searchParams).then ( (data) => {
        setSearchData(data.data.data);
      }).catch (function(error) {
          if (error && error.response && error.response.data) {
              setTextAlertInput ({"show": true, "message": error.response.data["message"]});
              return;
          } else {
              axiosError(error, null, setAlertDialogInput);
              return;
          }
      });
    }
  }, [searchId]);

  return (
    <>
      <FeedbackWidget />
      <div className="lander">
        <TextAlert alertInput={textAlertInput}/>
        <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
        />

        <Container>
          <Title title="Dataset Detail Search" />
          <Card>
          <DatasetDetailSearchUser searchData={searchData} />
          </Card>
        </Container>
        {/**   <Tabs
            defaultActiveKey="dataset"
            transition={false}
            activeKey={currentTab}
            mountOnEnter={true}
            unmountOnExit={false}
            onSelect={(key) => setCurrentTab(key)}
          >
            <Tab eventKey="dataset" className="pt-2" title="Dataset">
              <div style={{ paddingBottom: "20px" }}></div>
              <Container className="tab-content-border">
               <DatasetDetailSearchDataset searchData={searchData} />
              </Container>
            </Tab>
            <Tab eventKey="user" title="User" className="tab-content-padding">
              <Container className="tab-content-border">
                <DatasetDetailSearchUser searchData={searchData} />
              </Container>
            </Tab>
          </Tabs>
        </Container>*/}
      </div>
    </>
  );
};

export { DatasetDetailSearch };
