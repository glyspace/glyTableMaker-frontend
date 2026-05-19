import { useEffect, useReducer, useRef, useState } from "react";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import FeedbackWidget from "../components/FeedbackWidget";
import { Alert, Box, Container, FormControlLabel, FormGroup, Slider, Switch, Tooltip } from "@mui/material";
import { FormLabel, PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import compositionMarks from '../data/compositiontype.json';
import { faListNumeric } from "@fortawesome/free-solid-svg-icons";

const Settings = (props) => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [cartoon1, setCartoon1] = useState (null);
    const [cartoon2, setCartoon2] = useState (null);
    const [cartoon3, setCartoon3] = useState (null);
    const [cartoon4, setCartoon4] = useState (null);

    const tableNames = {
        "GLYCAN" : "Glycans",
        "COLLECTION": "Collections",
        "COC": "Collections of Collections",
        "GLYCANINCOLLECTION": "Glycans (in Collection)",
        "METADATA" : "Metadata",
        "DATASET" : "Dataset",
        "DATASETMETADATA" : "Public Dataset Glycan Metadata",
        "DATASETGLYCOPROTEINMETADATA" : "Public Dataset Glycoprotein Metadata",
        "GLYCOPROTEIN" : "Glycoproteins",
        "GLYCOPROTEININCOLLECTION": "Glycoproteins (in Collection)"
    }

    function useHeadings() {
        const [headings, setHeadings] = useState([]);
        useEffect(() => {
            let headingList = [];
            const imageElement = {"id": "cartoon", "text": "Glycan Cartoon Settings", "level": 1};
            const compElement = {"id" : "composition", "text": "Composition Settings", "level" : 1};
            const columnSettingElement = {"id" : "column", "text": "Column Settings", "level" : 1};
            headingList.push (imageElement);
            headingList.push (compElement);
            headingList.push (columnSettingElement)
            Object.keys(columnVisibility).map ((table, index) => {
                const e = {
                id: index,
                text: tableNames[table] + " Table Columns",
                level: 2
                };
                headingList.push (e);
            });
            setHeadings(headingList);
        }, []);
        return headings;
      }

    function useScrollSpy(
        ids,
        options
      ) {
        const [activeId, setActiveId] = useState();
        const observer = useRef();
        useEffect(() => {
          const elements = ids.map((id) =>
            document.getElementById(id)
          );
          observer.current?.disconnect();
          observer.current = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry?.isIntersecting) {
                setActiveId(entry.target.id);
              }
            });
          }, options);
          elements.forEach((el) => {
            if (el) {
              observer.current?.observe(el);
            }
          });
          return () => observer.current?.disconnect();
        }, [ids, options]);
        return activeId;
    }

    function TableOfContent() {
        const headings = useHeadings();
        const activeId = useScrollSpy(
          headings.map(({ id }) => id),
          { rootMargin: "0% 0% -20% 0%" }
        );
        return (
          <div style={{ position: "relative"}}>
            <h4>Table of Contents</h4>
          <nav>
            <ul>
              {headings.map(heading => (
                <li key={heading.id} style={{ marginLeft: `${heading.level}em` }}>
                  <a 
                    href={`#${heading.id}`} 
                    style={{ 
                      fontWeight: activeId === heading.id ? "bold" : "normal" 
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          </div>
        );
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
        "GLYCOPROTEIN" : {
            "uniprotId": {
                "label": "UniProtKB Accession",
                "visible": true,
            },
            "name": {
                "label" : "Name",
                "visible": true,
            },
            "siteNo" : {
                "label" : "# Sites",
                "visible": true,
            },
            "tags": {
                "label" : "Tags",
                "visible": true,
            },
        },
        "GLYCOPROTEININCOLLECTION" : {
            "uniprotId": {
                "label": "UniProtKB Accession",
                "visible": true,
            },
            "name": {
                "label" : "Name",
                "visible": true,
            },
            "siteNo" : {
                "label" : "# Sites",
                "visible": true,
            },
            "tags": {
                "label" : "Tags",
                "visible": true,
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
            "proteinNo" : {
                "label" : "# Proteins",
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
        },
        "DATASETMETADATA" : {
            "GLYTOUCANID" : {
                "label" : "GlyTouCan ID",
                "visible" : true,
            },
            "cartoon" : {
                "label" : "Image",
                "visible" : true,
            }, 
            "2" : {
                "label" : "Evidence",
                "visible" : true,
            },
            "3": {
                "label" : "Species",
                "visible": true,
            },
            "3-ID": {
                "label" : "Species ID",
                "visible": true,
            },
            "4" : {
                "label" : "Strain",
                "visible": true,
            },
            "5" : {
                "label" : "Tissue",
                "visible" : true,
            },
            "5-ID" : {
                "label" : "Tissue ID",
                "visible" : true,
            },
            "6" : {
                "label" : "Cell line",
                "visible" : true,
            }, 
            "6-ID" : {
                "label" : "Cell line ID",
                "visible" : true,
            }, 
            "7" : {
                "label" : "Disease",
                "visible" : true,
            },
            "7-ID" : {
                "label" : "Disease ID",
                "visible" : true,
            },
            "8": {
                "label" : "Glycan dictionary term ID",
                "visible": true,
            },
            "9" : {
                "label" : "has_abundance",
                "visible": true,
            },
            "10" : {
                "label" : "has_expression",
                "visible": true,
            },
            "11" : {
                "label" : "Functional annotation/Keyword",
                "visible" : true,
            },
            "12" : {
                "label" : "Experimental technique",
                "visible" : true,
            }, 
            "13" : {
                "label" : "Variant (Fly, yeast, mouse)",
                "visible" : true,
            },
            "14": {
                "label" : "Organismal/cellular Phenotype",
                "visible": true,
            },
            "14-ID": {
                "label" : "Organismal/cellular Phenotype ID",
                "visible": true,
            },
            "15" : {
                "label" : "Molecular Phenotype",
                "visible": true,
            },
            "18-ID" : {
                "label" : "Cellular Component ID",
                "visible": true,
            },
            "18": {
                "label" : "Cellular Component",
                "visible": true,
            },
            "16" : {
                "label" : "Contributor",
                "visible": true,
            },
            "17" : {
                "label" : "Comment",
                "visible": true,
            }
        },
        "DATASETGLYCOPROTEINMETADATA" : {
            "UNIPROTID": {
                "label" : 'UniProtKB Accession',
                "visible" : true,
            },
            "GLYTOUCANID" : {
                "label" : "GlyTouCan ID",
                "visible" : true,
            },
            "cartoon" : {
                "label" : "Image",
                "visible" : true,
            }, 
            "AMINOACID" : {
                "label" : "Amino Acid",
                "visible" : true,
            },
            "SITE" : {
                "label" : "Site/Position",
                "visible" : true,
            },
            "GLYCOSYLATIONTYPE" : {
                "label" : "Glycosylation Type",
                "visible" : true,
            },
            "GLYCOSYLATIONSUBTYPE" : {
                "label" : "Glycosylation Subtype",
                "visible" : true,
            },
            "2" : {
                "label" : "Evidence",
                "visible" : true,
            },
            "3": {
                "label" : "Species",
                "visible": true,
            },
            "3-ID": {
                "label" : "Species ID",
                "visible": true,
            },
            "4" : {
                "label" : "Strain",
                "visible": true,
            },
            "5" : {
                "label" : "Tissue",
                "visible" : true,
            },
            "5-ID" : {
                "label" : "Tissue ID",
                "visible" : true,
            },
            "6" : {
                "label" : "Cell line",
                "visible" : true,
            }, 
            "6-ID" : {
                "label" : "Cell line ID",
                "visible" : true,
            }, 
            "7" : {
                "label" : "Disease",
                "visible" : true,
            },
            "7-ID" : {
                "label" : "Disease ID",
                "visible" : true,
            },
            "11" : {
                "label" : "Functional annotation/Keyword",
                "visible" : true,
            },
            "12" : {
                "label" : "Experimental technique",
                "visible" : true,
            }, 
            "16" : {
                "label" : "Contributor",
                "visible": true,
            },
            "17" : {
                "label" : "Comment",
                "visible": true,
            }, 
            "18-ID" : {
                "label" : "Cellular Component ID",
                "visible": true,
            },
            "18": {
                "label" : "Cellular Component",
                "visible": true,
            },
        }
    });   // map containing column visibility for each table type

    const [compositionType, setCompositionType] = useState (null); 
    const [compositionTypeDescription, setCompositionTypeDescription] = useState (compositionMarks[0].description);
    const [showSuccessMessage, setShowSuccessMessage]  = useState(null);
    const [cartoonSetting, setCartoonSetting] = useState ({"display": "extended", "redEnd": "y"});

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

                visibilityList = columnVisibility["GLYCOPROTEIN"];
                data.data["GLYCOPROTEIN"] && 
                    data.data["GLYCOPROTEIN"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["GLYCOPROTEIN"] =  {...visibilityList};

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

                visibilityList = columnVisibility["GLYCOPROTEININCOLLECTION"];
                data.data["GLYCOPROTEININCOLLECTION"] && 
                    data.data["GLYCOPROTEININCOLLECTION"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["GLYCOPROTEININCOLLECTION"] = {...visibilityList};

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

                visibilityList = columnVisibility["DATASETMETADATA"];
                data.data["DATASETMETADATA"] && 
                    data.data["DATASETMETADATA"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["DATASETMETADATA"] = {...visibilityList};

                visibilityList = columnVisibility["DATASETGLYCOPROTEINMETADATA"];
                data.data["DATASETGLYCOPROTEINMETADATA"] && 
                    data.data["DATASETGLYCOPROTEINMETADATA"].map ((setting, index) => {
                        if (visibilityList[setting.columnName]) {
                            visibilityList[setting.columnName]["visible"] = setting.visible;
                        }
                });
                nextColumnVisibilty["DATASETGLYCOPROTEINMETADATA"] = {...visibilityList};
                
                setColumnVisibility (nextColumnVisibilty);
            } 
          }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
          });
          getOtherSettings();
          getCartoonOptions();
    }, []);

    function getCartoonOptions () {
        getJson("api/util/getcartoon?glytoucanId=G85966NB&display=extended&redEnd=y").then (({ data }) => {
            setCartoon1(data.data);
        });
        getJson("api/util/getcartoon?glytoucanId=G85966NB&display=extended&redEnd=n").then (({ data }) => {
            setCartoon2(data.data);
        });
        getJson("api/util/getcartoon?glytoucanId=G85966NB&display=compact&redEnd=y").then (({ data }) => {
            setCartoon3(data.data);
        });
        getJson("api/util/getcartoon?glytoucanId=G85966NB&display=compact&redEnd=n").then (({ data }) => {
            setCartoon4(data.data);
        });
    }

    function getOtherSettings () {
        getJson("api/setting/getsettings", getAuthorizationHeader()).then (({ data }) => {
            if (data.data && data.data.length > 0) {
                data.data.forEach ((setting) => {
                    if (setting.name && setting.name.toLowerCase() === "compositiontype") {
                        setCompositionType(setting.value);
                        const index = setting.value === "BASE" ? 0 : setting.value === "GLYGEN" ? 1 : 2;
                        setCompositionTypeDescription(compositionMarks[index].description);
                    } else if (setting.name && (setting.name.toLowerCase() === "display" || setting.name.toLowerCase() === "redend")) {
                        setCartoonSetting(prev => ({
                            ...prev,
                            [setting.name]: setting.value
                            }));
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
        });
    }

    const saveCartoonSettings = () => {
        setShowSuccessMessage(null);
        
        var setting = {
            "name" : "display",
            "value" : cartoonSetting.display
        };
        postJson ("api/setting/updatesetting", setting, getAuthorizationHeader()).then (({ data }) => {
            setShowSuccessMessage("Saved the cartoon setting");
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });

        var setting = {
            "name" : "redEnd",
            "value" : cartoonSetting.redEnd
        };
        postJson ("api/setting/updatesetting", setting, getAuthorizationHeader()).then (({ data }) => {
            setShowSuccessMessage("Saved the cartoon setting");
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
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
            <div style={{marginLeft: '20px'}} id={index}>
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

    const handleChange = e => {
        const flag = e.target.checked;
        const id = e.currentTarget.id;
        if (id === "extended" || id === "compact") {
            setCartoonSetting({
                   ...cartoonSetting,
                   display: id});
        } else if (id === "redEnd" || id === "noRedEnd") {
            setCartoonSetting({...cartoonSetting, "redEnd": (id === "redEnd" ? "y": "n")});
        }
    }

    const getCartoonSettings = () => {
        return (
        <Card>
            <Card.Body>
            <div style={{marginLeft: '20px'}}>
            <FormGroup>
                <FormLabel label="Cartoon Settings"/>
                <Box sx={{ textAlign: "center", marginBottom: "10px"}}>
                <img 
                    src={"data:image/png;base64, " + 
                        (cartoonSetting.display === "extended" ? (cartoonSetting.redEnd === "y" ? cartoon1 : cartoon2) : 
                        (cartoonSetting.redEnd === "y" ? cartoon3 : cartoon4))} 
                    alt="cartoon" />
                </Box>
                <Row>
                <Col>
                <span>Display</span>
                </Col>
                <Col>
                <FormControlLabel 
                        control={
                            <Form.Check
                                    type="radio"
                                    name="displayGroup"
                                    id="extended"
                                    checked={cartoonSetting.display === "extended"}
                                    onChange={handleChange}/>
                } label="extended" />
                </Col>
                <Col>
                <FormControlLabel 
                        control={
                            <Form.Check
                                    type="radio"
                                    name="displayGroup"
                                    id="compact"
                                    checked={cartoonSetting.display === "compact"}
                                    onChange={handleChange}/>} label="compact" />
                </Col>
                </Row>
                <Row>
                <Col>
                <span>Reducing End</span>
                </Col>
                <Col>
                <FormControlLabel 
                        control={
                            <Form.Check
                                    type="radio"
                                    name="redEndGroup"
                                    id="redEnd"
                                    checked={cartoonSetting.redEnd === "y"}
                                    onChange={handleChange}/>
                } label="show" />
                </Col>
                <Col>
                <FormControlLabel 
                        control={
                            <Form.Check
                                    type="radio"
                                    name="redEndGroup"
                                    id="noRedEnd"
                                    checked={cartoonSetting.redEnd === "n"}
                                    onChange={handleChange}/>} label="do not show" />
                </Col>
                </Row>
            </FormGroup>
            </div>
            <Tooltip title="Save cartoon settings as default">
                <Button className="gg-btn-outline-reg mb-3 mt-3" 
                style={{ float: "right", marginLeft: "5px" }}
                onClick={()=>saveCartoonSettings()}>Save as default </Button>
            </Tooltip>
            </Card.Body>
        </Card>)
    }

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
           
            <Container maxWidth="xl">
            <div className="page-container">
            <PageHeading
              title="Your Settings"
              subTitle="Below are the available settings for glycan images and various tables in the system. You can make changes and save them"
            />
            {<TableOfContent/>}
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
            
            <div id="cartoon">
                {getCartoonSettings()}
            </div>
            
            <Card>
            <Card.Body>    
              {compositionType && (
                <div>
                <div style={{marginLeft: '20px'}} id="composition">
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
            <div id="column">
             {columnVisibility && getColumnVisibilityCards()}
             </div>
            </div>
            </Container>
        </>
    );
}

export default Settings;