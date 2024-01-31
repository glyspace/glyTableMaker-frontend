import { useMemo, useEffect, useState, useReducer } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import Container from "@mui/material/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Link } from "react-router-dom";
import { NavDropdown, Nav } from "react-bootstrap";
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import stringConstants from '../data/stringConstants.json';
import { deleteJson, getAuthorizationHeader, getJson } from '../utils/api';
import { axiosError } from '../utils/axiosError';
import DialogAlert from '../components/DialogAlert';
import { ConfirmationModal } from '../components/ConfirmationModal';

const Glycans = (props) => {

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
  const [sorting, setSorting] = useState([{"id":"dateCreated","desc":true}]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const fetchData = async () => {
    if (!data.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    let searchParams = "start=" + pagination.pageIndex * pagination.pageSize;
    searchParams += "&size=" + pagination.pageSize;
    searchParams += "&filters=" + encodeURI(JSON.stringify(columnFilters ?? []));
    searchParams += "&globalFilter=" + globalFilter ?? '';
    searchParams += '&sorting=' + encodeURI(JSON.stringify(sorting ?? []));

    getJson ("api/data/getglycans?" + searchParams, getAuthorizationHeader()).then ( (json) => {
      setData(json.data.data.glycans);
      setRowCount(json.data.data.totalItems);
    }).catch (function(error) {
      if (error && error.response && error.response.data) {
          setIsError(true);
          return;
      } else {
          axiosError(error, null, setAlertDialogInput);
          return;
      }
    });
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
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

  useEffect(props.authCheckAgent, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'glytoucanID', 
        header: 'GlyTouCan ID',
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
      },
      {
        accessorKey: 'cartoon',
        header: 'Image',
        size: 150,
        columnDefType: 'display',
        Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
      },
      {
        accessorKey: 'mass', 
        header: 'Mass',
        size: 100,
      },
      {
        accessorKey: 'glycanCollections.length',
        header: '# Collections',
        size: 30,
      },
      {
        accessorKey: 'information',  //TODO make it a clickable icon to open modal dialog if there is glytoucanhash or error
        header: 'Information',
        size: 150,
        columnDefType: 'display',
      },
    ],
    [],
  );

  const openDeleteConfirmModal = (row) => {
    setSelectedId(row.original.glycanId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedId !== -1) {
      deleteGlycan(selectedId);
    }
  }

  const deleteGlycan = (id) => {
    setIsLoading(true);
    setIsError(false);
    props.authCheckAgent();

    deleteJson ("api/data/delete/" + id, getAuthorizationHeader()).then ( (data) => {
        setIsLoading(false);
        fetchData();
      }).catch (function(error) {
        if (error && error.response && error.response.data) {
            setIsError(true);
            setIsDeleteError(true);
            return;
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
      }
    );
    setIsError(false);
    setIsDeleteError(false);
    setIsLoading(false);
    setIsRefetching(false);
  }

  const toggle = () => {
    document.getElementById("gg-dropdown-navbar1").setAttribute("aria-expanded", "true");
    document.getElementById("gg-dropdown-navbar1").classList.toggle("show");
    document.querySelector('[aria-labelledby="gg-dropdown-navbar1"]').classList.toggle("show");
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

  return (
    <>
    <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
              title="Your Glycans"
              subTitle="The table below displays a list of all glycans that have been uploaded. New glycans may be added, old glycans can be edited, and unused glycans can
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
              <Nav className={ "gg-dropdown-nav"} style={{display:"inline-block", borderRadius:".5rem"}} >
                  <div
                    type="button"
                    className="gg-btn-blue gg-dropdown-btn"
                    style={{
                      marginLeft: "10px"
                    }} onClick={()=> toggle()}>
                      <span  style={{display:"inline-block"}}>
                        <NavDropdown
                          className={ "gg-dropdown-navbar gg-dropdown-navitem"}
                          style={{display:"inline-block", padding: "0px !important"}}
                          title="Add Glycan"
                          id="gg-dropdown-navbar1"
                        >
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=sequence`}>
                            Sequence
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=glytoucan`}>
                            GlyTouCan ID
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=composition`}>
                            Composition
                          </NavDropdown.Item>
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=draw`}>
                            Draw Glycan
                          </NavDropdown.Item>
                        </NavDropdown>
                      </span>
                  </div>
                </Nav>

                <Nav className={ "gg-dropdown-nav"} style={{display:"inline-block", borderRadius:".5rem"}} >
                  <div
                    type="button"
                    className="gg-btn-blue gg-dropdown-btn"
                    style={{
                      marginLeft: "10px"
                    }}>
                      <span  style={{display:"inline-block"}}>
                        <NavDropdown
                          className={ "gg-dropdown-navbar gg-dropdown-navitem"}
                          style={{display:"inline-block", padding: "0px !important"}}
                          title="Add Glycan from File"
                          id="gg-dropdown-navbar2"
                        >
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycan}?type=file`}>
                            Glycoworkbench File (.gws)
                          </NavDropdown.Item>
                        </NavDropdown>
                      </span>
                  </div>
                </Nav>
              </div>
              <MaterialReactTable table={table} />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default Glycans;