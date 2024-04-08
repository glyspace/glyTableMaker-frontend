import { useMemo, useEffect, useState, useReducer } from 'react';
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
import InfoIcon from '@mui/icons-material/Info';
import stringConstants from '../data/stringConstants.json';
import DialogAlert from '../components/DialogAlert';
import { StatusMessage } from '../components/StatusMessage';
import Table from '../components/Table';

const Glycans = (props) => {
  const [infoError, setInfoError] = useState("");
  const [glytoucanHash, setGlytoucanHash] = useState("");
  const [date, setDate] = useState("");
  const [showInfoModal, setShowInfoModal] = useState(false);

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [batchUpload, setBatchUpload] = useState(false);

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
      {
        accessorFn: (row) => row.tags.map(tag => tag.label),
        header: 'Tags',
        id: "tags",
        size: 50,
        Cell: ({ cell }) => (
          <ul id="tags">
                {cell.getValue() && cell.getValue().length > 0 && cell.getValue().map((tag, index) => (
                <li key={index} className="tag">
                    <span className='tag-title'>{tag}</span>
                </li>
                ))}
            </ul>
        ),
      },
    ],
    [],
  );

  const writeTags = (tags) => {
    var tagString = "";
    if (tags && tags.size > 0) {

    }
  }

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
                <StatusMessage
                  setBatchUpload={setBatchUpload}
                  setAlertDialogInput={setAlertDialogInput}/>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getglycans"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  deletews="api/data/deleteglycan/"
                  addtagws="api/data/addglycantag/"
                  gettagws="api/data/getglycantags"
                  initialSortColumn="dateCreated"
                  rowId="glycanId"
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default Glycans;