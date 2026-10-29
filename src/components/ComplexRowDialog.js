import React from "react";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import DynamicMetadataForm from "./DynamicMetadataForm";

export default function ComplexRowDialog({
  open,
  row,
  parent,
  fields,
  errors,
  clearError,
  onClose,
  onChange,
  onSave,
  xorGroups
}) {

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      scroll="paper"
      fullWidth
    >
      <DialogTitle>
        {parent.label}
      </DialogTitle>

      <DialogContent dividers>
        <DynamicMetadataForm
            fields={fields}
            values={row}
            errors={errors}
            clearError={clearError}
            onChange={onChange}
            xorGroups={xorGroups}
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