import { useState } from "react";

import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ComplexRowDialog from "./ComplexRowDialog";

const toRows = (value) => {
  if (value === null || value === undefined || value === "") return [];
  return Array.isArray(value) ? value : [value];
};

export default function ComplexFieldTable({
  field,
  value = [],
  errors,
  onChange, 
  readOnly=false,
  xorGroups
}) {

  const handleRows = (nextRows) => onChange (field.multiple ? nextRows : (nextRows[0] ?? null));
  const rows = toRows(value);

  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [rowErrors, setRowErrors] = useState({});

  const createEmptyRow = () => {
    const row = {};

    field.fields.forEach(f => {
      row[f.id] = f.multiple ? [] : "";
    });

    return row;
  };

  const [currentRow, setCurrentRow] = useState(
    createEmptyRow()
  );

  const handleAdd = () => {
    setRowErrors({});
    setEditIndex(null);
    setCurrentRow(createEmptyRow());
    setOpen(true);
  };

  const handleEdit = (index) => {
    setRowErrors({});
    setEditIndex(index);
    setCurrentRow(
      JSON.parse(JSON.stringify(rows[index]))
    );
    setOpen(true);
  };

  const handleDelete = (index) => {
    const next = [...rows];
    next.splice(index, 1);
    handleRows(next);
  };

  const isFieldRequired = (field, values) => {
        if (field.requiredWhen) {
            const dependentValue = values[field.requiredWhen.field];
            return dependentValue === field.requiredWhen.value;
        }

        if (field.required) {
            return true;
        }
    }
       

  const validateRow = () => {
    const errors = {};

    field.fields.forEach(subField => {
        const value = currentRow[subField.id];

        const empty =
            value == null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

        if (isFieldRequired(subField, currentRow) && empty) {
            errors[subField.id] =
                `${subField.label} is required`;
        }
    });

    return errors;
  };

  const clearRowError = (fieldId) => {
    setRowErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldId];
        return updated;
    });
  };

  const handleSave = () => {
    const errors = validateRow();
    if (Object.keys(errors).length > 0) {
      setRowErrors(errors);
      return;
    }
    
    setRowErrors({});
    const next = [...rows];

    if (editIndex === null) {
      next.push(currentRow);
    } else {
      next[editIndex] = currentRow;
    }

    handleRows(next);
    setOpen(false);
  };

  const renderValue = (value) => {
    if (value == null) return "";

    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <div key={index}>{renderValue(item)}</div>
      ));
    }

    if (typeof value === "object") {
      if (value.name && value.id) {
        if (value.uri) {
          return (
            <>
              {value.name}{" "}
              (
              <a href={value.uri} target="_blank" rel="noopener noreferrer">{value.id}
                <OpenInNewIcon sx={{ fontSize: '0.9em', ml: 0.5, verticalAlign: 'middle' }}/>
              </a>
              )</>
          )
        }
        return value.name + " (" + value.id + ")";
      } 
      return value.label || value.name || JSON.stringify(value);
    }

    return value;
  };

  return (
    <>
      {errors && (
        <Typography color="error" sx={{ mt: 1 }}>
            {errors}
        </Typography>
      )}
      <Table size="small">
        <TableHead>
          <TableRow>
            {field.fields.map((subField) => (
              <TableCell key={subField.id}>
                {subField.label}
              </TableCell>
            ))}
            {!readOnly && (
              <TableCell>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              {field.fields.map((subField) => (
                <TableCell key={subField.id}>
                    {renderValue(row[subField.id])}
                </TableCell>
              ))}

              {!readOnly && (
              <TableCell>
                <IconButton
                  onClick={() =>
                    handleEdit(index)
                  }
                >
                  <EditIcon />
                </IconButton>

                <IconButton
                  color="error"
                  onClick={() =>
                    handleDelete(index)
                  }
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {!readOnly && 
      (field.multiple || rows.length === 0) && (
      <Button
        startIcon={<AddIcon />}
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={handleAdd}
      >
        Add {field.label}
      </Button>
      )}

      <ComplexRowDialog
        open={open}
        row={currentRow}
        parent={field}
        fields={field.fields}
        errors={rowErrors}
        clearError={clearRowError}
        onClose={() => setOpen(false)}
        onChange={setCurrentRow}
        onSave={handleSave}
        xorGroups={xorGroups}
      />
    </>
  );
}