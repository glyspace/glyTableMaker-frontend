import { useReducer } from "react";
import { useNavigate } from "react-router-dom";
import TextAlert from "./TextAlert";
import { Button, Col, Image, Row } from "react-bootstrap";
import { Dialog } from "@mui/material";
import compositionList from '../data/composition.json';

const Composition = (props) => {
    const navigate = useNavigate();
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    let monoList = [];
    let monoListSecondCol = [];

    const getCompositionSelections = () => {
        compositionList.map (parent => {
            if (monoList.length > 13) {
                monoListSecondCol.push(parent);
            } else {
                monoList.push (parent);
            }
            if (parent.children) {
                parent.children.map (child => {
                    if (monoList.length > 13) {
                        monoListSecondCol.push(child);     
                    } else {
                        monoList.push(child); 
                    }
                });
            }
        })
        
        let rows = [];
        monoList.forEach ((parent, index) => {
                rows.push(
                <Row>
                <Col>
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/decrement.svg'}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/>
                    {parent.image ? 
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + parent.image}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/> : 
                    <span style={{width: "35px", height: "35px", marginLeft: "8px", marginRight: "17px"}}>{parent.id}</span>}
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/>
                </Col>
                    {monoListSecondCol[index] ? 
                    <Col> 
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/decrement.svg'}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/>
                    {monoListSecondCol[index].image ?   
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/' + monoListSecondCol[index].image}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/> 
                    : 
                    <span style={{width: "35px", height: "35px", marginLeft: "8px", marginRight: "17px"}}>{monoListSecondCol[index].id}</span> }
                    <Image
                        src={window.location.origin + 
                            (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/icons/svg/increment.svg'}
                        alt={parent.title} 
                        style={{width: "35px", height: "35px"}}/>
                    </Col> 
                    : <span></span>}
                </Row>);
        });

        return rows;
    };

    const createCompositionString = () => {
        // if no monosacchradide is selected, set textAlertInput
        // else create the string and set in the props
        props.setOpen(false);
        const glycan = { 
            composition: ""
        }
        props.submit(glycan);
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
                <h5 className="sups-dialog-title">{props.title}</h5>
                <div style={{ paddingTop: '2px', overflow: 'hidden', content: 'center', height: '73vh' }}>
                    <TextAlert alertInput={textAlertInput}/>
                    { getCompositionSelections() }
                </div>
                <div style={{ marginTop: "20px", marginRight: "50px" }}>
                    <Button
                        className='gg-btn-blue mb-5'
                        style={{ float: "right", marginLeft: "5px" }}
                        onClick={() => {createCompositionString()}}
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