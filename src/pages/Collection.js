import { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Container } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";

const Collection = (props) => {
    const [searchParams] = useSearchParams();
    let collectionId = searchParams.get("collectionId");
    const navigate = useNavigate();
    const [error, setError] = useState(false);
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

    const collection = {
        name: "",
        description: "",
        glycans: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, collection);

    const [showGlycanTable, setShowGlycanTable] = useState(false);

    useEffect(props.authCheckAgent, []);

    useEffect(() => {
        if (collectionId) 
            fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId]);

    const fetchData = async () => {
        setShowLoading(true);
        getJson ("api/data/getcollection/" + collectionId, getAuthorizationHeader())
            .then ((json) => {
                setUserSelection (json.data.data);
                setShowLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setShowLoading(false);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                setShowLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue && newValue.trim().length > 1) {
            setValidate(false);
            setError(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        if (userSelection.name === "" || userSelection.name.trim().length < 1) {
            setValidate(true);
            setError(true);
            return;
        }

        const collection = { 
            name: userSelection.name,
            description: userSelection.description
        }
        
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        postJson ("api/data/addcollection", collection, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/collections");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
        e.preventDefault();
    }

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
          }
        ],
        [],
      );

    return (
        <>
        <Container maxWidth="xl">
            <div className="page-container">
             <PageHeading title="Add Collection" subTitle="Please provide the information for the new collection." />
            <Card>
            <Card.Body>
            <div className="mt-4 mb-4">
            <TextAlert alertInput={textAlertInput}/>
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
            <Form>
                <Form.Group
                  as={Row}
                  controlId="name"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name of the collection"
                      value={userSelection.name}
                      onChange={handleChange}
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
                  <Col xs={12} lg={9}>
                    <FormLabel label="Description" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="description"
                      placeholder="Enter description"
                      value={userSelection.description}
                      onChange={handleChange}
                      required={false}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                </Col>
                </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Link to="/collections">
                    <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Collections</Button>
                </Link>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={handleSubmit}>
                    Save
                </Button> 
                { <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={()=> setShowGlycanTable(true)}>
                    Add Glycan
                </Button>}
            </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
            {showGlycanTable && 
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    ws="api/data/getglycans"
                    columns={columns}
                    enableRowActions={false}
                    setAlertDialogInput={setAlertDialogInput}
                />}
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
};

export default Collection;