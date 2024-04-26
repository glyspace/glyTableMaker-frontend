import Container from "@mui/material/Container";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from '../components/DialogAlert';
import MetadataTreeView from "../components/MetadataTreeView";
import { useEffect, useReducer, useState } from "react";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
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
    const [enableCategoryEdit, setEnableCategoryEdit] = useState(false);
    const [lastSelectedItem, setLastSelectedItem] = useState(null);

    const handleItemSelectionToggle = (event, itemId, isSelected) => {
        if (isSelected && typeof itemId !== "number" && itemId.includes ("category")) {
            itemId = itemId.substring(8);
            var item = Number(itemId);
            var cat = data.find ((element) => element.categoryId === item);
            setLastSelectedItem(cat);
        }
    };

    const datatypeInitialState = {
        name: "",
        description: "",
        namespace: {},
        multiple: false,
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
        //const select = e.target.options[e.target.selectedIndex];
        //setDatatype({ namespace: select });
        const namespaceId = e.target.value;
        const namespace = namespaceList.find(n => n.namespaceId.toString() === namespaceId);
        setDatatype({ namespace: namespace });
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
        
        setShowLoading(true);
        let url = "api/metadata/adddatatype";
        if (lastSelectedItem && lastSelectedItem.categoryId) {
            url += "?categoryid=" + lastSelectedItem.categoryId;
        }
        postJson (url, datatype, getAuthorizationHeader()).then ( (data) => {
            setEnableDatatypeAdd(false);
            getCategories();
            setShowLoading(false);
          }).catch (function(error) {
            axiosError(error, null, setAlertDialogInput);
            setShowLoading(false);
            setEnableDatatypeAdd(false);
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
            axiosError(error, null, setAlertDialogInput);
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
            axiosError(error, null, setAlertDialogInput);
            setShowLoading(false);
            setEnableCategoryEdit(false);
          }
        );
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
              <Form.Control
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
                
              </Form.Control>
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
            Add Datatype - 
            {lastSelectedItem == null
              ? ' No category selected'
              : ` Category: ${lastSelectedItem.name}`}
          </Typography>}
          body={addDataTypeForm()}
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
        <Card>
            <Card.Body>
                <div className="text-center mb-4">
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> setEnableCategoryAdd(true)}>
                    Add Category
                    </Button>
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> setEnableDatatypeAdd(true)}>
                        Add Datatype
                    </Button>
                </div>
                <Typography variant="h6" style={{ display: "inline" }}>
                    Categories
                </Typography>
                <MetadataTreeView data={data} onItemSelectionToggle={handleItemSelectionToggle}
                    edit={(node) => {
                        setCategory(node);
                        setEnableCategoryEdit(true)
                    }}/>
            </Card.Body>
        </Card>
    </div>
    </Container>
    </>
    );
}

export default Metadata;