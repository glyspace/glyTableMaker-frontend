import React, { useEffect, useReducer } from "react";
import { Form, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import "../pages/Search.css";
import { useNavigate } from "react-router-dom";
import { axiosError } from "../utils/axiosError";
import { postJson } from "../utils/api";
import { FormControl, Grid, Typography } from "@mui/material";
import HelpTooltip from "./HelpTooltip";
import TextAlert from "./TextAlert";
import DialogAlert from "./DialogAlert";
import ExampleSequenceControl from "./ExampleSequenceControl";
import AutoTextInput from "./AutoTextInput";
import { Card } from "react-bootstrap";
import TooltipExample from "../data/examples";

const datasetSearch = TooltipExample.datasetSearch;
const DatasetDetailSearchUser = (props) => {
  const navigate = useNavigate();

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [inputValue, setInputValue] = useReducer(
    (state, payload) => ({ ...state, ...payload }),
    {
      username: "",
      lastName: "",
      groupName: "",
      institution: "",
      department: "",
      datasetName: "",
      fundingOrganization: "",
    }
  );

  const searchDataset = (username, lastName, groupName, institution, department, datasetName, fundingOrganization) => {
    let searchData = {
      username: username,
      lastName: lastName,
      groupName: groupName,
      institution: institution,
      department: department,
      datasetName: datasetName,
      fundingAgency: fundingOrganization,
    }
    postJson ( "api/search/searchDatasets", searchData).then ( (data) => {
      navigate ("/datasetDetailList/" + data.data.data);
    }).catch (function(error) {
        if (error && error.response && error.response.data) {
            if (error.response.data["message"].includes ("No results"))
              setTextAlertInput ({"show": true, "message": "No search result found"});
            else 
              setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            return;
        } else {
            axiosError(error, null, setAlertDialogInput);
            return;
        }
    });
  };

  function funcSetInputValuesUsername(val) {
    setInputValue({
      username: val,
    });
  }
  function funcSetInputValuesLastName(val) {
    setInputValue({
      lastName: val,
    });
  }
  function funcSetInputValuesGroupName(val) {
    setInputValue({
      groupName: val,
    });
  }
  function funcSetInputValuesInstitution(val) {
    setInputValue({
      institution: val,
    });
  }

  function funcSetInputValuesDepartment(val) {
    setInputValue({
      department: val,
    });
  }

  function funcSetInputValuesFundingOrg(val) {
    setInputValue({
      fundingOrganization: val,
    });
  }

  function funcSetInputValuesDatasetName(val) {
    setInputValue({
      datasetName: val,
    });
  }

  const clearDataset = () => {
    setInputValue({
      username: "",
      lastName: "",
      groupName: "",
      institution: "",
      department : "",
      datasetName: "",
      fundingOrganization: "",
    });
  };

  const searchDatasetAdvClick = () => {
    const { username, lastName, groupName, institution, department, datasetName, fundingOrganization } = inputValue;
    searchDataset(username, lastName, groupName, institution, department, datasetName, fundingOrganization);
  };

  useEffect(() => {
    if (props.searchData) {
      setInputValue({
        username: props.searchData.input.username ?? "",
        groupName: props.searchData.input.group ?? "",
        institution: props.searchData.input.institution ?? "",
        department: props.searchData.input.department ?? "",
        datasetName: props.searchData.input.datasetName ?? "",
        fundingOrganization: props.searchData.input.fundingAgency ?? "",
      });
    }
  }, [props.searchData]);

  return (
    <>
      <TextAlert alertInput={textAlertInput}/>
      <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                  setAlertDialogInput({ show: input });
              }}
      />
      {/* Buttons Top */}
      <div className="text-center mb-4" style={{marginTop: "40px"}}>
          <Button className="gg-btn-outline gg-mr-40" onClick={clearDataset}>
            Clear Fields
          </Button>
          <Button className="gg-btn-blue" onClick={searchDatasetAdvClick}>
            Search Dataset
          </Button>
      </div>
      <Grid container style={{ marginTop: "10px", marginLeft: "30px" }} spacing={3} justify="center" className="mb-5">
        {/* Dataset name */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Dataset Name"
                text="Search datasets containing the given text in their names"
              />
              Dataset Name
            </Typography>
            <AutoTextInput
              length={100}
              errorText="Entry is too long - max length is 100."
              placeholder="Enter Dataset name"
              inputValue={inputValue.datasetName}
              setInputValue={(value) => setInputValue({ datasetName: value })}
              typeahedID="dataset"
              setAlertDialogInput={setAlertDialogInput}
            />
          </FormControl>
        </Grid>
        {/* Username */}
        <Grid item xs={12} sm={10} md={10} className="pt-3">
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Username"
                text="username to match"
              />
              Username
            </Typography>
            <Form.Control 
                    type="text" 
                    name="username" 
                    placeholder="Enter username"
                    value={inputValue.username} 
                    onChange={(e) => setInputValue ({ username: e.target.value})}/>
           {/* <AutoTextInput
              length={datasetSearch.username.length}
              errorText={datasetSearch.username.errorText}
              placeholder={datasetSearch.username.placeholder}
              inputValue={inputValue.username}
              setInputValue={(value) => setInputValue({ username: value })}
              typeahedID="username"
            /> 
            <ExampleSequenceControl
              setInputValue={funcSetInputValuesUsername}
              inputValue={[
                {
                  "example": {
                    "name": "Example",
                    "id": "senaar"
                  }
                }
              ]}
            /> */}
          </FormControl>
        </Grid>
        {/* Group Name */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Group Name"
                text="Group of the user to search"
              />
              Group Name
            </Typography>
            <AutoTextInput
              length={255}
              errorText="Entry is too long - max length is 255."
              placeholder="Enter user's group name"
              inputValue={inputValue.groupName}
              setInputValue={(value) => setInputValue({ groupName: value })}
              typeahedID="group"
            />
            {/* <ExampleExploreControl
              setInputValue={funcSetInputValuesGroupName}
              inputValue={datasetSearch.group_name.examples}
            />*/}
          </FormControl>
        </Grid>
        {/* Institution */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Institution"
                text="Institution of the user to search"
              />
              Organization/Institution
            </Typography>
            <AutoTextInput
              length={255}
              errorText="Entry is too long - max length is 255."
              placeholder="Enter user's institution name"
              inputValue={inputValue.institution}
              setInputValue={(value) => setInputValue({ institution: value })}
              typeahedID="organization"
            />
            {/* <ExampleExploreControl
              setInputValue={funcSetInputValuesInstitution}
              inputValue={datasetSearch.institution.examples}
            />*/}
          </FormControl>
        </Grid>
        {/* Department */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Department"
                text="Department of the user to search"
              />
              Department
            </Typography>
            <AutoTextInput
              length={255}
              errorText="Entry is too long - max length is 255."
              placeholder="Enter user's department name"
              inputValue={inputValue.department}
              setInputValue={(value) => setInputValue({ department: value })}
              typeahedID="department"
            />
            {/* <ExampleExploreControl
              setInputValue={funcSetInputValuesDepartment}
              inputValue={datasetSearch.department.examples}
            />*/}
          </FormControl>
        </Grid>
        {/* Funding Agency */}
        <Grid item xs={12} sm={10} md={10}>
          <FormControl fullWidth variant="outlined">
            <Typography className={"search-lbl"} gutterBottom>
              <HelpTooltip
                title="Funding Organization"
                text="Funding Organization of dataset's grants"
              />
              Funding Organization
            </Typography>
            <AutoTextInput
              length={255}
              errorText="Entry is too long - max length is 255."
              placeholder="Enter a funding agency"
              inputValue={inputValue.fundingOrganization}
              setInputValue={(value) => setInputValue({ fundingOrganization: value })}
              typeahedID="funding"
            />
            <ExampleSequenceControl
              setInputValue={funcSetInputValuesFundingOrg}
              inputValue={datasetSearch.fundingOrganization.examples}
              explore={true}
            />
          </FormControl>
        </Grid>
      </Grid>
    </>
  );
};

export default DatasetDetailSearchUser;
