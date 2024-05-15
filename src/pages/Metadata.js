import Container from "@mui/material/Container";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from '../components/DialogAlert';
import MetadataTreeView from "../components/MetadataTreeView";
import { useEffect, useReducer, useState } from "react";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Typography } from "@mui/material";
import TextAlert from "../components/TextAlert";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { Loading } from "../components/Loading";

const Metadata = (props) => {

    const [data, setData] = useState([]);
    const [namespaceList, setNamespaceList] = useState([]);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [enableCategoryAdd, setEnableCategoryAdd] = useState(false);
    const [enableDatatypeAdd, setEnableDatatypeAdd] = useState(false);
    const [enableDatatypeEdit, setEnableDatatypeEdit] = useState(false);
    const [enableCategoryEdit, setEnableCategoryEdit] = useState(false);
    const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
    const [showDeleteDatatypeModal, setShowDeleteDatatypeModal] = useState(false);
    const [categoryTobeDeleted, setCategoryTobeDeleted] = useState(null);
    const [datatypeTobeDeleted, setDatatypeTobeDeleted] = useState(null);
    const [datatypeCollections, setDatatypeCollections] = useState([]);

    const [readOnly, setReadOnly] = useState(false);

    const datatypeInitialState = {
        name: "",
        description: "",
        namespace: null,
        multiple: false,
        category: null,
    };

    const categoryInitialState = {
        name: "",
        description: ""
    }

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [datatype, setDatatype] = useReducer(reducer, datatypeInitialState);
    const [category, setCategory] = useReducer(reducer, categoryInitialState);


    useEffect(props.authCheckAgent, []);

    useEffect (() => {
        getCategories();
        getNamespaces();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getCategories() {
        getJson ("api/metadata/getcategories", getAuthorizationHeader()).then (({ data }) => {
            setData(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    function getNamespaces() {
        getJson ("api/util/namespaces").then (({ data }) => {
            setNamespaceList(data.data);
            setDatatype({ namespace: data.data[0] });
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue.trim().length > 1) {
            setValidate(false);
        }
        if (name === "namespace" && newValue) {
            setValidate(false);
        }
        if (name === "multiple" && newValue === "on") {
            setDatatype ({multiple: true});
        } else if (name === "multiple") {
            setDatatype ({multiple: false});
        } else {
            setDatatype({ [name]: newValue });
        }
    };

    const handleCategoryChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue.trim().length > 1) {
            setValidate(false);
        }
        setCategory({ [name]: newValue });
    }

    const handleNamespaceSelect = e => {
        const namespaceId = e.target.value;
        const namespace = namespaceList.find(n => n.namespaceId.toString() === namespaceId);
        setDatatype({ namespace: namespace });
    };

    const handleCategorySelect = e => {
        const categoryId = e.target.value;
        setDatatype({ category: categoryId });
    };

    const handleAddDatatype = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (datatype.name === "" || datatype.name.trim().length < 1) {
            setValidate(true);
            return;
        }
        if (!datatype.namespace) {
            setValidate(true);
            return;
        }

        let categoryId = datatype.category;
        if (!datatype.category) {
            if (category) {
                categoryId = category.categoryId;
            } else {
                setValidate(true);
                return;
            }
        }
        
        setShowLoading(true);
        let url = "api/metadata/adddatatype?categoryid=" + categoryId;
        postJson (url, datatype, getAuthorizationHeader()).then ( (data) => {
            setEnableDatatypeAdd(false);
            getCategories();
            setShowLoading(false);
            setDatatype ({
                datatypeId: null,
                name: "",
                description: "",
                namespace: namespaceList[0],
                multiple: false,
                category: null,
            })
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableDatatypeAdd(false);
          }
        );
    }

    const handleEditDatatype = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (datatype.name === "" || datatype.name.trim().length < 1) {
            setValidate(true);
            return;
        }

        let categoryId = datatype.category;
        if (!datatype.category) {
            if (category) {
                categoryId = category.categoryId;
            } else {
                setValidate(true);
                return;
            }
        }
        
        setShowLoading(true);
        let url = "api/metadata/updatedatatype?categoryid=" + categoryId;
        postJson (url, datatype, getAuthorizationHeader()).then ( (data) => {
            setEnableDatatypeEdit(false);
            getCategories();
            setShowLoading(false);
            setDatatype ({
                datatypeId: null,
                name: "",
                description: "",
                namespace: namespaceList[0],
                multiple: false,
                category: null,
            })
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableDatatypeEdit(false);
          }
        );
    }

    const handleAddCategory = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (category.name === "" || category.name.trim().length < 1) {
            setValidate(true);
            return;
        }
        
        setShowLoading(true);
        postJson ("api/metadata/addcategory", category, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            setEnableCategoryAdd(false);
            getCategories();
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableCategoryAdd(false);
          }
        );
    }

    const handleEditCategory = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (category.name === "" || category.name.trim().length < 1) {
            setValidate(true);
            return;
        }
        
        setShowLoading(true);
        postJson ("api/metadata/updatecategory", category, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            setEnableCategoryEdit(false);
            getCategories();
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
            setEnableCategoryEdit(false);
          }
        );
    }

    const handleDeleteCategory = () => {
        setShowLoading(true);
        props.authCheckAgent();
        if (categoryTobeDeleted) {
            deleteJson ("api/metadata/deletecategory/" + categoryTobeDeleted.categoryId, getAuthorizationHeader()).then ( (data) => {
                setShowLoading(false);
                setCategoryTobeDeleted(null);
                getCategories();
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInput ({"show": true, "message": error.response.data.message });
                    setShowLoading(false);
                } else {
                    setShowLoading(false);
                    axiosError(error, null, props.setAlertDialogInput);
                }
            }
        );
        }
        setShowDeleteCategoryModal(false);
    }

    const handleDeleteDatatype = () => {
        setShowLoading(true);
        props.authCheckAgent();
        if (datatypeTobeDeleted) {
            deleteJson ("api/metadata/deletedatatype/" + datatypeTobeDeleted.datatypeId, getAuthorizationHeader()).then ( (data) => {
                setShowLoading(false);
                setDatatypeTobeDeleted(null);
                getCategories();
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInput ({"show": true, "message": error.response.data.message });
                    setShowLoading(false);
                } else {
                    setShowLoading(false);
                    axiosError(error, null, props.setAlertDialogInput);
                }
            }
        );
        }
        setShowDeleteDatatypeModal(false);
    }

    const getCollections = (dtype) => {
        getJson ("api/metadata/getcollectionsfordatatype?datatypeId=" + dtype.datatypeId, 
                getAuthorizationHeader()).then (({ data }) => {
            setDatatypeCollections(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const addCategoryForm = () => {
        return (<>
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
                placeholder="Enter name for the datatype category"
                onChange={handleCategoryChange}
                maxLength={255}
                required={true}
                isInvalid={validate}
              />
              <Feedback message="Name is required"></Feedback>
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            controlId="description"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Description"/>
              <Form.Control
                as="textarea"
                rows="5"
                name="description"
                placeholder="Enter description for the datatype category"
                maxLength={4000}
                onChange={handleCategoryChange}
              />
            </Col>
          </Form.Group>
          </Form>
          </>
        );
    }

    const editCategoryForm = () => {
        return (<>
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
                value={category.name}
                placeholder="Enter name for the datatype category"
                onChange={handleCategoryChange}
                maxLength={255}
                required={true}
                isInvalid={validate}
              />
              <Feedback message="Name is required"></Feedback>
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            controlId="description"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Description"/>
              <Form.Control
                as="textarea"
                rows="5"
                name="description"
                value={category.description}
                placeholder="Enter description for the datatype category"
                maxLength={4000}
                onChange={handleCategoryChange}
              />
            </Col>
          </Form.Group>
          </Form>
          </>
        );
    }

    const addDataTypeForm = () => {
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
                placeholder="Enter name for the datatype"
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
            controlId="category"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Category" className="required-asterik" />
              <Form.Select
                as="select"
                name="category"
                onChange={handleCategorySelect}
                required={true}
              >
                {data && data.map((n , index) =>
                    !n.name.includes ("GlyGen Glycomics Data") && 
                      <option
                      selected={n.name === category.name}
                      key={index}
                      value={n.categoryId}>
                      {n.name}
                      </option>
                  )}
              </Form.Select>
              <Feedback message="Category is required"></Feedback>
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            controlId="description"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Description"/>
              <Form.Control
                as="textarea"
                rows="5"
                name="description"
                placeholder="Enter description for the datatype"
                maxLength={4000}
                onChange={handleChange}
              />
            </Col>
          </Form.Group>
          <Form.Group
            as={Row}
            controlId="namespace"
            className="gg-align-center mb-3"
          >
            <Col xs={12} lg={9}>
              <FormLabel label="Namespace" className="required-asterik" />
              <Form.Select
                as="select"
                name="namespace"
                onChange={handleNamespaceSelect}
                required={true}
              >
                {namespaceList && namespaceList.map((n , index) =>
                      <option
                      key={index}
                      value={n.namespaceId}>
                      {n.name}
                      </option>
                  )}
              </Form.Select>
              <Feedback message="Namespace is required"></Feedback>
            </Col>
          </Form.Group>
          <Form.Group
              as={Row}
              controlId="multiple"
              className="gg-align-center mb-3"
              >
              <Col xs={12} lg={9}>
                  <FormLabel label="Multiple" />
                  <Form.Check
                      type="checkbox"
                      name="multiple"
                      defaultChecked={false}
                      onChange={handleChange}/>
              </Col>
          </Form.Group>
        </Form>
        <Loading show={showLoading}></Loading> </>);
    }

    const editDatatypeForm = () => {
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
                    value={datatype.name}
                    placeholder="Enter name for the datatype"
                    onChange={handleChange}
                    maxLength={255}
                    required={true}
                    isInvalid={validate}
                    disabled={readOnly}
                  />
                  <Feedback message="Name is required"></Feedback>
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                controlId="category"
                className="gg-align-center mb-3"
              >
                <Col xs={12} lg={9}>
                  <FormLabel label="Category" className="required-asterik" />
                  <Form.Select
                    as="select"
                    name="category" 
                    disabled={readOnly}
                    onChange={handleCategorySelect}
                  >
                    {data && data.map((n , index) =>
                        ((!readOnly && !n.name.includes ("GlyGen Glycomics Data")) || (readOnly)) && 
                          <option
                          selected={n.categoryId === datatype.category}
                          key={index}
                          value={n.categoryId}>
                          {n.name}
                          </option>
                      )}
                  </Form.Select>
                  <Feedback message="Category is required"></Feedback>
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                controlId="description"
                className="gg-align-center mb-3"
              >
                <Col xs={12} lg={9}>
                  <FormLabel label="Description"/>
                  <Form.Control
                    as="textarea"
                    rows="5"
                    value={datatype.description}
                    name="description"
                    placeholder="Enter description for the datatype"
                    maxLength={4000}
                    onChange={handleChange}
                    disabled={readOnly}
                  />
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                controlId="namespace"
                className="gg-align-center mb-3"
              >
                <Col xs={12} lg={9}>
                  <FormLabel label="Namespace" className="required-asterik" />
                  <Form.Select
                    as="select"
                    name="namespace"
                    disabled
                    required={true}
                >
                    {namespaceList && namespaceList.map((n , index) =>
                        <option
                        selected={datatype.namespace && n.name === datatype.namespace.name}
                        key={index}
                        value={n.namespaceId}>
                        {n.name}
                        </option>
                    )}
                </Form.Select>
                 <Feedback message="Namespace is required"></Feedback>
                </Col>
              </Form.Group>
              <Form.Group
                  as={Row}
                  controlId="multiple"
                  className="gg-align-center mb-3"
                  >
                  <Col xs={12} lg={9}>
                      <FormLabel label="Multiple" />
                      <Form.Check
                          type="checkbox"
                          name="multiple"
                          defaultChecked={datatype.multiple}
                          disabled={readOnly}
                          onChange={handleChange}/>
                  </Col>
              </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading> </>);
        }

    return (
    <>
        <Container maxWidth="xl">
        <div className="page-container">
        <PageHeading
            title="Your Metadata"
            subTitle="The table below displays a list of all metadata categories that are available. 
            Categories may be added, edited or removed. New datatypes can be added and assigned to the categories."

        />
        <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
        />
        <TextAlert alertInput={textAlertInput}/>
        <ConfirmationModal
          showModal={enableDatatypeAdd}
          onCancel={() => {
            setEnableDatatypeAdd(false);
          }}
          onConfirm={() => handleAddDatatype()}
          title={<Typography>
            Add Datatype
          </Typography>}
          body={addDataTypeForm()}
        />

        <ConfirmationModal
          showModal={enableDatatypeEdit}
          onCancel={() => {
            setEnableDatatypeEdit(false);
          }}
          onConfirm={() => handleEditDatatype()}
          title={readOnly ? "View Datatype" : "Edit Datatype"}
          body={editDatatypeForm()}
        />

        <ConfirmationModal
          showModal={enableCategoryAdd}
          onCancel={() => {
            setEnableCategoryAdd(false);
          }}
          onConfirm={() => handleAddCategory()}
          title={"Add Datatype Category"}
          body={addCategoryForm()}
        />

        <ConfirmationModal
          showModal={enableCategoryEdit}
          onCancel={() => {
            setEnableCategoryEdit(false);
          }}
          onConfirm={() => handleEditCategory()}
          title={"Edit Datatype Category"}
          body={editCategoryForm()}
        />

        <ConfirmationModal
            showModal={showDeleteCategoryModal}
            onCancel={() => setShowDeleteCategoryModal(false)}
            onConfirm={handleDeleteCategory}
            title="Confirm Delete"
            body="Are you sure you want to delete this category? All associated datatypes will be deleted as well!"
        />

        <ConfirmationModal
            showModal={showDeleteDatatypeModal}
            onCancel={() => setShowDeleteDatatypeModal(false)}
            onConfirm={handleDeleteDatatype}
            title="Confirm Delete"
            body={<div> 
                    {datatypeCollections.length > 0 && 
                    <span> This datatype is being used in the following collections:</span>}
                    {datatypeCollections.map((collection) => {
                        return (
                            <li>{collection.name}</li>
                        );
                    })}
                    {datatypeCollections.length > 0 &&  
                        <span>The metadata from the listed collections will be removed as well.</span>}
                    <br/><span>Are you sure you want to delete this datatype?</span>
                </div>
                }
        />
        <Card>
            <Card.Body>
                <div className="text-center mb-4">
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> setEnableCategoryAdd(true)}>
                    Add Category
                    </Button>
                </div>
                <Typography variant="h6" style={{ display: "inline" }}>
                    Categories
                </Typography>
                <MetadataTreeView data={data} 
                    edit={(node) => {
                        setCategory(node);
                        setEnableCategoryEdit(true)
                    }}
                    add={(node)=> {
                        // reset the datatype
                        setDatatype ({
                            datatypeId: null,
                            name: "",
                            description: "",
                            namespace: null,
                            multiple: false,
                            category: null,
                        })
                        setCategory(node);
                        setEnableDatatypeAdd(true);
                    }}
                    delete={(category)=> {
                        setCategoryTobeDeleted(category);
                        setShowDeleteCategoryModal(true)
                    }}
                    deleteDatatype={(datatype) => {
                        setDatatypeTobeDeleted(datatype);
                        getCollections(datatype);
                        setShowDeleteDatatypeModal(true);
                    }}
                    editDatatype={(datatype, cat, readOnly) => {
                        setDatatype(datatype);
                        setDatatype ({category: cat.categoryId});
                        setReadOnly(readOnly)
                        setEnableDatatypeEdit(true);
                    }}
                />
            </Card.Body>
        </Card>
    </div>
    </Container>
    </>
    );
}

export default Metadata;