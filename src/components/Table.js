import { useEffect, useState } from "react";
import { deleteJson, getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ConfirmationModal } from "./ConfirmationModal";
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from "prop-types";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";

// server side table
const Table = (props) => {
    //data and fetching state
    const [data, setData] = useState([]);
    const [isError, setIsError] = useState(false);
    const [isDeleteError, setIsDeleteError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedId, setSelectedId] = useState(-1);
    //table state
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([{"id":props.initialSortColumn,"desc":true}]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [rowSelection, setRowSelection] = useState(props.selected ? props.selected : {});

    let navigate = useNavigate();

    const fetchData = async () => {
        if (!data.length) {
          setIsLoading(true);
        } else {
          setIsRefetching(true);
        }
    
        let searchParams = "start=" + pagination.pageIndex;
        searchParams += "&size=" + pagination.pageSize;
        searchParams += "&filters=" + encodeURI(JSON.stringify(columnFilters ?? []));
        searchParams += "&globalFilter=" + globalFilter ?? '';
        searchParams += '&sorting=' + encodeURI(JSON.stringify(sorting ?? []));
    
        getJson (props.ws + "?" + searchParams, getAuthorizationHeader()).then ( (json) => {
          setData(json.data.data.objects);
          setRowCount(json.data.data.totalItems);
          setIsError(false);
          setIsLoading(false);
          setIsRefetching(false);
        }).catch (function(error) {
          if (error && error.response && error.response.data) {
              setIsError(true);
              setIsLoading(false);
              setIsRefetching(false);
              return;
          } else {
              setIsRefetching(false);
              setIsLoading(false);
              axiosError(error, null, props.setAlertDialogInput);
              return;
          }
        });
      };
    
      useEffect(() => {
        if (!props.data) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [
        columnFilters,
        globalFilter,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
      ]);

      const openDeleteConfirmModal = (row) => {
        setSelectedId(row.original.glycanId);
        setShowDeleteModal(true);
      };

      const confirmDelete = () => {
        if (selectedId !== -1) {
          deleteRow(selectedId);
        }
      }
    
      const deleteRow = (id) => {
        setIsLoading(true);
        setIsError(false);
        props.authCheckAgent();
    
        deleteJson (props.deletews + id, getAuthorizationHeader()).then ( (data) => {
            setIsLoading(false);
            setIsError(false);
            setIsDeleteError(false);
            setShowDeleteModal(false);
            fetchData();
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setIsError(true);
                setIsDeleteError(true);
                setIsLoading(false);
                return;
            } else {
                setIsLoading(false);
                axiosError(error, null, props.setAlertDialogInput);
            }
          }
        );
      }

      const columns = props.columns;

      useEffect(() => {
        if(props.rowSelectionChange) {
            console.info({ rowSelection }); //read your managed row selection state
            let selected = [];
            for (const rowId in rowSelection) {
                if (rowSelection[rowId]) { // selected
                    var found = data.filter(function(item) { 
                        if (typeof item[props.rowId] === "number") {
                            return item[props.rowId].toString() === rowId;
                        } else
                            return item[props.rowId] === rowId; 
                    });
                    found && found.length > 0 && selected.push (found[0]);
                }
            };
            props.rowSelectionChange (selected);
        }
        // console.info(table.getState().rowSelection); //alternate way to get the row selection state
      }, [rowSelection]);

      /*const handleSelection = (updater) => {
        setRowSelection ((prev) =>
            updater (prev));
        const rows = table.getState().rowSelection;
        let selected = [];
        for (const rowId in rows) {
            if (rows[rowId]) { // selected
                var found = data.filter(function(item) { return item[props.rowId] === rowId; });
                found && found.length > 0 && selected.push (found[0]);
            }
        };
        props.rowSelectionChange (selected);
      }*/

      const table = useMaterialReactTable({
        columns,
        data : props.data ? props.data : data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableRowActions: props.enableRowActions,
        enableRowSelection: props.rowSelection,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {props.showEdit && (<Tooltip title="Edit">
              <IconButton onClick={() => navigate(props.editws + row.original[props.rowId])}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
          </Box>
        ),
        getRowId: (row) => row[props.rowId],
        manualFiltering: props.data ? false: true,
        manualPagination: props.data ? false: true,
        manualSorting: props.data ? false: true,
        initialState: {
            showColumnFilters: false,
        },
        muiToolbarAlertBannerProps: isError
          ? {
              color: 'error',
              children: isDeleteError ? 'Error deleting' : 'Error loading data',
            }
          : undefined,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        rowCount,
        state: {
          columnFilters,
          globalFilter,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting,
          rowSelection,
        },
      });

      const tableDetail = useMaterialReactTable({
        columns,
        data: props.data ? props.data : data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableRowActions: props.enableRowActions,
        enableRowSelection: props.rowSelection,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {props.showEdit && (<Tooltip title="Edit">
              <IconButton onClick={() => navigate(props.editws + row.original[props.rowId])}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
          </Box>
        ),
        renderDetailPanel: ({ row }) =>
            row.original.description ? <div><span>{row.original.description}</span> </div> : null,
        getRowId: (row) => row[props.rowId],
        initialState: {
            showColumnFilters: false,
        },
        manualFiltering: props.data ? false: true,
        manualPagination: props.data ? false: true,
        manualSorting: props.data ? false: true,
        muiToolbarAlertBannerProps: isError
          ? {
              color: 'error',
              children: isDeleteError ? 'Error deleting' : 'Error loading data',
            }
          : undefined,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        rowCount,
        state: {
          columnFilters,
          globalFilter,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting,
          rowSelection,
        },
      });

    return (
    <>
        <ConfirmationModal
            showModal={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Confirm Delete"
            body="Are you sure you want to delete?"
        />

        <MaterialReactTable table={props.detailPanel ? tableDetail: table} />
    </>
    );
}

Table.propTypes = {
    authCheckAgent: PropTypes.func,  // required, token check
    setAlertDialogInput: PropTypes.func,   // required, error dialog 
    data: PropTypes.array,  // optional, if data is not retrieved from the web service
    columns: PropTypes.array,  // required, columns to show
    enableRowActions: PropTypes.bool,  // whether to show actions column (with delete action by default)
    ws: PropTypes.string,  // get api
    deletews: PropTypes.string,   // delete api
    editws: PropTypes.string,   // edit api
    showEdit: PropTypes.bool,   // whether to add edit icon to actions
    initialSortColumn: PropTypes.string,   // required, name of the column to sort initially
    rowSelection: PropTypes.bool,  // whether to show row selection checkboxes
    setSelectedRows: PropTypes.func,
    rowId: PropTypes.string, // required, which field to use as the row identifier
    selected: PropTypes.array // optional, already selected rows
  };

export default Table;