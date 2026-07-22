import { Autocomplete, TextField } from "@mui/material";
import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { getAuthorizationHeader, getJson } from "../utils/api";

export default function MultiAutoComplete (props) {
    const [options, setOptions] = useState([]);
    const inputValueRef = useRef (props.inputValue);
    inputValueRef.current = props.inputValue;


    /**
	 * Function to handle change event for input text.
	 * @param {object} event event object.
	 * @param {string} value input value.
	 * @param {string} reason event reason.
	 **/
	const handleChange = (event, value, reason) => {
		if (!(event === null && value === "" && reason === "reset")){
			props.setInputValue(props.fieldId, value);
		}
	};

    const getTypeAhead =  (namespace, searchTerm) => {
        return getJson ("api/util/gettypeahead?namespace=" + namespace + "&limit=10&value=" + encodeURIComponent(searchTerm), 
                    getAuthorizationHeader());
    }

    /**
	 * useEffect to get typeahead data from api.
	 **/
	React.useEffect(() => {
		if (!props.inputValue || props.inputValue.trim() === '') {
			setOptions([]);
			return undefined;
		}
		if (props.inputValue) {
			getTypeAhead(props.namespace, props.inputValue).then((response) => inputValueRef.current && inputValueRef.current.trim() !== '' ? Array.isArray(response.data.data) ? setOptions(response.data.data) : setOptions([]) : setOptions([]))
			.catch(function (error) {});
		}

		return;
	}, [props.inputValue, props.namespace]);

return (
    <Autocomplete
        freeSolo
        disabled={props.disabled}
        multiple={props.multiple}
        value={props.inputValue}
        onClose={(event, reason) => {
            console.log("closing reason " + reason );
            /*if (options[index].length === 0) return;
            if ((reason === "selectOption" || reason === "blur")) {
                getCanonicalForm (props.namespace, 
                    reason === "selectOption" ? event.target.textContent : event.target.value, 
                    index);
            }*/
        }}
        isOptionEqualToValue={(option, value) => (option === value)}
        options={options}
        onInputChange={handleChange}
        getOptionLabel={(option) => option}
        style={{ width: '100%' }}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        renderInput={(params) => (
            <TextField {...params} 
                variant='outlined'
                placeholder={props.placeholder} />
        )}
    />);
}

MultiAutoComplete.propTypes = {
  inputValue: PropTypes.string,
  placeholder: PropTypes.string,
  namespace: PropTypes.string,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  required: PropTypes.bool,
  setInputValue: PropTypes.func,
  error: PropTypes.func,
  errorText: PropTypes.string,
  fieldId: PropTypes.string
};