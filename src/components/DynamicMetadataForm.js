import React, { useReducer, useState } from "react";
import {
  Box,
  Chip,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Autocomplete,
  FormControl,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MultiAutoComplete from "./MultiAutoComplete";
import MultiselectTextInput from "./MultiSelectTextInput";
import { Button, Col, Row } from "react-bootstrap";
import ComplexFieldTable from "./ComplexFieldTable";
import MultiTextInput from "./MultiTextInput";
import TextAlert from "./TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "./Loading";
import { axiosError } from "../utils/axiosError";
import { getJson } from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DynamicMetadataForm({
  fields,
  values,
  onChange,
}) {

  const [showLoading, setShowLoading] = useState(false);
  const [alertDialogInput, setAlertDialogInput] = useReducer(
          (state, newState) => ({ ...state, ...newState }),
          { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
  );

  const [selectedPublication, setSelectedPublication] = useState(null);
  const [publicationCache, setPublicationCache] = useState({});

  const error = (errorMessage) => {
    setTextAlertInput(errorMessage);
  }
  
  const updateValue = (fieldId, value) => {
    onChange({
      ...values,
      [fieldId]: value,
    });
  };


  const addMultiValue = (fieldId, newValue) => {
    if (!newValue) return;

    const current = values[fieldId] || [];

    if (!current.includes(newValue)) {
      updateValue(fieldId, [...current, newValue]);
    }
  };

  const removeMultiValue = (fieldId, valueToRemove) => {
    const current = values[fieldId] || [];

    updateValue(
      fieldId,
      current.filter((v) => v !== valueToRemove)
    );
  };

  const getPublication = (pubId, event) => {
      if (publicationCache[pubId]) {
          setSelectedPublication (publicationCache[pubId]);
      }
      else {
          setShowLoading(true);
          // get the publication details
          getJson ("api/util/getpublication?identifier=" + pubId).then (({ data }) => {
              if (data.data) {
                  setSelectedPublication(data.data);
                  publicationCache[pubId] = data.data;
                  setShowLoading(false);
              }
          }).catch(function(error) {
              if (error && error.response && error.response.data) {
                  setTextAlertInput ({"show": true, "message": error.response.data.message });
                  setShowLoading(false);
                  return;
              } else {
                  axiosError(error, null, setAlertDialogInput);
              }
          });
      }
  }

  const renderField = (field) => {
    const label = (
      <>
        <Typography className="search-lbl" gutterBottom>
          <Tooltip title={field.description || ""}>
            <IconButton size="small">
              <HelpOutlineIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
          {field.label}
          {field.required && (
            <span style={{ color: "red" }}> *</span>
          )}
        </Typography>
      </>
    );

    if (field.type === "autocomplete") {
      return (
        <FormControl fullWidth variant="outlined">
          <Row>
          <Col xs={2} sm={3}> {label} </Col>
          <Col xs={10} sm={9}>
          <MultiAutoComplete
            inputValue={values[field.id]}
            fieldId={field.id}
            required={field.required}
            multiple={field.multiple}
            namespace={field.namespace}
            placeholder="Start typing"
            disabled={false}
            setInputValue={updateValue}
            error={error}
            errorText="not valid"
          />
          </Col>
          </Row>
        </FormControl>
      
      );
    }

    if (field.type === "select") {
      return (
        <FormControl fullWidth variant="outlined">
          <Row>
          <Col xs={2} sm={3}> {label} </Col>
          <Col xs={10} sm={9}>
          <MultiselectTextInput
            inputValue={values[field.id]}
            fieldId={field.id}
            required={field.required}
            multiple={field.multiple}
            allowOther={field.allowOther}
            placeholder="Select"
            setInputValue={updateValue}
            options={field.options}
          />
          </Col></Row>
        </FormControl>
      );
    }

    if (field.type === "complex") {
      return ( <>
      {label}
      <ComplexFieldTable
        field={field}
        value={values[field.id] || []}
        onChange={(rows) =>
          updateValue(field.id, rows)
        }
      />
      </>);
    }

    if (field.type === "text" && field.multiple) {
      return (
        <>
        <Row>
        <Col xs={2} sm={3}> {label} </Col>
        <Col xs={10} sm={9}>
            <MultiTextInput 
              field={field}
              inputValue={values[field.id] || []}
              setInputValue={updateValue}
            />
            {field.example && (
        <Tooltip 
            disableTouchListener
            interactive
            arrow
            placement={"bottom-start"}
            classes={{ tooltip: "gg-tooltip" }}
            title="Click to insert example.">
          <Button
            className={"example-btn"}
            style={{ fontSize: "12px" }}
            onClick={() => {
              updateValue(field.id, [field.example]);
            }}
          >
            {field.example}
          </Button>
        </Tooltip>)}
        </Col>
        </Row>
        </>
      );
    }

    if (field.type === "publication") {
      return (
      <FormControl fullWidth variant="outlined">
        <Row>
        <Col xs={2} sm={3}> {label} </Col>
        <Col xs={10} sm={9}>
        <TextField
          size="small"
          fullWidth
          value={values[field.id] || ""}
          onChange={(e) => {
            if (e.target.value === "") setSelectedPublication(null);
            updateValue(field.id, e.target.value);
          }}
          onBlur={(e) => {
              if (e.target.value) {
                getPublication(e.target.value);
              }
            }}
        />
        </Col></Row>
        {selectedPublication && 
        <Box>
          <Typography sx={{ p: 2 }}>
                              <div>
                              <h6 style={{ marginBottom: "3px" }}>
                              <strong>{selectedPublication.title}</strong>
                              </h6>
                          </div>
          
                          <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                              <div>{selectedPublication.authors}</div>
                              <div>
                              {selectedPublication.journal} <span>&nbsp;</span>({selectedPublication.year})
                              </div>
                              <div>
                              <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />
          
                              {selectedPublication.pubmedId && 
                              <>
                              <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                              <a
                                  href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pubmedId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                  {selectedPublication.pubmedId}
                              </a>
                              </>
                              }
                              {selectedPublication.doiId && 
                              <>
                              <span style={{ paddingLeft: "15px" }}>DOI:&nbsp;</span>
                              <a
                                  href={`https://doi.org/${selectedPublication.doiId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                              >
                                  {selectedPublication.doiId}
                              </a>
                              </>
                              }
                              </div>
                          </div>
                          </Typography>
        </Box>}
      </FormControl>
      );
    }

    //
    // SINGLE TEXT
    //
    return (
      <FormControl fullWidth variant="outlined">
        <Row>
        <Col xs={2} sm={3}> {label} </Col>
        <Col xs={10} sm={9}>
        <TextField
          size="small"
          fullWidth
          value={values[field.id] || ""}
          onChange={(e) =>
            updateValue(field.id, e.target.value)
          }
        />
        {field.example && (
        <Tooltip 
            disableTouchListener
            interactive
            arrow
            placement={"bottom-start"}
            classes={{ tooltip: "gg-tooltip" }}
            title="Click to insert example.">
          <Button
            className={"example-btn"}
            variant="link"
            onClick={() => {
              updateValue(field.id, field.example);
            }}
          >
            {field.example}
          </Button>
        </Tooltip>)}
        </Col></Row>
      </FormControl>
    );
  };

  return (
    <>
    <TextAlert alertInput={textAlertInput}/>
    <Loading show={showLoading}></Loading>
    <Grid 
        container
				style={{ margin: "0 0 0 -12px" }}
				spacing={3}
				justifyContent='center'>
      {fields.map((field) => (
        <Grid item xs={12} sm={10} key={field.id}>
          <Box>{renderField(field)}</Box>
        </Grid>
      ))}
    </Grid>
    </>
  );
}