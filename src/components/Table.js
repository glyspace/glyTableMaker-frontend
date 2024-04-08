import { useEffect, useState } from "react";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, IconButton, Tooltip } from "@mui/material";
import { ConfirmationModal } from "./ConfirmationModal";
import DeleteIcon from '@mui/icons-material/Delete';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import PropTypes from "prop-types";
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from "react-router-dom";
import { Row } from "react-bootstrap";
import TagEdit from "./TagEdit";

// server side table
const Table = (props) => {
    //data and fetching state
    const [data, setData] = useState([]);
    const [isError, setIsError] = useState(false);
    const [isDeleteError, setIsDeleteError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [enableTagDialog, setEnableTagDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(-1);
    const [tags, setTags] = useState("");
    const [validate, setValidate] = useState(false);
    //table state
    const [columnFilters, setColumnFilters] = useState(props.columnFilters ?? []);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState([{"id":props.initialSortColumn,"desc":true}]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [rowSelection, setRowSelection] = useState(props.selected ?? {});
    const [selectedData, setSelectedData] = useState(props.selectedRows ?? []);
    

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
              setErrorMessage(error.response.data.message);
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
        if (props.ws) {
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
        setSelectedId(row.original[props.rowId]);
        setShowDeleteModal(true);
      };

      const openAddTagModal = (row) => {
        setSelectedId(row.original[props.rowId]);
        setTags(row.original.tags.map(tag => tag.label));
        setEnableTagDialog(true);
      };

      const updateTags = (tags) => {
        setTags(tags);
        var row = data.find(item => 
          item[props.rowId] === selectedId);
        if (row) {
          let tagJson = [];
          tags.map ((tag) => {
            var json = {
              "label": tag
            };
            tagJson.push(json);
          })
          row["tags"] = tagJson;
        }
      }

      const confirmDelete = () => {
        if (selectedId !== -1) {
          deleteRow(selectedId);
        }
      }
    
      const deleteRow = (id) => {
        if (props.deletews) {
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
                    setErrorMessage(error.response.data.message);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    axiosError(error, null, props.setAlertDialogInput);
                }
                setShowDeleteModal(false);
            }
            );
        } else {
            // only remove from the data
            props.delete && props.delete(id);
            setShowDeleteModal(false);

        }
      }

      const handleAddTag = () => {
        if (props.addtagws) {
          props.authCheckAgent();
          /*setValidate(false);
          if (tags.length < 1) {
            setValidate(true);
            return;
          }*/
          postJson (props.addtagws + selectedId, tags, getAuthorizationHeader()).then ( (data) => {
            setEnableTagDialog(false);
            fetchData();
          }).catch (function(error) {
              axiosError(error, null, props.setAlertDialogInput);
              setEnableTagDialog(false);
            }
          );
        }
      }

      const columns = props.columns;

      useEffect(() => {
        if(props.rowSelectionChange && data && data.length) {
            console.info( rowSelection ); //read your managed row selection state
            let selected = [...selectedData];
            for (const rowId in rowSelection) {
                if (rowSelection[rowId]) { // selected
                    // check if it already exists in selected
                    var exists = selected.find (item => 
                        typeof item[props.rowId] === "number" ? 
                        item[props.rowId].toString() === rowId
                        : item[props.rowId] === rowId);
                    if (!exists) {
                        var found = data.find(item => 
                            typeof item[props.rowId] === "number" ? 
                            item[props.rowId].toString() === rowId
                            : item[props.rowId] === rowId);
                        found && selected.push (found);
                    }
                } 
            };
            // remove from selected if it is not in rowSelection anymore
            selected.map ((row, index) => {
                // if it does not exist in selected, remove it
                var found = typeof row[props.rowId] === "number" ? 
                    rowSelection[row[props.rowId].toString()] 
                    : rowSelection[row[props.rowId]];
                if (!found) {
                    selected.splice (index, 1);
                }
            });
            setSelectedData(selected);
            props.rowSelectionChange (selected);
        }
      }, [rowSelection]);

      const table = useMaterialReactTable({
        columns,
        data : props.data ? props.data : data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
        enableRowActions: props.enableRowActions,
        enableRowSelection: props.rowSelection,
        positionActionsColumn: 'last',
        renderRowActions: ({ row }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Delete">
              <IconButton color="error" onClick={() => props.deletews ? openDeleteConfirmModal(row)
              : deleteRow(row.original[props.rowId])}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {props.showEdit && (<Tooltip title="Edit">
              <IconButton onClick={() => navigate(props.edit + row.original[props.rowId])}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
            {props.addtagws && (
              <Tooltip title="View/Add/Delete Tag">
              <IconButton color="primary">
                <NoteAddIcon
                onClick={() => { openAddTagModal (row);
                }}/>
              </IconButton>
            </Tooltip>
            )}
          </Box>
        ),
        getRowId: (row) => row[props.rowId],
        manualFiltering: props.data ? false: true,
        manualPagination: props.data ? false: true,
        manualSorting: props.data ? false: true,
        initialState: {
            showColumnFilters: false,
            columnVisibility: { tags: false }
        },
        muiToolbarAlertBannerProps: isError
          ? {
              color: 'error',
              children: isDeleteError ? 
                <div>
                  <Row>Error deleting</Row>
                  <Row>{errorMessage}</Row>
                </div> : 
                <div>
                <Row>Error loading data</Row>
                <Row>{errorMessage}</Row>
              </div>,
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
              <IconButton color="error" onClick={() => props.deletews ? openDeleteConfirmModal(row)
              : deleteRow(row.original[props.rowId])}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            {props.showEdit && (<Tooltip title="Edit">
              <IconButton onClick={() => navigate(props.edit + row.original[props.rowId])}>
                <EditIcon />
              </IconButton>
            </Tooltip>)}
            {props.addtagws && (
              <Tooltip title="Add Tag">
              <IconButton color="primary">
                <NoteAddIcon
                onClick={() => { openAddTagModal (row);
                }}/>
              </IconButton>
            </Tooltip>
            )}
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
              children: isDeleteError ? 
                <div>
                  <Row>Error deleting</Row>
                  <Row>{errorMessage}</Row>
                </div> : 
                <div>
                <Row>Error loading data</Row>
                <Row>{errorMessage}</Row>
              </div>,
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

        <ConfirmationModal
          showModal={enableTagDialog}
          onCancel={() => {
            setEnableTagDialog(false);
          }}
          onConfirm={() => handleAddTag()}
          title="Tag"
          body={
            <>
              <TagEdit validate={validate} setValidate={setValidate}
                setTags={updateTags}
                setAlertDialogInput={props.setAlertDialogInput}
                gettagws={props.gettagws}
                data={tags}
              />
            </>
          }
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
    delete: PropTypes.func, // delete function for client side tables
    edit: PropTypes.string,   // edit page
    showEdit: PropTypes.bool,   // whether to add edit icon to actions
    initialSortColumn: PropTypes.string,   // required, name of the column to sort initially
    rowSelection: PropTypes.bool,  // whether to show row selection checkboxes
    setSelectedRows: PropTypes.func,
    rowId: PropTypes.string, // required, which field to use as the row identifier
    selected: PropTypes.object, // optional, already selected row id map
    selectedRows: PropTypes.array, // optional, already selected rows
    columnFilters: PropTypes.array, //optional, initial column filters on the table
    addtagws: PropTypes.string,  //optional, addtag api
    gettagws: PropTypes.string, // optional, gettag api
  };

export default Table;