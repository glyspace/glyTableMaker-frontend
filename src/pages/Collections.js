import { useEffect, useMemo, useReducer, useState } from "react";
import { getJson, getAuthorizationHeader, deleteJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, Container, IconButton, Tooltip } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Collections = (props) => {
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
  const [sorting, setSorting] = useState([{"id":"name","desc":true}]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

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

    getJson ("api/data/getcollections?" + searchParams, getAuthorizationHeader()).then ( (json) => {
      setData(json.data.data.collections);
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
          axiosError(error, null, setAlertDialogInput);
          return;
      }
    });
    
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(props.authCheckAgent, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', 
        header: 'Name',
        size: 50,
      },
      {
        accessorKey: 'glycans.length',
        header: '# Glycans',
        size: 30,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.metadata ? row.metadata.length : 0,
        header: '# Metadata Columns',
        id: 'metadata',
        size: 30,
        enableColumnFilter: false,
      },
    ],
    [],
  );

  const openDeleteConfirmModal = (row) => {
    setSelectedId(row.original.collectionId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedId !== -1) {
      deleteCollection(selectedId);
    }
  }

  const deleteCollection = (id) => {
    setIsLoading(true);
    setIsError(false);
    props.authCheckAgent();

    deleteJson ("api/data/deletecollection/" + id, getAuthorizationHeader()).then ( (data) => {
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
            axiosError(error, null, setAlertDialogInput);
        }
      }
    );
  }
  
  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
        <IconButton onClick={() => navigate(stringConstants.routes.addcollection + "?collectionId=" + row.original.collectionId)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderDetailPanel: ({ row }) =>
        row.original.description ? <div><span>{row.original.description}</span> </div> : null,
    getRowId: (row) => row.collectionId,
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
    <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
              title="Your Collections"
              subTitle="The table below displays a list of all collections that have been created. New collections may be added, old collectionns can be edited, and unused collections can
              be removed."
          />
          <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
          <ConfirmationModal
            showModal={showDeleteModal}
            onCancel={() => setShowDeleteModal(false)}
            onConfirm={confirmDelete}
            title="Confirm Delete"
            body="Are you sure you want to delete?"
          />
              
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.addcollection)}>
                Add Collection
                </Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" >
                Add Metadata
                </Button>
              </div>
              <MaterialReactTable table={table} />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default Collections;