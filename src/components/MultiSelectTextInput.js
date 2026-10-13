import { Box, Link, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import { useMemo } from "react";

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

  const optionMap = useMemo(() => {
    const map = new Map();
    (props.options || []).forEach((o) => {
      if (typeof o === "string") map.set(o, { label: o });
      else map.set(o.label, o);
    });
    return map;
  }, [props.options]);

  const optionLabels = useMemo(() => Array.from(optionMap.keys()), [optionMap]);

  return (
    <div>
      <Autocomplete
        freeSolo={props.allowOther}
        multiple={props.multiple}
        options={optionLabels}
        getOptionLabel={(option) => option}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps;
          const info = optionMap.get(option);
          return (
            <li key={key} {...rest}>
              <Box>
                <Typography variant="body2">{option}</Typography>
                {info?.description && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {info.description}
                  </Typography>
                )}
                {info?.uri && (
                  <Link
                    href={info.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    onClick={(e) => e.stopPropagation()}
                  >
                    More info
                  </Link>
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
        value={props.inputValue}
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
  inputValue: PropTypes.array,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  setInputValue: PropTypes.func,
  multiple: PropTypes.bool,
  fieldId: PropTypes.string,
  errorText: PropTypes.string
};