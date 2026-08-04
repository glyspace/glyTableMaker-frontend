import { Autocomplete, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Typography } from "@mui/material";
import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { Button } from "react-bootstrap";

export default function MultiAutoComplete (props) {
    const [options, setOptions] = useState([]);
    const [searchInput, setSearchInput] = useState(""); 
    const inputValueRef = useRef (props.inputValue);
    inputValueRef.current = props.inputValue;

    const [enableMultiValueSelect, setEnableMultiValueSelect] = useState(false);
    const [selectedCanonical, setSelectedCanonical] = useState(null);
    const [canonicalForm, setCanonicalForm] = useState([]);

    /**
	 * Function to handle change event for input text.
	 * @param {object} event event object.
	 * @param {string} value input value.
	 * @param {string} reason event reason.
	 **/
	const handleChange = async (event, value, reason) => {
        console.log("Reason" + reason);
		/*if (!(event === null && value === "" && reason === "reset")){
			props.setInputValue(props.fieldId, value);
		} */
        if (reason === "selectOption") {
            if (props.multiple) {
                if (reason === "removeOption") {
                    props.setInputValue(props.fieldId, value);
                    return;
                }

                const newestValue = value[value.length - 1];

                const canonical = await getCanonicalForm(
                    props.namespace,
                    newestValue
                );

                if (!canonical) {
                    if (!props.allowOther) {
                        const updated = [
                            ...value.slice(0, value.length - 1)];
                        props.setInputValue(props.fieldId, updated);
                        return;
                    } else {
                        return;
                    }
                }

                const updated = [
                    ...value.slice(0, value.length - 1),
                    canonical
                ];

                props.setInputValue(
                    props.fieldId,
                    updated
                );

                return;
            }

            const canonical = await getCanonicalForm(
                props.namespace,
                value
            );

            if (!canonical) return;

            if (canonical) {
                props.setInputValue(
                    props.fieldId,
                    canonical
                );
            }
        }
	};

    const onInputChange = (event, value, reason) => {
        setSearchInput(value);
    }

    function multiValueDialog () {
        return (
            <Dialog
                    maxWidth="sm"
                    fullWidth="true"
                    aria-labelledby="multivalue-modal-title"
                    aria-describedby="multivaluee-modal-description"
                    scroll="paper"
                    
                    sx={{ //You can copy the code below in your theme
                        '& .MuiBackdrop-root': {
                          backgroundColor: 'transparent' // Try to remove this to see the result
                        }
                      }}
                    open={enableMultiValueSelect}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setEnableMultiValueSelect(false);
                        setSelectedCanonical(null);
                    }}
                >
                    <DialogTitle id="multivalue-modal-title">
                        <Typography id="multivalue-modal-title" variant="h6" component="h2">
                        There are multiple matches for this selection. Select one: 
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        {canonicalForm && 
                        <FormControl>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          name="radio-buttons-group"
                          defaultValue={canonicalForm[0] && canonicalForm[0].label}
                        >
                        {canonicalForm.map ((val, i) => {
                            return <FormControlLabel 
                                value={val.label} 
                                control={<Radio />} 
                                label={val.label}
                                onChange={(event) => {
                                    setSelectedCanonical (event.target.value);
                                }} />
                        })}
                        </RadioGroup>
                      </FormControl>}
                    </DialogContent>
                    <DialogActions>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=> {
                                const canonical = selectedCanonical || canonicalForm[0].label;
                                if (props.multiple) {
                                    const current = [...props.inputValue];
                                    current[current.length - 1] = canonical;
                                    props.setInputValue(props.fieldId, current);
                                } else {
                                    props.setInputValue(props.fieldId, canonical);
                                }
                                setEnableMultiValueSelect (false);
                                setSelectedCanonical(null);
                            }}>Select</Button>
                    </DialogActions>
            </Dialog>
        )
    }


    async function getCanonicalForm(namespace, value) {
        const response = await postJson(
            "api/util/getcanonicalform?namespace=" +
                namespace +
                "&value=" +
                encodeURIComponent(value),
            null,
            getAuthorizationHeader()
        );

        const matches = response.data?.data;

        if (!matches || matches.length === 0) {
           return value;
        }

        if (matches.length === 1) {
            return matches[0].label;
        }

        // open dialog if multiple
        setCanonicalForm(matches);
        setEnableMultiValueSelect(true);

        return null;
    }

    const getTypeAhead =  (namespace, searchTerm) => {
        return getJson ("api/util/gettypeahead?namespace=" + namespace + "&limit=10&value=" + encodeURIComponent(searchTerm), 
                    getAuthorizationHeader());
    }

    /**
	 * useEffect to get typeahead data from api.
	 **/
	React.useEffect(() => {
		if (!searchInput || searchInput.trim() === '') {
			setOptions([]);
			return undefined;
		}
		if (searchInput) {
			getTypeAhead(props.namespace, searchInput).then((response) => searchInput && searchInput.trim() !== '' ? Array.isArray(response.data.data) ? setOptions(response.data.data) : setOptions([]) : setOptions([]))
			.catch(function (error) {});
		}

		return;
	}, [searchInput, props.inputValue, props.namespace]);

return (
    <>
    {enableMultiValueSelect && multiValueDialog()} 
    <Autocomplete
        freeSolo
        disabled={props.disabled}
        multiple={props.multiple}
        value={props.inputValue ?? (props.multiple ? [] : null)}
        onInputChange={onInputChange}
        onClose={(event, reason) => {
            console.log("closing reason " + reason );
           /* if ((reason === "selectOption" || reason === "blur")) {
                getCanonicalForm (props.namespace, 
                    reason === "selectOption" ? event.target.textContent : event.target.value);
            }*/
        }}
        isOptionEqualToValue={(option, value) => (option === value)}
        options={options}
        onChange={handleChange}
        getOptionLabel={(option) => option}
        style={{ width: '100%' }}
        classes={{
          option: "auto-option",
          inputRoot: "auto-input-root",
          input: "input-auto",
        }}
        renderValue={(value, getItemProps) =>
          value.map((option, index) => {
            const { key, ...itemProps } = getItemProps({ index });
            return (
              <Chip variant="outlined" label={option} key={key} {...itemProps} />
            );
          })
        }
        renderInput={(params) => (
            <TextField {...params} 
                variant='outlined'
                placeholder={props.placeholder} />
        )}
    />
    </>);
}

MultiAutoComplete.propTypes = {
  inputValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  placeholder: PropTypes.string,
  namespace: PropTypes.string,
  disabled: PropTypes.bool,
  multiple: PropTypes.bool,
  allowOther: PropTypes.bool,
  required: PropTypes.bool,
  setInputValue: PropTypes.func,
  error: PropTypes.func,
  errorText: PropTypes.string,
  fieldId: PropTypes.string
};