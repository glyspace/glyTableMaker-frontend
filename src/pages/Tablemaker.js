import { Box, Container, IconButton, Tooltip, Typography } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { useEffect, useMemo, useReducer, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmationModal } from "../components/ConfirmationModal";
import MetadataTreeView from "../components/MetadataTreeView";
import { getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import TextAlert from "../components/TextAlert";
import Table from "../components/Table";

const Tablemaker = (props) => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [data, setData] = useState([]);

    const [metadata, setMetadata] = useState([]);
    const [metadataSelect, setMetadataSelect] = useState("");

    const [collections, setCollections] = useState([]);

    const [selectedCollections, setSelectedCollections] = useState([]);

    const columnInitialState = {
        name: "",         // required
        metadata: null,  // datatype object, optional
        type: null,  // value, uri, id, or null (no selection)
        defaultValue: "",  // optional
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [column, setColumn] = useReducer(reducer, columnInitialState);

    const [templates, setTemplates] = useState([]);

    const [enableColumnAdd, setEnableColumnAdd] = useState(false);
    const [enableCollectionAdd, setEnableCollectionAdd] = useState(false);
    const [enableCoCAdd, setEnableCoCAdd] = useState(false);
    const [validate, setValidate] = useState(false);

    useEffect(props.authCheckAgent, []);

    useEffect (() => {
        getCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getCategories() {
        getJson ("api/metadata/getcategories", getAuthorizationHeader()).then (({ data }) => {
            setMetadata(data.data);
            getGlycanMetadata(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    function getGlycanMetadata(previous) {
        getJson ("api/util/getglycanmetadata", getAuthorizationHeader()).then (({ data }) => {
            const glycanCategory = { "id" : -1, "name": "Glycan columns", "dataTypes" : data.data};
            setMetadata ([...previous, glycanCategory]);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'name',
            header: 'Name',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorFn: (row) => row.metadata ? row.metadata.name : "",
            header: 'Metadata',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorKey: 'type',
            header: 'Type',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorKey: 'defaultValue',
            header: 'Default Value',
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
        enableRowActions: true,
        positionActionsColumn: 'last',
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
        renderRowActions: ({ row }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip title="Delete">
                <IconButton color="error" onClick={() => deleteFromTable(row.original["name"])}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          ),
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

    const deleteFromTable = (name) => {
        const index = data.findIndex ((item) => item["name"] === name);
        var updated = [
            ...data.slice(0, index),
            ...data.slice(index + 1)
        ];
        setData (updated);
    }

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
                    {Array.isArray(node.children)
                        ?  renderTree(node.children, true)
                        : null}
                    </TreeItem>
                    )
            }) : null
        }
        </>
        );
    };

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue.trim().length > 1) {
            setValidate(false);
        }
        setColumn({ [name]: newValue });
    };

    const handleDatatypeSelection = (event, itemId, isSelected) => {
        if (isSelected && typeof itemId === 'number') {  // datatype selected
            metadata.map ((element) => {
                if (element.dataTypes) {
                    var datatype = element.dataTypes.find ((item) => item.datatypeId === itemId);
                    if (datatype) {
                        setMetadataSelect(datatype.name);
                        setColumn ({metadata: datatype});
                    }
                }
            });
        }
    }

    const handleAddColumn = () => {
        if (column.name === "" || column.name.trim().length < 1) {
            setValidate(true);
            return;
        } 
        // add the column to the table
        setEnableColumnAdd(false);
        setData([...data, column]);
        // clear column
        setColumn( {
            name: "",         // required
            metadata: null,  // datatype object, optional
            type: null,  // value, uri, id, or null (no selection)
            defaultValue: "",
        });
        setMetadataSelect("");
    };

    const addColumnForm = () => {
        return (
            <>
            <Form>
            <Form.Group
                as={Row}
                controlId="name"
                className="gg-align-center mb-3"
            >
                <Col xs={12} lg={9}>
                <FormLabel label="Name" className="required-asterik"/>
                <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter name for the column (will appear as the heading)"
                    onChange={handleChange}
                    maxLength={255}
                    required={true}
                    isInvalid={validate}
                />
                <Feedback message="Name is required"></Feedback>
                </Col>
            </Form.Group>
            <Form.Group
                as={Row}
                controlId="metadataSelect"
                className="gg-align-center mb-3"
            >
                <Col xs={12} lg={9}>
                    <Row>
                        <Col>
                            <FormLabel label="Metadata" />
                        </Col>
                        <Col>
                            <Form.Control
                            type="text"
                            name="metadata"
                            value={metadataSelect}
                            disabled
                            />
                        </Col>
                        <Col>
                            <Button variant="contained" className="gg-btn-blue-sm gg-ml-20"
                                onClick ={ () => {
                                    setColumn ({metadata: null});
                                    setMetadataSelect("");
                                } }>
                                Clear Selection
                            </Button>
                        </Col>
                    </Row>
                    <br/>
                    <Card>
                        <MetadataTreeView data={metadata}
                            onItemSelectionToggle={handleDatatypeSelection}/>
                    </Card>
                </Col>
            </Form.Group>
            <Form.Group
            as={Row}
            controlId="valuetype"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Value Type"/>
              <Form.Select
                as="select"
                name="type"
                onChange={handleChange}
              >
                <option key={0} value="">
                      Select
                </option>
                <option key={1} value="value">
                      Value
                </option>
                <option key={2} value="uri">
                      Value URI
                </option>
                <option key={3} value="id">
                      Value ID
                </option>
              </Form.Select>
            </Col>
            </Form.Group>
            <Form.Group
                as={Row}
                controlId="default"
                className="gg-align-center mb-3"
            >
                <Col xs={12} lg={9}>
                <FormLabel label="Default Value"/>
                <Form.Control
                    type="text"
                    name="defaultValue"
                    placeholder="Enter a default value, if any"
                    onChange={handleChange}
                />
                </Col>
            </Form.Group>
            </Form>
            </>
        );
    };

    const listCollections = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getcollections"
                columns={columns}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="name"
                rowSelection={true}
                rowSelectionChange={handleCollectionSelectionChange}
                rowId="collectionId"
            />
            </>
        );
    };

    const listCoC = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getcocs"
                columns={columns}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="name"
                rowSelection={true}
                rowSelectionChange={handleCollectionSelectionChange}
                rowId="collectionId"
            />
            </>
        );
    };

    const handleCollectionSelectionChange = (selected) => {
        // append new selections
        const previous = [...selectedCollections];
        selected.forEach ((collection) => {
            const found = selectedCollections.find ((item) => item.collectionId === collection.collectionId);
            if (!found) {
                previous.push (collection);
            }
        })
        setSelectedCollections(previous);
    };

    const handleCollectionSelect = (coc) => {
        setCollections(selectedCollections);
        if (coc) {
            setEnableCoCAdd(false);
        }
        else {
            setEnableCollectionAdd(false);
        }
    };

    return (
        <>
        <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Create Table"
                  subTitle="You can create a table for your collections with the selected columns, and export it as Excel or CSV files"
              />
              <TextAlert alertInput={textAlertInput}/>
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
              {enableCollectionAdd && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={enableCollectionAdd}
                    onHide={() => setEnableCollectionAdd(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Collections:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listCollections()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setEnableCollectionAdd(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={()=>handleCollectionSelect(false)}>Add Selected Collections</Button>
                     </Modal.Footer>
                </Modal>
              )}
              {enableCoCAdd && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={enableCoCAdd}
                    onHide={() => setEnableCoCAdd(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Collections:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listCoC()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setEnableCoCAdd(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={()=>handleCollectionSelect(true)}>Add Selected Collections</Button>
                     </Modal.Footer>
                </Modal>
              )}
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
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20"
                        onClick={()=> setEnableCollectionAdd(true)}>
                        Add Collection
                    </Button>
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20"
                        onClick={(()=> setEnableCoCAdd(true))}>
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