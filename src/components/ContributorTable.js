import React, { useMemo, useReducer, useState } from 'react';
import {
  MaterialReactTable,
  // createRow,
  useMaterialReactTable,
} from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Card } from 'react-bootstrap';
import HelpTooltip from './HelpTooltip';
import helpText from '../data/helpText.json';
import { isValidURL } from '../utils/api';
import TextAlert from "../components/TextAlert";

let peopleId = 2;
let softwareId = 2;

const ContributorTable = (props) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [validationSoftwareErrors, setValidationSoftwareErrors] = useState({});
  //keep track of rows that have been edited
  const [editedData, setEditedData] = useState({});
  const [editedSoftwareData, setEditedSoftwareData] = useState({});
  const [data, setData] = useState(props.user ? props.user : []);
  const [softwareData, setSoftwareData] = useState(props.software ? props.software : []);
  const [contributorOpen, setContributorOpen] = useState(false);
  const [contributor, setContributor] = useState(props.contributor ?? null);

  const roles = [ "createdBy", "contributedBy", "authoredBy", "curatedBy"];
  const softwareRoles = ["importedFrom","retrievedFrom", "createdWith"];

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 30,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        Header: ({ column }) => (
          <>{column.columnDef.header} <span style={{color: 'red'}}>*</span>
          </>),
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedData({ ...editedData, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        Header: ({ column }) => (
          <>
          {column.columnDef.header} <span style={{color: 'red'}}>*</span>
          <HelpTooltip
                title={column.columnDef.header}
                text={helpText.peopleRole.text}
                url={helpText.peopleRole.url}
                urlText="Read more..."
            />
            </>
        ),
        editVariant: 'select',
        editSelectOptions: roles,
        muiEditTextFieldProps: ({ cell, row }) => ({
          select: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !event.target.value || !validateRequired(event.target.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedData({
              ...editedData,
              [row.id]: { ...row.original, role: event.target.value },
            })
          },
          onChange: (event) => {
            const validationError = !event.target.value || !validateRequired(event.target.value)
              ? 'Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedData({
              ...editedData,
              [row.id]: { ...row.original, role: event.target.value },
            })},
        }),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'email',
          required: true,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = event.currentTarget.value.length > 0 && !validateEmail(event.currentTarget.value)
              ? 'Incorrect Email Format'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedData({ ...editedData, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'organization',
        header: 'Organization',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: false,
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateLength(event.currentTarget.value)
              ? 'Length cannot be longer than 255 characters'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedData({ ...editedData, [row.id]: row.original });
          },
        }),
      },
    ],
    [editedData, validationErrors],
  );

  const softwareColumns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Id',
        enableEditing: false,
        size: 30,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        Header: ({ column }) => (
          <>{column.columnDef.header} <span style={{color: 'red'}}>*</span>
          </>),
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: true,
          error: !!validationSoftwareErrors?.[cell.id],
          helperText: validationSoftwareErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Required'
              : undefined;
            setValidationSoftwareErrors({
              ...validationSoftwareErrors,
              [cell.id]: validationError,
            });
            setEditedSoftwareData({ ...editedSoftwareData, [row.id]: row.original });
          },
        }),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        Header: ({ column }) => (
          <>
          {column.columnDef.header} <span style={{color: 'red'}}>*</span>
          <HelpTooltip
                title={column.columnDef.header}
                text={helpText.softwareRole.text}
                url={helpText.softwareRole.url}
                urlText="Read more..."
            />
            </>
        ),
        editVariant: 'select',
        editSelectOptions: softwareRoles,
        muiEditTextFieldProps: ({ cell, row }) => ({
          select: true,
          error: !!validationSoftwareErrors?.[cell.id],
          helperText: validationSoftwareErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !event.target.value || !validateRequired(event.target.value)
              ? 'Required'
              : undefined;
            setValidationSoftwareErrors({
              ...validationSoftwareErrors,
              [cell.id]: validationError,
            });
            setEditedSoftwareData({
              ...editedSoftwareData,
              [row.id]: { ...row.original, role: event.target.value },
            })
          },
          onChange: (event) =>
            setEditedSoftwareData({
              ...editedSoftwareData,
              [row.id]: { ...row.original, role: event.target.value },
            }),
        }),
      },
      {
        accessorKey: 'url',
        header: 'URL',
        muiEditTextFieldProps: ({ cell, row }) => ({
          type: 'text',
          required: false,
          error: !!validationSoftwareErrors?.[cell.id],
          helperText: validationSoftwareErrors?.[cell.id],
          //store edited user in state to be saved later
          onBlur: (event) => {
            const validationError = !validateUrl(event.currentTarget.value)
              ? 'Invalid URL'
              : undefined;
            setValidationSoftwareErrors({
              ...validationSoftwareErrors,
              [cell.id]: validationError,
            });
            setEditedSoftwareData({ ...editedSoftwareData, [row.id]: row.original });
          },
        }),
      },
    ],
    [editedSoftwareData, validationSoftwareErrors],
  );

 
  const handleOpen = () => {
    setContributorOpen(true);
  };

  const handleClose = (event, reason) => {
      if (reason && reason === "backdropClick")
          return;
      setTextAlertInput({"show": false, id: ""});
      setContributorOpen(false);
  };

  //CREATE action
  const handleCreateRow = async ({ values, table }) => {
    const newValidationErrors = validateRow(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    values["id"] = peopleId++;
    setValidationErrors({});
    const nextData = [...data, values];
    setData(nextData);
   // await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //CREATE action
  const handleCreateSoftwareRow = async ({ values, table }) => {
    const newValidationErrors = validateSoftwareRow(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationSoftwareErrors(newValidationErrors);
      return;
    }
    values["id"] = softwareId++;
    setValidationSoftwareErrors({});
    const nextData = [...softwareData, values];
    setSoftwareData(nextData);
   // await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  const deleteRow = (row) => {
    // remove row from data and editedData
    // find the index of the row in data and remove from data
    const index = data.findIndex ((element) => element.id === row.id);
    const nextData = [...data];
    nextData.splice (index, 1);
    setData(nextData);
  }

  const deleteSoftwareRow = (row) => {
    // remove row from data and editedData
    // find the index of the row in data and remove from data
    const index = softwareData.findIndex ((element) => element.id === row.id);
    const nextData = [...softwareData];
    nextData.splice (index, 1);
    setSoftwareData(nextData);
  }

  //UPDATE action
  const handleSaveData = async () => {
    setTextAlertInput({"show": false, id: ""});
    if (Object.values(validationErrors).some((error) => !!error)) return;
    if (Object.values(validationSoftwareErrors).some((error) => !!error)) return;

    if (table.getState().creatingRow || softwareTable.getState().creatingRow) {
      setTextAlertInput ({"show": true, "message": "You have unsaved changes. Save or Cancel them before saving the contributor information"});
      return;
    }
    handleContributorChange (data, softwareData);
    setEditedData({});
    setEditedSoftwareData({})
  };

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
    data: data,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'cell', // ('modal', 'row', 'cell', and 'custom' are also
    enableEditing: (row) => (row.id !== 1),
    enableRowActions: true,
    positionActionsColumn: 'last',
    positionCreatingRow: 'bottom',
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: '200px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateRow,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => deleteRow(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      {/**  <Button
          color="success"
          variant="contained"
          onClick={handleSaveData}
          disabled={
            Object.keys(editedData).length === 0 ||
            Object.values(validationErrors).some((error) => !!error)
          }
        >
          Save
        </Button> **/}
        {Object.values(validationErrors).some((error) => !!error) && (
          <Typography color="error">Fix errors before submitting</Typography>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Add Person
      </Button>
    ),
  });

  const softwareTable = useMaterialReactTable({
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
    columns: softwareColumns,
    data: softwareData,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also
    enableEditing: (row) => (row.id !== 1),
    enableRowActions: true,
    positionActionsColumn: 'last',
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: {
        minHeight: '200px',
      },
    },
    onCreatingRowCancel: () => setValidationSoftwareErrors({}),
    onCreatingRowSave: handleCreateSoftwareRow,
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Delete">
          <IconButton disabled={row.id === 1} color="error" onClick={() => deleteSoftwareRow(row)}>
            <DeleteIcon/>
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
       {/** <Button
          color="success"
          variant="contained"
          onClick={handleSaveSoftwareData}
          disabled={
            Object.keys(editedSoftwareData).length === 0 ||
            Object.values(validationSoftwareErrors).some((error) => !!error)
          }
        >
          Save
        </Button> **/}
        {Object.values(validationSoftwareErrors).some((error) => !!error) && (
          <Typography color="error">Fix errors before submitting</Typography>
        )}
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Add Software
      </Button>
    ),
  });

