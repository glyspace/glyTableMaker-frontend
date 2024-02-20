import { useMemo, useEffect, useState, useReducer } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import Container from "@mui/material/Container";
import { Card, Modal } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Link } from "react-router-dom";
import { NavDropdown, Nav } from "react-bootstrap";
import {
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import stringConstants from '../data/stringConstants.json';
import { deleteJson, getAuthorizationHeader, getJson } from '../utils/api';
import { axiosError } from '../utils/axiosError';
import DialogAlert from '../components/DialogAlert';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { StatusMessage } from '../components/StatusMessage';

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
  const [infoError, setInfoError] = useState("");
  const [glytoucanHash, setGlytoucanHash] = useState("");
  const [date, setDate] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  const [batchUpload, setBatchUpload] = useState(false);

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

    getJson ("api/data/getglycans?" + searchParams, getAuthorizationHeader()).then ( (json) => {
      setData(json.data.data.glycans);
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
        accessorKey: 'glytoucanID', 
        header: 'GlyTouCan ID',
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        enableColumnFilter: false,
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
        size: 80,
        Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
      },
      {
        accessorKey: 'glycanCollections.length',
        header: '# Collections',
        size: 30,
        enableColumnFilter: false,
      },
      {
        id: 'information',
        header: 'Information',
        size: 150,
        columnDefType: 'display',
        Cell: ({ row }) => (
          (row.original.glytoucanHash || row.original.error) &&

          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Information">
              <IconButton onClick={() => {
                  setGlytoucanHash(row.original.glytoucanHash);
                  setDate(row.original.dateCreated);
                  setInfoError(row.original.error);
                  setShowInfoModal(true);}}>
                <InfoIcon style={{ color: '#2f78b7' }}/>
              </IconButton>
            </Tooltip>
          </Box>
        ),
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

    deleteJson ("api/data/deleteglycan/" + id, getAuthorizationHeader()).then ( (data) => {
        setIsLoading(false);
        setIsError(false);
        setIsDeleteError(false);
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
          <Modal
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            show={showInfoModal}
            onHide={() => setShowInfoModal(false)}
          >
            <Modal.Header closeButton className= "alert-dialog-title">
              <Modal.Title id="contained-modal-title-vcenter" >
                Glytoucan Registration Information
              </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>{infoError ? 
              "Glycan is submitted to Glytoucan on " + date + 
              ". Registration failed with the following error: " + infoError : glytoucanHash ? 
              "Glycan is submitted to Glytoucan on " + date + 
              ". Glytoucan assigned temporary hash value: " + glytoucanHash : ""} </Modal.Body>
            <Modal.Footer></Modal.Footer>
          </Modal>  
              
          <Card>
            <Card.Body>
              <StatusMessage
                setBatchUpload={setBatchUpload}
                setAlertDialogInput={setAlertDialogInput}
              />
              <div className="text-center mb-4">
              <Nav className={ "gg-dropdown-nav"} style={{display:"inline-block", borderRadius:".5rem"}} >
                  <div
                    type="button"
                    className="gg-btn-blue-sm gg-dropdown-btn"
                    style={{
                      marginLeft: "10px"
                    }}>
                      <span style={{display:"inline-block"}}>
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

                <Nav className={ "gg-dropdown-nav"} 
                  style={{display:"inline-block", borderRadius:".5rem"}} 
                  disabled={batchUpload}>
                  <div
                    type="button"
                    className="gg-btn-blue-sm gg-dropdown-btn"
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
                          <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycanfromfile}?type=gws`}>
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