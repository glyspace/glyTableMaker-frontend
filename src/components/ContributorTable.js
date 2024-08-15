import React, { useMemo, useState } from 'react';
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
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Card } from 'react-bootstrap';
import HelpTooltip from './HelpTooltip';
import helpText from '../data/helpText.json';

let peopleId = 2;
let softwareId = 2;

const ContributorTable = (props) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [validationSoftwareErrors, setValidationSoftwareErrors] = useState({});
  //keep track of rows that have been edited
  const [editedData, setEditedData] = useState({});
  const [editedSoftwareData, setEditedSoftwareData] = useState({});
  const [data, setData] = useState(props.user ? [props.user] : []);
  const [softwareData, setSoftwareData] = useState(props.software ? [props.software] : []);
  const [contributorOpen, setContributorOpen] = React.useState(false);

  const roles = [ "createdBy", "contributedBy", "authoredBy", "curatedBy"];
  const softwareRoles = ["importedFrom","retrievedFrom", "createdWith"];

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
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          error: !!validationErrors?.role,
          helperText: validationErrors?.role,
          onChange: (event) =>
            setEditedData({
              ...editedData,
              [row.id]: { ...row.original, role: event.target.value },
            }),
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
            const validationError = !validateEmail(event.currentTarget.value)
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
          //store edited user in state to be saved later
          onBlur: (event) => {
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
          error: !!validationErrors?.[cell.id],
          helperText: validationErrors?.[cell.id],
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
        muiEditTextFieldProps: ({ row }) => ({
          select: true,
          error: !!validationErrors?.role,
          helperText: validationErrors?.role,
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
          //store edited user in state to be saved later
          onBlur: (event) => {
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
    const newValidationErrors = validateRow(values);
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
    if (Object.values(validationErrors).some((error) => !!error)) return;
    if (Object.values(validationSoftwareErrors).some((error) => !!error)) return;
    handleContributorChange (data, softwareData);
    setEditedData({});
    setEditedSoftwareData({})
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
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
          <IconButton disabled={row.id === 1} color="error" onClick={() => deleteRow(row)}>
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
    columns: softwareColumns,
    data: softwareData,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'table', // ('modal', 'row', 'cell', and 'custom' are also
    enableEditing: true,
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
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateRow(row) {
  return {
    name: !validateRequired(row.name)
      ? 'Name is Required'
      : '',
    role: !validateRequired(row.role) 
      ? 'Role is required'
      : '', 
    email: row.email && !validateEmail(row.email) ? 'Incorrect Email Format' : '',
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
  var contributor= "";
  values && values.map ((value) => {
    if (contributor.length != 0) { // not the first one
      contributor += "|";
    }
    contributor += value.role + ":" + value.name;
    contributor += value.email || value.organization ? " (" : "";
    contributor += value.email ? value.email: "";
    contributor += value.organization ? (value.email ? ", " + value.organization : value.organization) : "";
    contributor += value.email || value.organization ? " )" : "";
  });
  softwareValues && softwareValues.map ((value) => {
    if (contributor.length != 0) { // not the first one
      contributor += "|";
    }
    contributor += value.role + ":" + value.name;
    contributor += value.url ? " (" + value.url + ")" : "";
  });

  props.setContributor && props.setContributor(contributor);
  setContributorOpen(false);
}

return (
  <React.Fragment>
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
        <DialogContent dividers>{getContributorForm()}</DialogContent>
        <DialogActions>
            <Button className="gg-btn-outline-reg" onClick={handleClose}>Cancel</Button>
            <Button className="gg-btn-blue-reg" onClick={handleSaveData}>OK</Button>
        </DialogActions>
    </Dialog>
  </React.Fragment>
);
}


export default ContributorTable;

