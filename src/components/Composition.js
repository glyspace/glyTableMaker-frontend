import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextAlert from "./TextAlert";
import { Button, Col, Image, Row } from "react-bootstrap";
import { Box, Dialog, FormControlLabel, FormGroup, Slider, Switch, Tooltip } from "@mui/material";
import compositionList from '../data/composition.json';
import compositionMarks from '../data/compositiontype.json';
import "./Composition.css";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

const Composition = (props) => {
    const navigate = useNavigate();
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [compositionString, setCompositionString] = useState ("");
    const [compositionType, setCompositionType] = useState(null);
    const [compositionTypeDescription, setCompositionTypeDescription] = useState (compositionMarks[0].description);

    const [monoList, setMonoList] = useState([]);
    const [monoListSecondCol, setMonoListSecondCol] = useState([]);
    const [monoListThirdCol, setMonoListThirdCol] = useState([]);

    const [showName, setShowName] = useState(false);

    useEffect (() => {
        let mono1 = [];
        let mono2 = [];
        let mono3 = [];
        compositionList.map (mono => {
            let monoWithCount = {};
            monoWithCount.mono = mono;
            monoWithCount.count = 0;
            if (mono2.length > 8) {
                mono3.push(monoWithCount);
            } else if (mono1.length > 8){
                mono2.push (monoWithCount);
            } else {
                mono1.push (monoWithCount);
            }
        });
        setMonoList(mono1);
        setMonoListSecondCol(mono2);
        setMonoListThirdCol(mono3);

        //load user settings and set the compositionType
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
            axiosError(error, null, props.setAlertDialogInput);
        });
    }

    const changeCount = (element, increment) => {
        if (increment) {
            element.count = element.count + 1; 
        } else if (element.count > 0) {
            element.count = element.count - 1;
        }

        let decr = document.getElementById(element.mono.id+"decrement");
        if (decr) {
            decr.src = window.location.origin + 
            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME)
            + (element.count === 0 ? '/icons/svg/decrement-gray.svg' : '/icons/svg/decrement.svg')
        }
    
        let svgobject = document.getElementById(element.mono.id);
        if (svgobject) {
            let svg =  svgobject.contentDocument;
            if (svg) {
                let tspan = svg.getElementById("counter");
                tspan.textContent = element.count+"";
            }
        }

        createCompositionString(false);
        
    }

    const getCompositionSelections = () => {   
        let rows = [];
        monoList.forEach ((monoWithCount, index) => {
                rows.push(
                <Row>
                <Col>
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) 
                            + (monoWithCount.count === 0 ? '/icons/svg/decrement-gray.svg' : '/icons/svg/decrement.svg')}
                        alt="decrementing" 
                        title="decrement"
                        className="counter-image"
                        id={monoWithCount.mono.id + "decrement"}
                        onClick={() => changeCount (monoWithCount, false)}/>
                    {monoWithCount.mono.image ? 
                    <object
                        data={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoWithCount.mono.image}
                        type="image/svg+xml"
                        alt={monoWithCount.mono.name} 
                        id={monoWithCount.mono.id}
                        className="comp-image"> 
                        {monoWithCount.mono.id}</object>
                         : 
                    <span className="comp-text">{monoWithCount.mono.id}</span>}
                    {showName && <span className="comp-text">{monoWithCount.mono.id}</span>}
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt="incrementing"
                        title="increment"
                        className="counter-image"
                        onClick={() => changeCount (monoWithCount, true)}/>
                        <span class="tooltip-text top">{monoWithCount.mono.id}</span>
                </Col>
                    {monoListSecondCol[index] ? 
                    <Col> 
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) 
                            + (monoListSecondCol[index].count === 0 ? '/icons/svg/decrement-gray.svg' : '/icons/svg/decrement.svg')}
                        alt="decrementing" 
                        title="decrement"
                        className="counter-image"
                        id={monoListSecondCol[index].mono.id+ "decrement"}
                        onClick={() => changeCount (monoListSecondCol[index], false)}/>
                    {monoListSecondCol[index].mono.image ?   
                    <object
                        data={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoListSecondCol[index].mono.image}
                        alt={monoListSecondCol[index].mono.name} 
                        id={monoListSecondCol[index].mono.id}
                        className="comp-image"> 
                       {monoListSecondCol[index].mono.id}</object>
                    : 
                    <span className="comp-text">{monoListSecondCol[index].mono.id}</span> }
                    {showName && <span className="comp-text">{monoListSecondCol[index].mono.id}</span>}
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt="incrementing"
                        title="increment"
                        className="counter-image"
                        onClick={() => changeCount (monoListSecondCol[index], true)}/>
                    </Col> 
                    : <span></span>}
                    {monoListThirdCol[index] ? 
                    <Col> 
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) 
                            + (monoListThirdCol[index].count === 0 ? '/icons/svg/decrement-gray.svg' : '/icons/svg/decrement.svg')}
                        alt="decrementing" 
                        title="decrement"
                        className="counter-image"
                        id={monoListThirdCol[index].mono.id+ "decrement"}
                        onClick={() => changeCount (monoListThirdCol[index], false)}/>
                    {monoListThirdCol[index].mono.image ?   
                    <object
                        data={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoListThirdCol[index].mono.image}
                        alt={monoListThirdCol[index].mono.name} 
                        id={monoListThirdCol[index].mono.id}
                        className="comp-image"> 
                        {monoListThirdCol[index].mono.id}</object>
                    : 
                    <span className="comp-text">{monoListThirdCol[index].mono.id}</span> }
                    {showName && <span className="comp-text">{monoListThirdCol[index].mono.id}</span>}
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt="incrementing"
                        title="increment"
                        className="counter-image"
                        onClick={() => changeCount (monoListThirdCol[index], true)}/>
                    </Col> 
                    : <Col></Col>}
                </Row>);
        });

        return rows;
    };

    const createCompositionString = (commit) => {
        // if no monosacchradide is selected, set textAlertInput
        // else create the string and set in the props
        let composition = "";
        monoList.forEach ((element) => {
            if (element.count > 0) {
                composition += element.mono.id + ":" + element.count + "|";
            }
        });
        monoListSecondCol.forEach ((element) => {
            if (element.count > 0) {
                composition += element.mono.id + ":" + element.count + "|";
            }
        });
        monoListThirdCol.forEach ((element) => {
            if (element.count > 0) {
                composition += element.mono.id + ":" + element.count + "|";
            }
        });
        if (commit && composition === "") {
            // error
            setTextAlertInput ({"show": true, "message": "No selection has been made!"});
            return;
        }
        else if (composition && composition.endsWith("|")) {
            composition = composition.substring(0, composition.length-1);
        }

        setCompositionString (composition);

        if (commit) {
            props.setOpen(false);
            const glycan = { 
                composition: composition
            }
            props.submit(glycan, compositionType);
        } 
    }

    const getCompositionDisplay = () => {
        let compo = [];
        compo.push (<span> </span>)
        monoList.forEach ((element) => {
            if (element.count > 0) {
                compo.push (<span>{element.mono.id}<sub>{element.count}</sub> </span>);
            }
        });
        monoListSecondCol.forEach ((element) => {
            if (element.count > 0) {
                compo.push (<span>{element.mono.id}<sub>{element.count}</sub> </span>);
            }
        });
        monoListThirdCol.forEach ((element) => {
            if (element.count > 0) {
                compo.push (<span>{element.mono.id}<sub>{element.count}</sub> </span>);
            }
        });
        return compo;
    }

    function valuetext(value) {
       setCompositionType(value == 0 ? "BASE" : value== 1 ? "GLYGEN" : "DEFINED");
       return value;
    }

    const showNames = e => {
        setShowName (e.target.checked);
    }

    const saveSettings = () => {
        var setting = {
            "name" : "compositionType",
            "value" : compositionType
        };
        postJson ("api/setting/updatesetting", setting, getAuthorizationHeader()).then (({ data }) => {
            console.log ("saved the setting ");
        }).catch(function(error) {
            axiosError(error, null, props.setAlertDialogInput);
        });;
    }

    return (
        <Dialog
            open={props.show}
            maxWidth={'lg'}
            classes={{
                paper: "alert-dialog",
            }}
            style={{ margin: 30 }}
            onClose={() => {
                props.setOpen(false);
            }}
            onLoad={() => {
            }}
        >
            <div style={{ overflow: 'hidden' }}>
                <Row className="sups-dialog-title">
                <Col><h5 >{props.title}:
                    {getCompositionDisplay()}</h5></Col>
                <Col style={{display:'flex', justifyContent:'right'}}>
                <FormGroup>
                    <FormControlLabel 
                        control={
                            <Switch color='error' onChange={showNames}
                            sx={{
                                "&.MuiSwitch-root .MuiSwitch-switchBase": {
                                  color: "white"
                                },
                              
                                "&.MuiSwitch-root .Mui-checked": {
                                 color: "#1c4e78"
                                }
                               }}/>
                        } label="Show Names" />
                </FormGroup>
                </Col>
                </Row>
                <div style={{ paddingTop: '2px', overflow: 'hidden', content: 'center', height: '64%' }}>
                    <TextAlert alertInput={textAlertInput}/>
                    { monoList.length > 0 && getCompositionSelections() }
                </div>
                {compositionType && (
                <div style={{height: '18%'}}>
                <h5 style={{marginLeft: "20px", marginTop: '15px'}}>Composition Type</h5>
                <Row style={{marginLeft: '77px', marginRight: '50px'}}>
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
                <Col style={{display: 'flex', justifyContent:'right', marginTop: '-20px'}}>
                    <Tooltip title="Save composition type selection as default">
                        <Button className="gg-btn-outline-reg mb-3 mt-3" onClick={()=>saveSettings()}>Save as default </Button>
                    </Tooltip>
                </Col>
                </Row>
                
                {compositionTypeDescription && 
                <div style={{marginLeft: "20px"}}>
                    <h6>{compositionTypeDescription}</h6></div>
                }
                </div>)}
                <div style={{ marginRight: "50px", height: '18%'}}>
                    <Button
                        className='gg-btn-blue mb-3 mt-3'
                        style={{ float: "right", marginLeft: "5px" }}
                        onClick={() => {createCompositionString(true)}}
                    >
                        Add Glycan
                    </Button>
                    <Button
                        className='gg-btn-outline mr-3 mb-3 mt-3'
                        style={{ float: "right" }}
                        onClick={() => {
                            props.setOpen(false);
                            navigate("/glycans");}}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </Dialog>
    )
};

export default Composition;