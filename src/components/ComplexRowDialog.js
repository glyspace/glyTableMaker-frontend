import React from "react";

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import MultiAutoComplete from "./MultiAutoComplete";
import DynamicMetadataForm from "./DynamicMetadataForm";

export default function ComplexRowDialog({
  open,
  row,
  fields,
  onClose,
  onChange,
  onSave
}) {
  const updateValue = (
    fieldId,
    value
  ) => {
    onChange({
      ...row,
      value
    });
  };

  const addValue = (
    fieldId,
    value
  ) => {
    if (!value) return;

    const current =
      row[fieldId] || [];

    if (!current.includes(value)) {
      updateValue(fieldId, [
        ...current,
        value
      ]);
    }
  };

  const removeValue = (
    fieldId,
    valueToRemove
  ) => {
    updateValue(
      fieldId,
      row[fieldId].filter(
        v => v !== valueToRemove
      )
    );
  };

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Perturbation
      </DialogTitle>

      <DialogContent>
        <DynamicMetadataForm
            fields={fields}
            values={row}
            onChange={onChange}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={onSave}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}