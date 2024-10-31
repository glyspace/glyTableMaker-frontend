import { Box, Typography } from "@mui/material";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";

const GlycanTypeTable = (props) => {
    const [validationErrors, setValidationErrors] = useState({});
    const types = ["Glycan", "Motif", "Fragment"]
    const glycosylationTypes = [ "N-linked", "O-linked"];
    const subtypes = ["None", "O-GlcNAcylation","O-Glucosylation"];

    const [editedData, setEditedData] = useState({});
    const [data, setData] = useState([]);

    //const data = useMemo(() => props.glycans ? props.glycans: [], [props.glycans]);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'glycan.glytoucanID',
            header: 'GlyTouCan ID',
            enableEditing: false,
            size: 30,
          },
          {
            accessorKey: 'glycan.cartoon',
            header: 'Image',
            size: 150,
            columnDefType: 'display',
            Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
          },
          {
            accessorKey: 'type',
            header: 'Type',
            editVariant: 'select',
            editSelectOptions: types,
            muiEditTextFieldProps: ({ cell, row }) => ({
              select: true,
              error: !!validationErrors?.[cell.id],
              helperText: validationErrors?.[cell.id],
              onChange: (event) => {
                const validationError = !event.target.value || !validateRequired(event.target.value)
                  ? 'Required'
                  : undefined;
                setValidationErrors({
                  ...validationErrors,
                  [cell.id]: validationError,
                });
                const currentRow = row.original;
                currentRow.type = event.target.value;
                setData ({[row.id] : currentRow})
                props.handleGlycanTypeChange && props.handleGlycanTypeChange (data);
                setEditedData({
                  ...editedData,
                  [row.id]: { ...currentRow, type: event.target.value },
                })},
            }),
          },
          {
            accessorKey: 'glycosylationType',
            header: 'Glycosylation Type',
            editVariant: 'select',
            editSelectOptions: glycosylationTypes,
            muiEditTextFieldProps: ({ cell, row }) => ({
              select: true,
              error: !!validationErrors?.[cell.id],
              helperText: validationErrors?.[cell.id],
              onChange: (event) => {
                const validationError = !event.target.value || !validateRequired(event.target.value)
                  ? 'Required'
                  : undefined;
                setValidationErrors({
                  ...validationErrors,
                  [cell.id]: validationError,
                });
                const currentRow = row.original;
                currentRow.glycosylationType = event.target.value;
                setData ({[row.id] : currentRow})
                props.handleGlycanTypeChange && props.handleGlycanTypeChange (data);
                setEditedData({
                  ...editedData,
                  [row.id]: { ...currentRow, glycosylationType: event.target.value },
                })},
            }),
          },
          {
            accessorKey: 'glycosylationSubType',
            header: 'Glycosylation Subtype',
            editVariant: 'select',
            editSelectOptions: subtypes,
            muiEditTextFieldProps: ({ cell, row }) => ({
              select: true,
              error: !!validationErrors?.[cell.id],
              helperText: validationErrors?.[cell.id],
              onChange: (event) => {
                const validationError = !event.target.value || !validateRequired(event.target.value)
                  ? 'Required'
                  : undefined;
                setValidationErrors({
                  ...validationErrors,
                  [cell.id]: validationError,
                });
                const currentRow = row.original;
                currentRow.glycosylationSubType = event.target.value;
                setData ({[row.id] : currentRow})
                props.handleGlycanTypeChange && props.handleGlycanTypeChange (data);
                setEditedData({
                  ...editedData,
                  [row.id]: { ...currentRow, glycosylationSubType: event.target.value },
                });
              },
            }),
          },
        ],
    [editedData, validationErrors],
    );

    const table = useMaterialReactTable({
        muiTableBodyCellProps: {
          sx: {
            border: '0.5px solid rgba(200, 200, 200, .5)',
          },
        },
        muiTableHeadCellProps: {
          sx: {
            border: '0.5px solid rgba(200, 200, 200, .5)',
          },
        },
        columns,
        data: props.data ? props.data : [],
        editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also
        enableEditing: true,
        getRowId: (row) => row.id,
        muiTableContainerProps: {
          sx: {
            minHeight: '200px',
          },
        },
        
        renderBottomToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {Object.values(validationErrors).some((error) => !!error) && (
                <Typography color="error">Fix errors before submitting</Typography>
              )}
            </Box>
          ),
    });

    const clientTable = useMaterialReactTable({
        muiTableBodyCellProps: {
            sx: {
                border: '0.5px solid rgba(200, 200, 200, .5)',
            },
        },
        muiTableHeadCellProps: {
            sx: {
              border: '0.5px solid rgba(200, 200, 200, .5)',
            },
        },
        columns,
        data: props.data ? props.data : [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        getRowId: (row) => row[props.rowId],
        editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also
        enableEditing: true,
      });

    const validateRequired = (value) => !!value.length;

    return (
        <MaterialReactTable table={clientTable} />
    );
    
}

export default GlycanTypeTable;