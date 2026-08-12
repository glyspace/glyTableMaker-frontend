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
  onClose,
  onChange,
  onSave
}) {

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {parent.label}
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