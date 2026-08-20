import { Autocomplete, Chip, TextField } from "@mui/material";
import { useState } from "react";

export default function MultiTextInput (props) {
    const [inputValue, setInputValue] = useState("");
    return (
        <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={props.inputValue}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                  setInputValue(newInputValue);
              }}
              onChange={(event, newValue) => {
                props.setInputValue(props.field.id, newValue);
              }}
              onBlur={() => {
                  if (
                    inputValue.trim() &&
                    !(props.inputValue || []).includes(inputValue.trim())
                  ) {
                    props.setInputValue(props.field.id, [
                      ...(props.inputValue || []),
                      inputValue.trim(),
                    ]);
                    setInputValue("");
                  }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant='outlined'
                  placeholder="Enter values (click Enter to add multiple)"
                  error={!!props.errorText}
                  helperText={props.errorText}
                />
              )}
            />
    )
}