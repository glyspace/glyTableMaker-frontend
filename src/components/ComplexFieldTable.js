import React, { useState } from "react";

import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ComplexRowDialog from "./ComplexRowDialog";

export default function ComplexFieldTable({
  field,
  value = [],
  onChange
}) {
  const [open, setOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

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
    setEditIndex(null);
    setCurrentRow(createEmptyRow());
    setOpen(true);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setCurrentRow(
      JSON.parse(JSON.stringify(value[index]))
    );
    setOpen(true);
  };

  const handleDelete = (index) => {
    const rows = [...value];
    rows.splice(index, 1);
    onChange(rows);
  };

  const handleSave = () => {
    const rows = [...value];

    if (editIndex === null) {
      rows.push(currentRow);
    } else {
      rows[editIndex] = currentRow;
    }

    onChange(rows);
    setOpen(false);
  };

  return (
    <>
      <Table size="small">
        <TableHead>
          <TableRow>
            {field.fields.map((subField) => (
              <TableCell key={subField.id}>
                {subField.label}
              </TableCell>
            ))}
            <TableCell width={120}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {value.map((row, index) => (
            <TableRow key={index}>
              {field.fields.map((subField) => (
                <TableCell key={subField.id}>
                    {Array.isArray(row[subField.id]) ? (
                        row[subField.id].map((item, index) => (
                            <div key={index}>{item}</div>
                        ))
                        ) : (
                        row[subField.id]
                        )}
                </TableCell>
              ))}

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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(field.multiple || value.length === 0) && (
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
        onClose={() => setOpen(false)}
        onChange={setCurrentRow}
        onSave={handleSave}
      />
    </>
  );
}