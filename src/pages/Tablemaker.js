import { Box, Container, IconButton, Slider, Tooltip, Typography } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { useEffect, useMemo, useReducer, useState } from "react";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";
import DeleteIcon from '@mui/icons-material/Delete';
import { ConfirmationModal } from "../components/ConfirmationModal";
import MetadataTreeView from "../components/MetadataTreeView";
import { getAuthorizationHeader, getJson, postJson, postToAndGetBlob } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import TextAlert from "../components/TextAlert";
import Table from "../components/Table";
import { Loading } from "../components/Loading";
import FeedbackWidget from "../components/FeedbackWidget";

const Tablemaker = (props) => {

    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInputCollection, setTextAlertInputCollection] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [data, setData] = useState([]);
    const [fileFormat, setFileFormat] = useState("EXCEL");
    const [fileName, setFileName] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [metadata, setMetadata] = useState([]);
    const [metadataSelect, setMetadataSelect] = useState("");

    const [collections, setCollections] = useState([]);
    const [collectionType, setCollectionType] = useState ("GLYCAN");

    const [selectedCollections, setSelectedCollections] = useState([]);

    const [imageScale, setImageScale] = useState(1.0);

    const columnInitialState = {
        name: "",         // required
        datatype: null,  // datatype object, optional
        type: null,  // value, uri, id, or null (no selection)
        defaultValue: "",  // optional
    };

    const templateInitialState = {
        name: "",
        description: "",
        columns: [],
    }

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [column, setColumn] = useReducer(reducer, columnInitialState);
    const [template, setTemplate] = useReducer(reducer, templateInitialState);

    const [templates, setTemplates] = useState([]);
    const [downloadReport, setDownloadReport] = useState(null);

    const [enableColumnAdd, setEnableColumnAdd] = useState(false);
    const [enableCollectionAdd, setEnableCollectionAdd] = useState(false);
    const [enableCoCAdd, setEnableCoCAdd] = useState(false);
    const [enableTemplateSave, setEnableTemplateSave] = useState(false);
    const [validate, setValidate] = useState(false);
    const [valueTypeDisable, setValueTypeDisable] = useState(false);

    useEffect(props.authCheckAgent, []);

    useEffect (() => {
        getCategories();
        getTemplates();
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

    function getTemplates() {
        getJson ("api/table/gettemplates", getAuthorizationHeader()).then (({ data }) => {
            setTemplates(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    function getGlycanMetadata(previous) {
        getJson ("api/util/getglycanmetadata", getAuthorizationHeader()).then (({ data }) => {
            const glycanCategory = { "id" : -1, "name": "Glycan columns", "dataTypes" : data.data};
            // glycan columns will have id < 0, name is the displayed label, description is the enum value
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
            accessorFn: (row) => row.datatype ? row.datatype.name : "",
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

    const collectioncolumns = useMemo(
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
                setEnableTemplateSave (true); 
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

    const saveTemplate = () => {
        setShowLoading(true);
        setTextAlertInput({"show": false, id: ""});
        // create template model from the selections
        var t = createTemplate();
        setTemplate (t);
        // save template web service call
        let url = "api/table/addtemplate";
        postJson (url, t, getAuthorizationHeader()).then ( (data) => {
            setEnableTemplateSave(false);
            getTemplates();
            setShowLoading(false);
            setTemplate ({
                name: "",
                description: "",
                columns: null,
            })
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                setShowLoading(false);
                return;
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableTemplateSave(false);
          }
        );
    }

    function createTemplate () {
        // create template model from the selections
        var t = template;
        var columnArray = [];
        // add columns
        data.map ((item, index) => {
            const tableColumn = {};
            tableColumn["name"] = item.name;
            if (item.type) {
                tableColumn["type"] = item.type;
            }
            if (item.datatype) {
                // check if it is a glycan column
                if (item.datatype.datatypeId < 0) {
                    if (collectionType === "GLYCAN") {
                        tableColumn["glycanColumn"] = item.datatype.description ? item.datatype.description.toUpperCase() : null;
                    } else {
                        tableColumn["proteinColumn"] = item.datatype.description ? item.datatype.description.toUpperCase() : null;
                    }
                } else {
                    tableColumn["datatype"] = item.datatype;
                }
            }
            if (item.defaultValue && item.defaultValue.trim().length > 0) {
                tableColumn["defaultValue"] = item.defaultValue;
            }
            tableColumn["order"] = index;
            columnArray.push (tableColumn);
        });
        t["columns"] = columnArray;
        return t;
    }

    const useTemplate = () => {
        if (selectedTemplate) {
            const columnArray = [];
            let id = -1;
            selectedTemplate.columns.map ((column, index) => {
                let datatype;
                if (column.glycanColumn) {
                    datatype = {
                        name: column.glycanColumn,
                        datatypeId : id,
                        description : column.glycanColumn.toUpperCase(),
                    };
                    id --;
                } else if (column.proteinColumn) {
                    datatype = {
                        name: column.proteinColumn,
                        datatypeId : id,
                        description : column.proteinColumn.toUpperCase(),
                    };
                    id --;
                } else {
                    datatype = column.datatype;     
                }
                let col = {
                    name: column.name,
                    datatype: datatype,
                    type: column.type,
                    defaultValue: column.defaultValue,
                };
                columnArray.push (col);
            }) ;
            setData (columnArray);
        }
    };

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

    const handleTemplateChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue.trim().length > 1) {
            setValidate(false);
        }
        setTemplate({ [name]: newValue });
    };

    const handleDatatypeSelection = (event, itemId, isSelected) => {
        if (isSelected && typeof itemId === 'number') {  // datatype selected
            metadata.map ((element) => {
                if (element.dataTypes) {
                    var datatype = element.dataTypes.find ((item) => item.datatypeId === itemId);
                    if (datatype) {
                        setMetadataSelect(datatype.name);
                        setColumn ({datatype: datatype});
                        if (datatype.datatypeId < 0) {
                            // glycan columns
                            setValueTypeDisable (true);
                        } else {
                            setValueTypeDisable(false);
                        }
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
        // check if the column (with the same name) exists
        var existing = data.find ((item) => item.name === column.name);
        if (existing) {
            setTextAlertInput ({"show": true, "message": "There is already a column with this name"});
            return;
        }
        setEnableColumnAdd(false);
        setData([...data, column]);
        // clear column
        setColumn( {
            name: "",         // required
            datatype: null,  // datatype object, optional
            type: null,  // value, uri, id, or null (no selection)
            defaultValue: "",
        });
        setMetadataSelect("");
    };

    const addColumnForm = () => {
        return (
            <>
            <TextAlert alertInput={textAlertInput}/>
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
                                    setColumn ({datatype: null});
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
                disabled={valueTypeDisable}
              >
                <option key={0} value="">
                      Select
                </option>
                <option key={1} value="VALUE">
                      Value
                </option>
                <option key={2} value="URI">
                      Value URI
                </option>
                <option key={3} value="ID">
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
    
    const templateCreateForm = () => {
        return (
            <>
            <TextAlert alertInput={textAlertInput}/>
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
                    placeholder="Enter name for the template"
                    onChange={handleTemplateChange}
                    maxLength={255}
                    required={true}
                    isInvalid={validate}
                />
                <Feedback message="Name is required"></Feedback>
                </Col>
            </Form.Group>
            {/* Description */}
            <Form.Group
                  as={Row}
                  controlId="description"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Description" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="description"
                      placeholder="Enter description"
                      onChange={handleTemplateChange}
                      required={false}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                </Col>
                </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading>
            </>
        )
    }
    const listCollections = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getcollections"
                columns={collectioncolumns}
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
                columns={collectioncolumns}
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
        setTextAlertInputCollection ({"show": false, "message" : ""});
        // append new selections
        let cType = null;
        selectedCollections.forEach ((col) =>  {
            cType = col.type;
        });
        
        const previous = [...selectedCollections];
        selected.forEach ((collection) => {
            const found = selectedCollections.find ((item) => item.collectionId === collection.collectionId
                || (item.children && item.children.find ((child) => child.collectionId === collection.collectionId))
                || (collection.children && collection.children.find ((child) => child.collectionId === item.collectionId)));
            if (!found) {
                if (cType && collection.type !== cType) {
                    setTextAlertInputCollection ({"show": true, "message": "All selected collections should be of the same type: " + cType });
                    return;
                } 
                previous.push (collection);
                setCollectionType (cType);
            } else {
                setTextAlertInputCollection ({"show": true, "message": "This collection has already been added to the list!" });
                return;
            }
        });
        setSelectedCollections(previous);
    };

    const handleCollectionSelect = (coc) => {
        setTextAlertInputCollection ({"show": false, "message" : ""});
        setCollections(selectedCollections);
        if (coc) {
            setEnableCoCAdd(false);
        }
        else {
            setEnableCollectionAdd(false);
        }
    };

    const handleFileFormatSelect = e => {
        setFileFormat (e.target.value);
    }

    const handleFileNameChange = e => {
        setFileName (e.target.value);
    }

    const handleTemplateSelect = e => {
        const tid = e.target.value;
        var t = templates.find ((item) => item.templateId.toString() === tid);
        setSelectedTemplate (t);
    };

    const download = () => {
        var t = createTemplate();
        const tableDef = {
            "collections" : collections,
            "columns": t.columns,
            "fileFormat": fileFormat,
            "filename" : fileName,
            "imageScale": imageScale,
        };

        setShowLoading(true);
        setTextAlertInput({"show": false, id: ""});
        // save template web service call
        let url = "api/table/downloadtable";
        postToAndGetBlob (url, tableDef, getAuthorizationHeader()).then ( (data) => {
            const contentDisposition = data.headers.get("content-disposition");
            const fileNameIndex = contentDisposition.indexOf("filename=") + 10;
            const fileNameEndIndex = contentDisposition.indexOf(":");
            const fileName = contentDisposition.substring(fileNameIndex, fileNameEndIndex);
            const reportId = contentDisposition.substring(fileNameEndIndex+1, contentDisposition.length - 1);

            //   window.location.href = fileUrl;
            var fileUrl = URL.createObjectURL(data.data);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = fileUrl;
            a.download = fileName;
            a.click();

            window.URL.revokeObjectURL(fileUrl);
            getDownloadReport(reportId);
            setShowLoading(false);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                //setTextAlertInput ({"show": true, "message": error.response.data.message });
                // read blob as json
                error.response.data.text().then( (resp) => {
                    const { message } = JSON.parse (resp);
                    getDownloadReport(message);
                });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );

        
    }

    const getDownloadReport = (reportId) => {
        //get the report with reportId
        getJson ("api/table/getreport/" + reportId, getAuthorizationHeader()).then ((data) => {
            setDownloadReport (data.data.data);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }  
        });
    }

    const displayDownloadReport = () => {
        return (
            <>
            <div style={{ marginTop: "15px"}}/>
            <Typography variant="h6" color={downloadReport.success ? "": "red"}>{downloadReport.message}</Typography>
            <div>
            {downloadReport.errors && "Errors:"}  
            {downloadReport.errors && downloadReport.errors.map ((error) => {
                        return <li>{error}</li>
                    })
            }
            {downloadReport.warnings && "Warnings:"}  
            {downloadReport.warnings && downloadReport.warnings.map ((warning) => {
                        return <li>{warning}</li>
                    })
            }
            </div>
            </>
        )
    }

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
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
                    setTextAlertInput({"show": false, id: ""});
                }}
                onConfirm={() => handleAddColumn()}
                title={"Add Column"}
                body={addColumnForm()}
              />
              <ConfirmationModal
                showModal={enableTemplateSave}
                onCancel={() => {
                    setEnableTemplateSave(false);
                    setTextAlertInput({"show": false, id: ""});
                }}
                onConfirm={() => saveTemplate()}
                title={"Add Template"}
                body={templateCreateForm()}
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
                    <TextAlert alertInput={textAlertInputCollection}/>
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
                    <TextAlert alertInput={textAlertInputCollection}/>
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
                                            name="template"
                                            onChange={handleTemplateSelect}>
                                                <option key="select" value="">
                                                    Select
                                                </option>
                                                {templates && templates.map((n , index) =>
                                                    <option
                                                    key={index}
                                                    value={n.templateId}>
                                                    {n.name}
                                                    </option>
                                                )}
                                        </Form.Select>
                                    </Col>
                                </Row>
                             </Col>
                            <Col xs={2} md={2} lg={2}>
                                <Button variant="contained" className="gg-btn-blue-sm gg-ml-20"
                                    disabled={!selectedTemplate}
                                    onClick={useTemplate}>
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
                    onChange={handleFileFormatSelect}>
                   <option selected={true} key="excel" value="EXCEL">
                        XLSX
                    </option>
                    <option key="csv" value="CSV">
                        CSV
                    </option>
                </Form.Select>
                </Col>
                </Row>
                <Row>
                <Col>
                <Typography variant="h6" style={{ display: "inline" }}>
                    file name:
                </Typography>
                </Col>
                <Col>
                <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter filename, if left empty, tablemakerexport is used by default"
                      value={fileName}
                      onChange={handleFileNameChange}
                    />
                </Col>
                </Row>
                {data.find ((item) => item.datatype && item.datatype.datatypeId < 0 && item.datatype.description.toUpperCase() === "CARTOON") 
                && fileFormat === "EXCEL" && 
                <Row>
                    <Col>
                        <Typography variant="h6" style={{ display: "inline" }}>
                        image scale:
                        </Typography>
                    </Col>
                    <Col>
                    <Slider defaultValue={100} min={25} max={300} step={25} valueLabelDisplay="auto"
                        valueLabelFormat={value => <div>{value} %</div>}
                        onChange={(e, v) => {setImageScale(v/100);}}/>
                    </Col>
                </Row>
                }
                </Card.Body>
            </Card>
            <br/>
            <Card> 
                <Card.Body>
                    <Button variant="contained" className="gg-btn-blue mt-2"
                    onClick={download} disabled={collections.length===0 || data.length === 0}> 
                        Download
                    </Button>
                    {downloadReport &&
                       displayDownloadReport()
                    }
                </Card.Body>
            </Card>
            <Loading show={showLoading}></Loading>
            </div>
        </Container>
        </>
    );
}

export default Tablemaker;