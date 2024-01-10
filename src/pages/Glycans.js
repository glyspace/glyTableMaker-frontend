import { useMemo } from 'react';
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

const data = [
    {
      glytoucanid: 'G17689DH',
      status: 'registered',
      mass: 2368.84,
      information: '',
      image: 'https://image.glycosmos.org/snfg/png/G17689DH',
      numberCollections: 1
    },
    {
      glytoucanid: 'G22310AV',
      status: 'newly registered',
      mass: 2368.84,
      information: 'composition',
      image: 'https://image.glycosmos.org/snfg/png/G22310AV',
      numberCollections: 1
    },
    {
      glytoucanid: 'G61734US',
      status: 'registered',
      mass: 2659.94,
      image: 'https://image.glycosmos.org/snfg/png/G61734US',
      information: '',
      numberCollections: 1
    },
    {
      glytoucanid: 'G12923TG',
      status: 'newly registered',
      mass: 123.54,
      information: '',
      numberCollections: 1
    },
    {
      glytoucanid: 'G12931TG',
      status: 'newly registered',
      mass: 123.54,
      information: '',
      numberCollections: 1
    },
    {
      glytoucanid: 'G12231TG',
      status: 'newly registered',
      mass: 123.54,
      information: '',
      numberCollections: 1
    },
  ];

const Glycans = () => {


const columns = useMemo(
    () => [
      {
        accessorKey: 'glytoucanid', 
        header: 'GlyTouCan ID',
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
      },
      {
        accessorKey: 'image',
        header: 'Image',
        size: 150,
        columnDefType: 'display',
        Cell: ({ cell }) => <img src={cell.getValue()} />,
      },
      {
        accessorKey: 'mass', 
        header: 'Mass',
        size: 100,
      },
      {
        accessorKey: 'numberCollections',
        header: '# Collections',
        size: 30,
      },
      {
        accessorKey: 'information',
        header: 'Information',
        size: 150,
      },
    ],
    [],
  );

  const openDeleteConfirmModal = (row) => {
    if (window.confirm('Are you sure you want to delete this glycan?')) {
      //deleteUser(row.original.id);
      console.log("deleting row " + row.original.glytoucanid);
    }
  };

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
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
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
                          title="Add Glycan"
                          id="gg-dropdown-navbar"
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
                          id="gg-dropdown-navbar"
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