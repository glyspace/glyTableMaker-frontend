import { Box, Link, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import { useMemo } from "react";
import { getIdFromUri } from "../utils/metadatautils";

/**
 * Multiselect text input component.
 **/
export default function MultiselectTextInput(props) {
  
   const options = useMemo(
    () => (props.options || []).map((o) => (typeof o === "string" ? { label: o } : o)),
    [props.options]
  );
 
  const optionsByLabel = useMemo(() => {
    const map = new Map();
    options.forEach((o) => map.set(o.label, o));
    return map;
  }, [options]);
 
  const asObject = props.storeAsObject ?? options.some((o) => !!o.uri);
 
  const toOption = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const label = typeof v === "string" ? v : v.name;
    if (!label) return null;
    return optionsByLabel.get(label) ?? { label, uri: typeof v === "object" ? v.uri : undefined };
  };
 
  const toStored = (sel) => {
    if (sel === null || sel === undefined) return null;
    const label = typeof sel === "string" ? sel.trim() : sel.label;
    if (!label) return null;
    if (!asObject) return label;
    const uri = (typeof sel === "string" ? optionsByLabel.get(label)?.uri : sel.uri) || undefined;
    return uri ? { name: label, id: getIdFromUri(uri), uri } : { name: label };
  };
  /**
	 * Function to handle change event for input text.
	 * @param {object} event event object.
	 * @param {string} value input value.
	 * @param {string} reason event reason.
	 **/
  const handleChange = (event, value, reason) => {
    if (props.multiple) {
      const stored = (value || []).map(toStored).filter((v) => v !== null);
      props.setInputValue(props.fieldId, stored);
    } else {
      props.setInputValue(props.fieldId, toStored(value));
    }
  }
  
  const currentValue = props.multiple
    ? (Array.isArray(props.inputValue) ? props.inputValue : props.inputValue ? [props.inputValue] : [])
        .map(toOption)
        .filter(Boolean)
    : toOption(Array.isArray(props.inputValue) ? props.inputValue[0] : props.inputValue);

  return (
    <div>
      <Autocomplete
        freeSolo={props.allowOther}
        multiple={props.multiple}
        options={options}
        getOptionLabel={(option) => (typeof option === "string" ? option : option.label ?? "")}
        isOptionEqualToValue={(option, value) => option.label === value.label}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps;
          return (
            <li key={key} {...rest}>
              <Box>
                <Typography variant="body2">{option.label}</Typography>
                {option.description && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {option.description}
                  </Typography>
                )}
              </Box>
            </li>
          );
        }}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        filterSelectedOptions
        autoHighlight={true}
        value={currentValue}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={props.placeholder}
            error={!!props.errorText}
            helperText={props.errorText}
          />
        )}
      />
    </div>
  );
}

MultiselectTextInput.propTypes = {
  inputValue: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.object]),
  placeholder: PropTypes.string,
  options: PropTypes.array,
  setInputValue: PropTypes.func,
  multiple: PropTypes.bool,
  allowOther: PropTypes.bool,
  storeAsObject: PropTypes.bool,
  fieldId: PropTypes.string,
  errorText: PropTypes.string
};