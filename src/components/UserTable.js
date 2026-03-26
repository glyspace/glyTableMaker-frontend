import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import RestorePageIcon from '@mui/icons-material/RestorePage';
import { useEffect } from "react";
import PropTypes from "prop-types";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';

const UserTable = props => {

    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        props.data,
    ]);

    const recover = (id) => {
        props.recover && props.recover(id);
    }

    const deleteRow = (id) => {
        // only remove from the data
        props.delete && props.delete(id);            
    }

    const columns = props.columns;

    const clientTable = useMaterialReactTable({
        columns,
        data: props.data ? props.data : [], //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableRowActions: props.enableRowActions,
        positionActionsColumn: 'last',
        globalFilterFn: 'contains',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            {(row.original.retracted === true || row.original.enabled === false || row.original.removed === true) && (props.recoverws || props.recover) ? 
            <Tooltip title={props.recoverLabel ?? "Recover"}>
                  <IconButton
                        aria-label={props.recoverLabel ?? "Recover"}
                        onClick={(e) =>  {
                            recover(row.original[props.rowId], e);
                        }}
                        >
                    <RestorePageIcon />
                </IconButton>
            </Tooltip>
            : <Tooltip title={props.deletelabel ?? "Delete"}>
              <IconButton color="error" 
                 aria-label={props.deletelabel ?? "Delete"} 
                 onClick={() => deleteRow(row.original[props.rowId])}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            }
            { row.original.role === "ADMIN" && props.demote && 
            <Tooltip title="Remove admin priviledges">
                  <IconButton
                        aria-label="Demote to regular user"
                        onClick={(e) => props.demote(row.original[props.rowId])  
                        }>
                    <PersonIcon />
                </IconButton>
            </Tooltip>
            }
            { row.original.role !== "ADMIN" && props.promote && 
            <Tooltip title="Make Admin">
                  <IconButton
                        aria-label="Promote to admin"
                        onClick={(e) => props.promote(row.original[props.rowId])  
                        }>
                    <ManageAccountsIcon />
                </IconButton>
            </Tooltip>
            }
          </Box>
        ),
        getRowId: (row) => row[props.rowId],
        initialState: {
            showColumnFilters: false,
        },
      });

      return (
        <>
            <MaterialReactTable table={clientTable} />
        </>
    );
}

UserTable.propTypes = {
    authCheckAgent: PropTypes.func,  // required, token check
    setAlertDialogInput: PropTypes.func,   // required, error dialog 
    data: PropTypes.array,  // optional, if data is not retrieved from the web service
    columns: PropTypes.array,  // required, columns to show
    enableRowActions: PropTypes.bool,  // whether to show actions column (with delete action by default)
    delete: PropTypes.func, // disable users
    recover: PropTypes.func, // enable users
    promote: PropTypes.func, // make selected user admin
    demote: PropTypes.func,  // remove admin priviledges
    rowId: PropTypes.string, // required, which field to use as the row identifier
};

export {UserTable};
