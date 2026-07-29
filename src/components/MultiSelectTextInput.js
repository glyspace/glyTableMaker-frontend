import React, { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import { Col, Row } from "react-bootstrap";
import { Typography } from "@mui/material";

/**
 * Multiselect text input component.
 **/
export default function MultiselectTextInput(props) {
  
  /**
	 * Function to handle change event for input text.
	 * @param {object} event event object.
	 * @param {string} value input value.
	 * @param {string} reason event reason.
	 **/
  const handleChange = (event, value, reason) => {
    props.setInputValue(props.fieldId, value);
  };

  return (
    <div>
      <Autocomplete
        freeSolo={props.allowOther}
        multiple={props.multiple}
        options={props.options}
        getOptionLabel={(option) => option}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        filterSelectedOptions
        autoHighlight={true}
        value={props.inputValue}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={props.placeholder}
          />
        )}
      />
    </div>
  );
}

MultiselectTextInput.propTypes = {
  inputValue: PropTypes.array,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  setInputValue: PropTypes.func,
  multiple: PropTypes.bool,
  fieldId: PropTypes.string
};