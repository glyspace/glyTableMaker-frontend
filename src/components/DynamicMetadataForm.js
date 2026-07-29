import React, { useState } from "react";
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

export default function DynamicMetadataForm({
  fields,
  values,
  onChange,
}) {
  const error = () => {
    console.log("error!");
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

    //
    // MULTI VALUE AUTOCOMPLETE
    //
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

    // MULTI TEXT
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
  );
}