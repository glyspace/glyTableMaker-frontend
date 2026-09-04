import React, { useReducer, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  FormControl,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import EditIcon from '@mui/icons-material/Edit';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import MultiAutoComplete from "./MultiAutoComplete";
import MultiselectTextInput from "./MultiSelectTextInput";
import { Button, Col, Row } from "react-bootstrap";
import ComplexFieldTable from "./ComplexFieldTable";
import MultiTextInput from "./MultiTextInput";
import TextAlert from "./TextAlert";
import { Loading } from "./Loading";
import { axiosError } from "../utils/axiosError";
import { getContributorString, getJson } from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContributorTable from "./ContributorTable";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function DynamicMetadataForm({
  fields,
  values,
  errors,
  contributorValue,
  onContributorChange,
  onChange,
  clearError
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
  const [showContributorTable, setShowContributorTable] = useState(false);
  const [editContributor, setEditContributor] = useState (false);

  const [selectedSpecies, setSelectedSpecies] = useState(null);

  const plant = []; //TODO decide what constitutes plant species
  
  const updateValue = (fieldId, value) => {
    onChange({
      ...values,
      [fieldId]: value,
    });

    if (clearError) clearError(fieldId);

    if (fieldId === "species") {
      setSelectedSpecies(value);
    } 
  };

  const handleContributorChange = (contrib) => {
    var c = getContributorString(contrib);
    onContributorChange(c);
    updateValue("contributor", contrib);
  }

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
                  setPublicationCache(prev => ({
                    ...prev,
                    pubId: data.data
                    }));
                  //publicationCache[pubId] = data.data;
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
          {field.title ? field.title : field.label}
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
            allowOther={field.allowOther}
            namespace={field.id === "tissue" && selectedSpecies !== null && selectedSpecies.id && plant.includes (selectedSpecies.id) ? field.alternativeNamespce : field.namespace}
            placeholder="Start typing"
            disabled={false}
            setInputValue={updateValue}
            errorText={errors?.[field.id]}
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
            errorText={errors?.[field.id]}
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
        errors={errors?.[field.id]}
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
              errorText={errors?.[field.id]}
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
          error={!!errors?.[field.id]}
          helperText={errors?.[field.id]}
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
              <a href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pubmedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  {selectedPublication.pubmedId}
                  <OpenInNewIcon sx={{ fontSize: '0.9em', ml: 0.5, verticalAlign: 'middle' }}/>
              </a>
              </>
              }
              {selectedPublication.doiId && 
              <>
              <span style={{ paddingLeft: "15px" }}>DOI:&nbsp;</span>
              <a href={`https://doi.org/${selectedPublication.doiId}`}
                  target="_blank"
                  rel="noopener noreferrer"
              >
                  {selectedPublication.doiId}
                  <OpenInNewIcon sx={{ fontSize: '0.9em', ml: 0.5, verticalAlign: 'middle' }}/>
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

    if (field.type === "contributor") {
      return (
        <Row>
        <Col xs={2} sm={3}> {label} </Col>
        <Col xs={8} sm={7}>
        <TextField 
            size="small"
            fullWidth
            inputProps={{ readOnly: true }}
            error={!!errors?.[field.id]}
            helperText={errors?.[field.id]}
            value={contributorValue} variant="outlined"/>
        </Col>
        <Col xs={2} sm={1}>
        <Box>
          <Tooltip title="View contributor information">
            <IconButton color="primary" onClick={(event) => {setEditContributor(false); setShowContributorTable(true)}}>
              <VisibilityOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Change contributor information">
            <IconButton color="primary" onClick={(event) => {setEditContributor(true); setShowContributorTable(true)}}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
        </Col></Row>
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
          error={!!errors?.[field.id]}
          helperText={errors?.[field.id]}
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
    {showContributorTable && 
          <ContributorTable 
              open={showContributorTable}
              onClose={() => setShowContributorTable(false)}
              setContributor={handleContributorChange} 
              contributor={values["contributor"]}
              edit={editContributor}
          />
    }
    </>
  );
}