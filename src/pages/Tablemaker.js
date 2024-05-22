import { Box, Container, IconButton, Tooltip, Typography } from "@mui/material";
import { FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useMemo, useReducer, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmationModal } from "../components/ConfirmationModal";

const Tablemaker = () => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [data, setData] = useState([
        {"name": "Species", "metadata" : "species", "type" : "valueId"},
        {"name": "Paper", "metadata" : "evidence", "type" : "value"}
    ]);

    const [collections, setCollections] = useState([
        {"collectionId" : 1, "name": "mycollection1", "collections" : [
            {"collectionId" : 2, "name": "childCollection"},
            {"collectionId" : 3, "name": "childCollection2"}
        ]},
        {"collectionId" : 5, "name": "mycollection2"}
    ]);

    const [templates, setTemplates] = useState([]);

    const [enableColumnAdd, setEnableColumnAdd] = useState(false);

    const columns = useMemo(
        () => [
          {
            accessorKey: 'name',
            header: 'Name',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorKey: 'metadata',
            header: 'Metadata',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorKey: 'type',
            header: 'Type',
            size: 100,
            enableColumnFilter: false,
          }
        ]
    );

    const table = useMaterialReactTable({
        autoResetPageIndex: false,
        columns,
        data,
        enableRowOrdering: true,
        enableSorting: false,
        muiRowDragHandleProps: ({ table }) => ({
          onDragEnd: () => {
            const { draggingRow, hoveredRow } = table.getState();
            if (hoveredRow && draggingRow) {
              data.splice(
                hoveredRow.index,
                0,
                data.splice(draggingRow.index, 1)[0],
              );
              setData([...data]);
            }
          },
        }),
        renderTopToolbar: ({ table }) => {
            const handleAdd = () => {
                setEnableColumnAdd(true);
            };

            const handleSave = () => {    
            };
      
            return (
              <Box
                sx={() => ({
                  display: 'flex',
                  gap: '0.5rem',
                  p: '8px',
                  justifyContent: 'space-between',
                })}
              >
                <Box></Box>
                <Box>
                  <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                    <Button className="gg-btn-blue-sm"
                      onClick={handleAdd}
                      variant="contained">
                      Add
                    </Button>
                    <Button className="gg-btn-blue-sm"
                      onClick={handleSave}
                      disabled={!data || data.length===0}
                      variant="contained">
                      Save As Template
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
        },
    });

    const deleteCollection = (e, node) => {
        e.stopPropagation();
        // remove the collection from collections array
        const index = collections.findIndex ((item) => item["collectionId"] === node.collectionId);
        var updated = [
            ...collections.slice(0, index),
            ...collections.slice(index + 1)
        ];
        setCollections(updated);
    }
    
    const renderTree = (nodes, isChild) => {
        if (!nodes || nodes.length === 0) {
          return null;
        }
        return (
          <>
          {Array.isArray(nodes) ?
              nodes.map ((node) => {
                  return (
                      <TreeItem itemId={node.collectionId} label=
                          {
                              <Row>
                                <Col style={{display:'flex', marginTop:'7px'}}>
                                <Typography variant="body2">
                                  {node.name}
                                </Typography>
                                </Col>
                                <Col style={{display:'flex', justifyContent:'right', marginRight: '50px'}}>
                                {!isChild && (
                                <Tooltip title="Remove Collection">
                                <IconButton color="error" onClick={(event) => deleteCollection(event, node)}>
                                  <DeleteIcon />
                                </IconButton></Tooltip>)}
                                </Col>
                            </Row>
                          }
                    >
                    {Array.isArray(node.collections)
                        ?  renderTree(node.collections, true)
                        : null}
                    </TreeItem>
                    )
            }) : null
        }
        </>
        );
    };

    const handleAddColumn = () => {
        // add the column to the table
        setEnableColumnAdd(false);
    };

    const addColumnForm = () => {
        return (
            <>
            Adding a new column
            </>
        );
    };

    return (
        <>
        <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Create Table"
                  subTitle="You can create a table for your collections with the selected columns, and export it as Excel or CSV files"
              />
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <ConfirmationModal
                showModal={enableColumnAdd}
                onCancel={() => {
                    setEnableColumnAdd(false);
                }}
                onConfirm={() => handleAddColumn()}
                title={"Add Column"}
                body={addColumnForm()}
              />
                  
              <Card> 
                <Card.Body>
                <Typography variant="h6" style={{ display: "inline" }}>
                    Create Table For:
                </Typography>
                  <Row>
                    <Col md={8}>
                    <SimpleTreeView expanded={true}>
                        {renderTree(collections)}
                    </SimpleTreeView>
                    </Col>
                    <Col md={4}>
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20">
                        Add Collection
                    </Button>
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20">
                        Add Collection of Collections
                    </Button>
                    </Col>
                  </Row>

                </Card.Body>
            </Card>
            <br/>
            <Card> 
                <Card.Body>
                <Row style={{marginBottom: "10px"}}>
                    <Col xs={4} md={4} lg={4}>
                        <Typography variant="h6" style={{ display: "inline" }}>
                            with columns:
                        </Typography>
                    </Col>
                    <Col xs={8} md={8} lg={8}>
                        <Row>
                            <Col xs={10} md={10} lg={10}>
                                <Row>
                                    <Col xs={4} md={4} lg={4}>
                                        <FormLabel label="Use Template" />
                                    </Col>
                                    <Col xs={8} md={8} lg={8}>
                                        <Form.Select
                                            as="select"
                                            name="template">
                                                {templates && templates.map((n , index) =>
                                                    <option
                                                    key={index}
                                                    value={n.id}>
                                                    {n.name}
                                                    </option>
                                                )}
                                        </Form.Select>
                                    </Col>
                                </Row>
                             </Col>
                            <Col xs={2} md={2} lg={2}>
                                <Button variant="contained" className="gg-btn-blue-sm gg-ml-20">
                                    Apply
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <MaterialReactTable table={table} />
                </Card.Body>
            </Card>
            <br/>
            <Card> 
                <Card.Body>
                <Row>
                <Col>
                <Typography variant="h6" style={{ display: "inline" }}>
                    using file format:
                </Typography>
                </Col>
                <Col>
                <Form.Select
                    as="select"
                    name="fileformat"
                    required={true}
                >
                   <option selected={true} key="excel" value="excel">
                        Excel
                    </option>
                    <option key="csv" value="csv">
                        CSV
                    </option>
                </Form.Select>
                </Col>
                </Row>
                </Card.Body>
            </Card>
            <br/>
            <Card> 
                <Card.Body>
                    <Button variant="contained" className="gg-btn-blue mt-2">
                        Download
                    </Button>
                    <div>Report:</div>
                </Card.Body>
            </Card>
            </div>
        </Container>
        </>
    );
}



export default Tablemaker;