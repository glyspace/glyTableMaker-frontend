import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { useEffect, useMemo, useState } from "react";
import typeList from '../data/glycosylationTypes.json';
import { Box, IconButton, MenuItem, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const GlycanTypeTable = (props) => {
    const [validationErrors, setValidationErrors] = useState({});
    const types = ["Glycan", "Motif", "Fragment"]
    const glycosylationTypes = typeList.map(type => type.name);
    //const [subtypes, setSubtypes] = useState([""].concat (typeList.filter(type => type.name === (props.glycosylationType ?? "N-linked")).map(type => type.subtype).flat()));

    const [editedData, setEditedData] = useState({});
    const [data, setData] = useState([]);

    const [selectedGlycosylationType, setSelectedGlycosylationType] = useState ("");
    const [selectedGlycosylationSubType, setSelectedGlycosylationSubType] = useState ("");

    useEffect (() => {
      if (props.glycosylationType) {
        setSelectedGlycosylationType (props.glycosylationType);
        //var types = typeList.filter(type => type.name === props.glycosylationType).map(type => type.subtype).flat();
        //types = [""].concat(types);
        //setSubtypes(types);
      }
      if (props.glycosylationSubType) {
        setSelectedGlycosylationSubType (props.glycosylationSubType);
      }
    }, [props.data, props.glycosylationType, props.glycosylationSubType]);

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
              value: row.original.glycosylationType !== "" ? row.original.glycosylationType : selectedGlycosylationType,
              error: !!validationErrors?.[cell.id],
              helperText: validationErrors?.[cell.id],
              onChange: (event) => {
                // change subtypes
                //var types = typeList.filter(type => type.name === event.target.value).map(type => type.subtype).flat();
                //types = [""].concat(types);
                //setSubtypes(types);
                const validationError = !event.target.value || !validateRequired(event.target.value)
                  ? 'Required'
                  : undefined;
                setValidationErrors({
                  ...validationErrors,
                  [cell.id]: validationError,
                });
                const currentRow = row.original;
                currentRow.glycosylationType = event.target.value;
                setSelectedGlycosylationType(event.target.value);
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
            muiEditTextFieldProps: ({ cell, row }) => {
              let currentType = row.original.glycosylationType;
              if (currentType === "") currentType = selectedGlycosylationType;
              const subTypeOptions = typeList.find(type => type.name === currentType)?.subtype ?? [];
              return {
                select: true,
                value: row.original.glycosylationSubType !== "" ? row.original.glycosylationSubType : selectedGlycosylationSubType,
                error: !!validationErrors?.[cell.id],
                helperText: validationErrors?.[cell.id],
                onChange: (event) => {
                  const currentRow = row.original;
                  currentRow.glycosylationSubType = event.target.value;
                  setSelectedGlycosylationSubType (event.target.value);
                  setData ({[row.id] : currentRow})
                  props.handleGlycanTypeChange && props.handleGlycanTypeChange (data);
                  setEditedData({
                    ...editedData,
                    [row.id]: { ...currentRow, glycosylationSubType: event.target.value },
                  });
                },
                children: subTypeOptions.length > 0
                  ? subTypeOptions.map(sub => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))
                  : <MenuItem disabled>No subtypes available</MenuItem>,
              }
            },
          },
        ],
    [editedData, validationErrors, selectedGlycosylationSubType, selectedGlycosylationType],
    );

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
        enableRowActions: props.enableRowActions,
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => props.delete && props.delete(row.original[props.rowId])}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            </Box>)
      });

    const validateRequired = (value) => !!value.length;

    return (
        <MaterialReactTable table={clientTable} />
    );
    
}

export default GlycanTypeTable;