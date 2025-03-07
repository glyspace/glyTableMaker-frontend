import { Autocomplete, FormHelperText, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { axiosError } from "../utils/axiosError";
import { getJson } from "../utils/api";
import PropTypes from "prop-types";

/**
 * Text input component with typeahead.
 **/
function AutoTextInput(props) {
  const [options, setOptions] = useState([]);
  const inputValueRef = useRef(props.inputValue);
  inputValueRef.current = props.inputValue;

  /**
   * Function to handle change event for input text.
   * @param {object} event event object.
   * @param {string} value input value.
   * @param {string} reason event reason.
   **/
  const handleChange = (event, value, reason) => {
    if (!(event === null && value === "" && reason === "reset")) {
      props.setInputValue(value);
    }
  };

  const getTypeahed = (typeahedID, inputValue, limit = 100) => {
      getJson ("api/util/gettypeahead?namespace=" + typeahedID + "&limit=10&value=" + encodeURIComponent(inputValue)).then (({ data }) => {
        inputValueRef.current.trim() !== "" ? setOptions(data.data) : setOptions([])
      }).catch(function(error) {
        axiosError(error, null, props.setAlertDialogInput);
      });   
  };

  /**
   * useEffect to get typeahead data from api.
   **/
  useEffect(() => {
    if (props.inputValue.trim() === "") {
      setOptions([]);
      return undefined;
    }

    if (props.inputValue && props.inputValue.length <= props.length) {
      getTypeahed(props.typeahedID, props.inputValue);
    }

    return;
  }, [props.inputValue, props.typeahedID]);

  return (
    <>
      <Autocomplete
        freeSolo
        getOptionLabel={(option) => option}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        options={options}
        filterOptions={(options) => options}
        autoHighlight={true}
        inputValue={props.inputValue}
        onInputChange={handleChange}
        onBlur={props.onBlur}
        onClose={(event, reason) => setOptions([])}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            required={props.required}
            placeholder={props.placeholder}
            error={props.inputValue.length > props.length || props.error}
          />
        )}
      />
      {props.inputValue.length > props.length && (
        <FormHelperText className={"error-text"} error>
          {props.errorText}
        </FormHelperText>
      )}
    </>
  );
}

AutoTextInput.propTypes = {
  inputValue: PropTypes.string,
  placeholder: PropTypes.string,
  typeahedID: PropTypes.string,
  errorText: PropTypes.string,
  length: PropTypes.number,
  required: PropTypes.bool,
  setInputValue: PropTypes.func,
};
export default AutoTextInput;
