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
        if (!props.data)
            fetchData();
        else 
            setData(props.data);
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

      const table = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
              <IconButton onClick={() => navigate(props.editws + row.original.collectionId)}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
          </Box>
        ),
        getRowId: (row) => row.glycanId,
        initialState: {showColumnFilters: false},
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
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
        rowCount,
        state: {
          columnFilters,
          globalFilter,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting,
        },
      });

      const tableDetail = useMaterialReactTable({
        columns,
        data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
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
              <IconButton onClick={() => navigate(props.editws + row.original.collectionId)}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
          </Box>
        ),
        renderDetailPanel: ({ row }) =>
            row.original.description ? <div><span>{row.original.description}</span> </div> : null,
        getRowId: (row) => row.glycanId,
        initialState: {showColumnFilters: false},
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
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
        rowCount,
        state: {
          columnFilters,
          globalFilter,
          isLoading,
          pagination,
          showAlertBanner: isError,
          showProgressBars: isRefetching,
          sorting,
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

        <MaterialReactTable table={props.detailPanel ? tableDetail: table}/>
    </>
    );
}

Table.propTypes = {
    authCheckAgent: PropTypes.func,
    setAlertDialogInput: PropTypes.func,
    data: PropTypes.array,
    columns: PropTypes.array,
    enableRowActions: PropTypes.bool,
    ws: PropTypes.string,
    deletews: PropTypes.string,
    editws: PropTypes.string,
    showEdit: PropTypes.bool,
    initialSortColumn: PropTypes.string,
    rowSelection: PropTypes.bool
  };

export default Table;