import { useEffect, useReducer, useState } from "react";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Button, Card, Col, Row } from "react-bootstrap";
import FeedbackWidget from "../components/FeedbackWidget";
import { Alert, Container, FormControlLabel, FormGroup, Slider, Switch, Tooltip } from "@mui/material";
import { FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import compositionMarks from '../data/compositiontype.json';
import { faListNumeric } from "@fortawesome/free-solid-svg-icons";

const Settings = (props) => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const tableNames = {
        "GLYCAN" : "Glycans",
        "COLLECTION": "Collections",
        "COC": "Collections of Collections",
        "GLYCANINCOLLECTION": "Glycans (in Collection)",
        "METADATA" : "Metadata",
        "DATASET" : "Dataset",
    }

    const [columnVisibility, setColumnVisibility] = useState({
        "GLYCAN" : {
            "glytoucanID": {
                "label": "GlyTouCan ID",
                "visible": true,
            },
            "status": {
                "label" : "Status",
                "visible": true,
            },
            "cartoon" : {
                "label" : "Cartoon",
                "visible": true,
            },
            "mass" : {
                "label" : "Mass",
                "visible": true,
            },
            "information" : {
                "label" : "Error",
                "visible": false,
            },
            "tags": {
                "label" : "Tags",
                "visible": true,
            },
            "collectionNo" : {
                "label" : "# Collections",
                "visible": false,
            },
        },
        "COLLECTION" : {
            "name" : {
                "label" : "Name",
                "visible": true,
            },
            "metadata" : {
                "label" : "# Metadata",
                "visible": true,
            },
            "glycanNo" : {
                "label" : "# Glycans",
                "visible": true,
            },
        },
        "COC" : {
            "name": {
                "label" : "Name",
                "visible": true,
            },
            "children": {
                "label" : "# Collections",
                "visible": true,
            },
        },
        "GLYCANINCOLLECTION" : {
            "glytoucanID": {
                "label" : "GlyTouCan ID",
                "visible": true,
            },
            "cartoon" : {
                "label" : "Cartoon",
                "visible": true,
            },
            "mass" : {
                "label" : "Mass",
                "visible": true,
            },
            "tags": {
                "label" : "Tags",
                "visible": true,
            },
        },
        "METADATA" : {
            "name" : {
                "label" : "Name",
                "visible" : true,
            },
            "typeDescr" : {
                "label" : "Description",
                "visible": true,
            },
            
            "value": {
                "label": 'Value',
                "visible": true,
            },
            "valueId": {
                "label": 'Value ID',
                "visible": false,
            },
            "valueUri": {
                "label": 'Value URI',
                "visible": false,
            },   
        },
        "DATASET" : {
            "name" : {
                "label" : "Name",
                "visible" : true,
            },
            "description" : {
                "label" : "Description",
                "visible" : true,
            }, 
            "glycanNo" : {
                "label" : "# Glycans",
                "visible" : true,
            },
            "proteinNo": {
                "label" : "# Proteins",
                "visible": false,
            },
            "license" : {
                "label" : "License",
                "visible": true,
            }
        }
    });   // map containing column visibility for each table type
    const [compositionType, setCompositionType] = useState (null); 
    const [compositionTypeDescription, setCompositionTypeDescription] = useState (compositionMarks[0].description);
    const [showSuccessMessage, setShowSuccessMessage]  = useState(null);

    useEffect(()=> {
          props.authCheckAgent && props.authCheckAgent();
          getJson("api/setting/getallcolumnsettings", getAuthorizationHeader()).then (({ data }) => {
            if (data.data) {
                let nextColumnVisibilty = {};
                let visibilityList = columnVisibility["GLYCAN"];
                data.data["GLYCAN"] && 
                    data.data["GLYCAN"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["GLYCAN"] =  {...visibilityList};
                visibilityList = columnVisibility["COLLECTION"];
                data.data["COLLECTION"] && 
                    data.data["COLLECTION"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["COLLECTION"]= {...visibilityList};
                visibilityList = columnVisibility["COC"];
                data.data["COC"] && 
                    data.data["COC"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["COC"] =  {...visibilityList};
                visibilityList = columnVisibility["GLYCANINCOLLECTION"];
                data.data["GLYCANINCOLLECTION"] && 
                    data.data["GLYCANINCOLLECTION"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["GLYCANINCOLLECTION"] = {...visibilityList};
                visibilityList = columnVisibility["METADATA"];
                data.data["METADATA"] && 
                    data.data["METADATA"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["METADATA"] = {...visibilityList};
                visibilityList = columnVisibility["DATASET"];
                data.data["DATASET"] && 
                    data.data["DATASET"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["DATASET"] = {...visibilityList};
                setColumnVisibility (nextColumnVisibilty);
            } 
          }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
          });
          getCompositionTypeSetting();
    }, []);

    function getCompositionTypeSetting () {
        getJson("api/setting/getsettings", getAuthorizationHeader()).then (({ data }) => {
            if (data.data && data.data.length > 0) {
                data.data.forEach ((setting) => {
                    if (setting.name && setting.name.toLowerCase() === "compositiontype") {
                        setCompositionType(setting.value);
                        const index = setting.value === "BASE" ? 0 : setting.value === "GLYGEN" ? 1 : 2;
                        setCompositionTypeDescription(compositionMarks[index].description);
                    }
                });
            } else {
                setCompositionType ("BASE"); // default
            }
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const saveColumnVisibilityChanges = (table) => {
        setShowSuccessMessage(null);
        var columnSettings = [];
        for (var column in columnVisibility[table]) {
          columnSettings.push ({
            "tableName": table,
            "columnName": column,
            "visible" :  columnVisibility[table][column]["visible"] ? true: false,
          });
        }
        postJson ("api/setting/updatecolumnsetting", columnSettings, getAuthorizationHeader()).then (({ data }) => {
          setShowSuccessMessage("Saved visibility settings for " + tableNames[table]);
        }).catch(function(error) {
          axiosError(error, null, setAlertDialogInput);
        });
      }
    
      function valuetext(value) {
        setCompositionType(value === 0 ? "BASE" : value === 1 ? "GLYGEN" : "DEFINED");
        return value;
     }

     const saveSettings = () => {
        setShowSuccessMessage(null);
        var setting = {
            "name" : "compositionType",
            "value" : compositionType
        };
        postJson ("api/setting/updatesetting", setting, getAuthorizationHeader()).then (({ data }) => {
            setShowSuccessMessage("Saved the composition type setting");
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });;
    }

    const showHideColumn = (e, column, table) => {
        console.log (e.target.checked + " column " + column + " table " + table);
        columnVisibility[table][column]["visible"] = e.target.checked;
        setColumnVisibility({...columnVisibility});
    }

    const getColumnVisibilityCards = () => {
        return Object.keys(columnVisibility).map ((table, index) => {
            return (
            <Card>
            <Card.Body>
            <div style={{marginLeft: '20px'}}>
            <div>
            <FormGroup>
                <FormLabel label={tableNames[table] + " Table Columns"}/>
                {Object.keys(columnVisibility[table]).map ((column, index) => {
                    return (
                        <FormControlLabel 
                        control={
                            <Switch checked={columnVisibility[table][column]["visible"]} onChange={(e) => showHideColumn(e, column, table)}/>
                        } label={columnVisibility[table][column]["label"]} />
                    );
                })}
            </FormGroup>
            </div>
            </div>
            <Tooltip title="Save composition type selection as default">
                <Button className="gg-btn-outline-reg mb-3 mt-3" 
                style={{ float: "right", marginLeft: "5px" }}
                onClick={()=>saveColumnVisibilityChanges(table)}>Save as default </Button>
            </Tooltip>
            </Card.Body>
            </Card>
            );
         })
    }

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
            <Container maxWidth="xl">
            <div className="page-container">
            <PageHeading
              title="Your Settings"
              subTitle="Below are the available settings for various tables in the system. You can make changes and save them"
            />
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
            />
            {showSuccessMessage && (
            <Alert variant="success" style={{ textAlign: "justify" }}>
              {showSuccessMessage}
            </Alert>
            )}
            <Card>
            <Card.Body>
              
              {compositionType && (
                <div>
                <div style={{marginLeft: '20px'}}>
                    <FormLabel  label="Composition Type"/>
                </div>
                <Row style={{marginLeft: '65px'}}>
                <Col>
                <Slider
                    aria-label="Composition Type"
                    defaultValue={compositionType === "BASE" ? 0: compositionType==="GLYGEN" ? 1: 2}
                    valueLabelDisplay="auto"
                    getAriaValueText={valuetext}
                    shiftStep={1}
                    step={1}
                    marks={compositionMarks}
                    min={0}
                    max={2}
                    onChange={(event, newValue) => {
                        setCompositionTypeDescription(compositionMarks[newValue].description);
                      }}
                    sx={{
                        "& .MuiSlider-mark": {
                            width: 10,
                            height: 10,
                            backgroundColor: '#1976d2',
                        },
                    }}
                    /></Col>
                <Col style={{ marginTop: '-20px'}}>
                    <Tooltip title="Save composition type selection as default">
                        <Button className="gg-btn-outline-reg mb-3 mt-3" 
                        style={{ float: "right", marginLeft: "5px" }} onClick={()=>saveSettings()}>Save as default </Button>
                    </Tooltip>
                </Col>
                </Row>
                
                {compositionTypeDescription && 
                <div style={{marginLeft: "20px", marginTop: "20px"}}>
                    <h6>{compositionTypeDescription}</h6></div>
                }
                </div>)}
             </Card.Body>
             </Card>

             {columnVisibility && getColumnVisibilityCards()}
            </div>
            </Container>
        </>
    );
}

export default Settings;