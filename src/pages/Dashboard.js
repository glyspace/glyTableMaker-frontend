import React, { useEffect, useReducer, useState } from "react";
import "./Dashboard.css";
import PropTypes from "prop-types";
import Container from "@mui/material/Container";
import { PageHeading } from "../components/FormControls";
import { Loading } from "../components/Loading";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import { getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";


function Heading(props) {
  return (
    <Box mb={1}>
      <Typography variant="h6">{props.title}</Typography>
    </Box>
  );
}

function StatisticsCard(props) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => window.scrollTo(0, navigate(props.link))}
      style={{
        height: "100%",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        className="text-center"
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          paddingBottom: 8,
        }}
      >
        <Typography>{props.title}</Typography>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            paddingTop: 8,
          }}
        >
          {props.keys && props.keys.length > 0 ? (
            <div>
              {props.keys.map(item => (
                <Typography key={item.value}>
                  <Typography variant="h6" style={{ display: "inline" }}>
                    {props.data[item.value]}
                  </Typography>{" "}
                  ({item.name})
                </Typography>
              ))}
            </div>
          ) : (
            <Typography variant="h6">{props.data[props.value]}</Typography>
          )}
        </div>
      </CardContent>
      <CardActions className="gg-align-center">
        <Button size="small" style={{ color: "var(--gg-blue)" }}>
          Manage
        </Button>
      </CardActions>
    </Card>
  );
}

const sections = [
  {
    name: "Glycans",
    items: [
      { title: "Glycan", value: "glycanCount", link: stringConstants.routes.glycans}
    ],
  },
  {
    name: "Collections",
    items: [
      {
        title: "Collections",
        value: "collectionCount",
        link: stringConstants.routes.collection,
      },
      {
        title: "Collections of Collections",
        value: "cocCount",
        link: stringConstants.routes.collectioncollection,
      },
    ],
  },
];

const Dashboard = props => {
  useEffect(props.authCheckAgent);
  const [statistics, setStatistics] = useState({});
  const [hasError, setHasError] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  useEffect(() => {
    setShowLoading(true);
    setTextAlertInput({"show": false, "id": ""});
    // get statistics for the user
    getJson (stringConstants.api.statistics, getAuthorizationHeader()).then ( (data) => {
      setStatistics(data.data.data);
      setShowLoading(false);
      setHasError(false);
    }).catch (function(error) {
      if (error && error.response && error.response.data) {
          // expired or not valid etc.
          setTextAlertInput ({"show": true, "message": error.response.data["message"]});
          setShowLoading(false);
          setHasError(true);
          return false;
      } else {
          setShowLoading(false);
          setHasError(true);
          axiosError(error, null, setAlertDialogInput);
      }
    });
  }, []);

  return (
    <>
      <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
            title="GlyTableMaker Data"
            subTitle="Please select one of the options on the left or below‚ to add your data."
          />

          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                setAlertDialogInput({ show: input });
              }}
            />

          {showLoading && !hasError && <Loading show={showLoading} />}

          {Object.keys(statistics).length > 0 &&
            sections.map(section => (
              <Box key={section.name} mb={3}>
                <Heading title={section.name} />
                <Grid container spacing={4}>
                  {section.items.map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <StatisticsCard data={statistics} {...item} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
        </div>
      </Container>
    </>
  );
};

Dashboard.propTypes = {
  authCheckAgent: PropTypes.func,
};

export default Dashboard;