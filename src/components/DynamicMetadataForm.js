import React from "react";
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
    // MULTI VALUE TEXT
    //
    if (field.type === "text" && field.multiple) {
      return (
        <FormControl fullWidth variant="outlined">
          {label}

          <TextField
            size="small"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addMultiValue(field.id, e.target.value.trim());
                e.target.value = "";
              }
            }}
            placeholder="Press Enter to add value"
          />

          <Stack
            direction="row"
            spacing={1}
            mt={1}
            flexWrap="wrap"
          >
            {(values[field.id] || []).map((value) => (
              <Chip
                key={value}
                label={value}
                onDelete={() =>
                  removeMultiValue(field.id, value)
                }
              />
            ))}
          </Stack>
          </FormControl>
      );
    }

    //
    // MULTI VALUE AUTOCOMPLETE
    //
    if (field.type === "autocomplete") {
      return (
        <FormControl fullWidth variant="outlined">
          {label}

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
        </FormControl>
      );
    }

    if (field.type === "select") {
      return (
        <FormControl fullWidth variant="outlined">
          {label}

          <MultiselectTextInput
            inputValue={values[field.id]}
            fieldId={field.id}
            required={field.required}
            multiple={field.multiple}
            placeholder="Select"
            setInputValue={updateValue}
            options={field.options}
          />
        </FormControl>
      );
    }

    //
    // SINGLE TEXT
    //
    return (
      <FormControl fullWidth variant="outlined">
        {label}
        <TextField
          size="small"
          value={values[field.id] || ""}
          onChange={(e) =>
            updateValue(field.id, e.target.value)
          }
        />
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