const validateRequired = (value) => !!value.length;
const validateLength = (value) => value.length < 255;
const validateEmail = (email) =>
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

const validateUrl = (url) => {
  let valid = isValidURL(url);
  return valid;
}

function validateRow(row) {
  return {
    name: !validateRequired(row.name)
      ? 'Name is Required'
      : undefined,
    role: !validateRequired(row.role) 
      ? 'Role is required'
      : undefined, 
    email: row.email && row.email.length > 0 && !validateEmail(row.email) ? 'Incorrect Email Format' : undefined,
    organization: !validateLength (row.organization) ? "Length cannot be longer than 255 characters." : undefined,
  };
}

function validateSoftwareRow(row) {
  return {
    name: !validateRequired(row.name)
      ? 'Name is Required'
      : undefined,
    role: !validateRequired(row.role) 
      ? 'Role is required'
      : undefined, 
    url: !validateUrl (row.url) ? "Invalid URL" : undefined,
  };
}

const getContributorForm = () => {
  return (
  <>
  <Card>
      <Card.Header>People</Card.Header>
      <Card.Body>
          <MaterialReactTable table={table} />
      </Card.Body>
  </Card>
  <Card>
      <Card.Header>Software</Card.Header>
      <Card.Body>
          <MaterialReactTable table={softwareTable} />
      </Card.Body>
  </Card>
  </>);
}

