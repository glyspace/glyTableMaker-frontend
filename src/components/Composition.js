import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import TextAlert from "./TextAlert";
import { Button, Col, Image, Row } from "react-bootstrap";
import { Dialog } from "@mui/material";
import compositionList from '../data/composition.json';
import "./Composition.css";

const Composition = (props) => {
    const navigate = useNavigate();
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [compositionString, setCompositionString] = useState ("");

    const [monoList, setMonoList] = useState([]);
    const [monoListSecondCol, setMonoListSecondCol] = useState([]);

    useEffect (() => {
        let mono1 = [];
        let mono2 = [];
        compositionList.map (mono => {
            let monoWithCount = {};
            monoWithCount.mono = mono;
            monoWithCount.count = 0;
            if (mono1.length > 12) {
                mono2.push(monoWithCount);
            } else {
                mono1.push (monoWithCount);
            }
        });
        setMonoList(mono1);
        setMonoListSecondCol(mono2);
    }, []);

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
                        className="counter-image"
                        id={monoWithCount.mono.id + "decrement"}
                        onClick={() => changeCount (monoWithCount, false)}/>
                    {monoWithCount.mono.image ? 
                    <object
                        data={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoWithCount.mono.image}
                        type="image/svg+xml"
                        alt={monoWithCount.mono.title} 
                        id={monoWithCount.mono.id}
                        className="comp-image"> 
                        monoWithCount.mono.id </object> : 
                    <span className="comp-text">{monoWithCount.mono.id}</span>}
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt="incrementing"
                        className="counter-image"
                        onClick={() => changeCount (monoWithCount, true)}/>
                </Col>
                    {monoListSecondCol[index] ? 
                    <Col> 
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) 
                            + (monoListSecondCol[index].count === 0 ? '/icons/svg/decrement-gray.svg' : '/icons/svg/decrement.svg')}
                        alt="decrementing" 
                        className="counter-image"
                        id={monoListSecondCol[index].mono.id+ "decrement"}
                        onClick={() => changeCount (monoListSecondCol[index], false)}/>
                    {monoListSecondCol[index].mono.image ?   
                    <object
                        data={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoListSecondCol[index].mono.image}
                        alt={monoListSecondCol[index].mono.title} 
                        id={monoListSecondCol[index].mono.id}
                        className="comp-image"> 
                        monoListSecondCol[index].mono.id</object>
                    : 
                    <span className="comp-text">{monoListSecondCol[index].mono.id}</span> }
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt="incrementing"
                        className="counter-image"
                        onClick={() => changeCount (monoListSecondCol[index], true)}/>
                    </Col> 
                    : <span></span>}
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
        })
        monoListSecondCol.forEach ((element) => {
            if (element.count > 0) {
                composition += element.mono.id + ":" + element.count + "|";
            }
        })
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
            props.submit(glycan);
        } 
    }

    return (
        <Dialog
            open={props.show}
            fullScreen
            maxWidth={'lg'}
            classes={{
                paper: "alert-dialog",
            }}
            style={{ margin: 40 }}
            onClose={() => {
                props.setOpen(false);
            }}
            onLoad={() => {
            }}
        >
            <div style={{ overflow: 'hidden' }}>
                <h5 className="sups-dialog-title">{props.title}: {compositionString}</h5>
                <div style={{ paddingTop: '2px', overflow: 'hidden', content: 'center', height: '73vh' }}>
                    <TextAlert alertInput={textAlertInput}/>
                    { monoList.length > 0 && getCompositionSelections() }
                </div>
                <div style={{ marginTop: "20px", marginRight: "50px" }}>
                    <Button
                        className='gg-btn-blue mb-5'
                        style={{ float: "right", marginLeft: "5px" }}
                        onClick={() => {createCompositionString(true)}}
                    >
                        Add Glycan
                    </Button>
                    <Button
                        className='gg-btn-outline mr-3 mb-5'
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