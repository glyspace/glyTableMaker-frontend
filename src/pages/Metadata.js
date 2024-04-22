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

    const datatypeInitialState = {
        name: "",
        description: "",
        namespace: {},
        multiple: false,
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [datatype, setDatatype] = useReducer(reducer, datatypeInitialState);

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
        postJson ("api/metadata/adddatatype", datatype, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            setEnableDatatypeAdd(false);
          }).catch (function(error) {
            axiosError(error, null, setAlertDialogInput);
            setShowLoading(false);
            setEnableCategoryAdd(false);
          }
        );
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
          title="Add Datatype"
          body={
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
                      type="text"
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
              <Loading show={showLoading}></Loading>
            </>
          }
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
                <MetadataTreeView data={data}/>
            </Card.Body>
        </Card>
    </div>
    </Container>
    </>
    );
}

export default Metadata;