const handleContributorChange = (values, softwareValues) => {
  var contrib= "";
  values && values.map ((value) => {
    if (contrib.length != 0) { // not the first one
      contrib += "|";
    }
    contrib += value.role + ":" + value.name.trim();
    contrib += value.email || value.organization ? " (" : "";
    contrib += value.email ? value.email: "";
    contrib += value.organization ? (value.email ? ", " + value.organization : value.organization) : "";
    contrib += value.email || value.organization ? ")" : "";
  });
  softwareValues && softwareValues.map ((value) => {
    if (contrib.length != 0) { // not the first one
      contrib += "|";
    }
    contrib += value.role + ":" + value.name;
    contrib += value.url ? " (" + value.url + ")" : "";
  });

  setContributor(contrib);
  props.setContributor && props.setContributor(contrib);
  setContributorOpen(false);
}

return (
  <React.Fragment>
    <TextField 
         style={{marginRight:"10px", width: '80%'}} 
         onClick={handleOpen} 
         inputProps={{ readOnly: true }}
         error={props.error} 
         helperText={props.validationMessage}
         value={contributor} variant="outlined"/>
    <Button className="gg-btn-blue-reg mt-2" onClick={handleOpen}>Edit</Button>
    <Dialog
      maxWidth="lg"
      fullWidth="true"
      open={contributorOpen}
      onClose={handleClose}
      aria-labelledby="child-modal-title"
      aria-describedby="child-modal-description"
    >
        <DialogTitle>Add a Contributor</DialogTitle>
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
            >
        <CloseIcon />
        </IconButton>
        <TextAlert alertInput={textAlertInput}/>
        <DialogContent dividers>{getContributorForm()}</DialogContent>
        <DialogActions>
            <Button className="gg-btn-outline-reg" onClick={handleClose}>Cancel</Button>
            <Button className="gg-btn-blue-reg" onClick={handleSaveData}>SAVE</Button>
        </DialogActions>
    </Dialog>
  </React.Fragment>
);
}


export default ContributorTable;

