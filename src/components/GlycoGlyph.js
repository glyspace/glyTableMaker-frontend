import React, { useReducer } from 'react';
import { Dialog } from "@mui/material";
import Iframe from "react-iframe";
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import TextAlert from './TextAlert';

/**
 * GlycoGlyph component for showing glyco glyph frame.
 */
const GlycoGlyph = (props) => {

    const navigate = useNavigate();
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
        );
    
    return (

        <Dialog
            open={props.show}
            fullScreen
            maxWidth={'lg'}
            classes={{
                paper: "alert-dialog",
            }}
            style={{ margin: 40 }}
            disableScrollLock
            onClose={() => {
                props.setOpen(false);
            }}
            onLoad={() => {
                //Select the frame element
                let iframe = document.getElementById('glycoGlyphFrame');
                if (iframe) {
                    //Select the element
                    let element = iframe.contentWindow.document.getElementById('cfg_name');
                    if (element) {
                        //Get the text content from the element
                        if (props.inputValue.glycoGlyphName !== "") {
                            element.value = props.inputValue.glycoGlyphName;
                        }
                    }
                    element = iframe.contentWindow.document.getElementById('glycoCT');

                    if (element) {
                        //Get the text content from the element
                        if (props.inputValue.sequence !== "") {
                            element.innerText = props.inputValue.sequence;
                        }
                    }
                }
            }
            }
        >
            <div style={{ overflow: 'hidden' }}>
                <h5 className="sups-dialog-title">{props.title}</h5>
                <div style={{ paddingTop: '2px', overflow: 'hidden', content: 'center', height: '73vh' }}>
                    <TextAlert alertInput={textAlertInput}/>
                    <Iframe
                        id="glycoGlyphFrame"
                        width="100%"
                        height="100%"
                        src={window.location.origin + (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME) + '/GlycoGlyphPublic/public/index_relative.html'}
                        frameBorder="0"
                        scrolling="yes"
                        allow="encrypted-media"
                        allowFullScreen={false}>
                    </Iframe>
                </div>
                <div style={{ marginTop: "20px", marginRight: "50px" }}>
                    <Button
                        className='gg-btn-blue mb-5'
                        style={{ float: "right" }}
                        onClick={() => {

                            //Select the frame element
                            let iframe = document.getElementById('glycoGlyphFrame');
                            if (iframe) {
                                let elementName = iframe.contentWindow.document.getElementById('cfg_name');
                                if (elementName) {
                                    //Get the text content from the element
                                    let elementText = elementName.innerText;

                                    if (elementName.tagName === 'INPUT') {
                                        elementText = elementName.value;
                                    }
                                    elementText = elementText.trim();
                                    props.setInputValue({ glycoGlyphName: elementText });
                                }
                                
                                //Select the element
                                let element = iframe.contentWindow.document.getElementById('glycoCT');

                                if (element) {
                                    //Get the text content from the element
                                    let elementText = element.innerText;

                                    if (element.tagName === 'INPUT') {
                                        elementText = element.value;
                                    }
                                    elementText = elementText.trim();
                                    props.glySequenceChange(elementText, true);

                                    if (elementText !== "") {
                                        props.setOpen(false);
                                        const glycan = { 
                                            sequence: elementText,
                                            format: "GLYCOCT",
                                        }
                                        props.submit(glycan);
                                    } else {
                                        setTextAlertInput ({"show": true, "message": "No glycan is drawn!"});
                                    }
                                }
                                else {
                                    setTextAlertInput ({"show": true, "message": "No glycan is drawn!"});
                                }
                            }
                            
                        }}
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


export default GlycoGlyph;