import { Row, Col, Form } from "react-bootstrap";
import { FormLabel } from "./FormControls";
import { useReducer, useState } from "react";

const ExcelParameters = (props) => {

    const paramResource = {
        sheetNumber: 1,
        columnNo: 1,
        startRow: 1,
        sheetName: ""
    };
    
    const [parameters, setParameters] = useReducer((state, newState) => ({ ...state, ...newState }), paramResource);
    const [enableSheetNumber, setEnableSheetNumber] = useState (true);

    const handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;

        setParameters({...parameters, [name]: value });
        props.setParameters && props.setParameters({...parameters, [name]: value });
      };

    const handleRadioChange = e => {
        const flag = e.target.checked;
        const id = e.currentTarget.id;
        if (flag && id === "sNo") {
            setEnableSheetNumber(true);
            setParameters ({...parameters, "sheetName": ""});
            props.setParameters && props.setParameters({...parameters, "sheetName": "" });
        }
        else {
            setEnableSheetNumber(false);
            setParameters ({...parameters, "sheetNumber": ""});
            props.setParameters && props.setParameters({...parameters, "sheetNumber": "" });
        }
    }

    return (
        <Form>
            <Form.Group as={Row} controlId="sheet" className="mb-3">
            <Row className="gg-align-center">
            <Col xs={6} lg={4}>
                <Row>
                <Col xs={1}>
                    <Form.Check type="radio" name="group1" id="sNo" defaultChecked={true} onChange={handleRadioChange}/>
                </Col>
                <Col xs={11}>
                    <FormLabel label="Sheet number"/>
                </Col>
                </Row>
                <Form.Control 
                    type="text" 
                    name="sheetNumber" 
                    value={parameters.sheetNumber} 
                    disabled={!enableSheetNumber}
                    onChange={handleChange}/>
            </Col>
            
            <Col xs={6} lg={5}>
                <Row>
                    <Col xs={1}>
                        <Form.Check type="radio" name="group1" id="sName" onChange={handleRadioChange}/>
                    </Col>
                    <Col xs={11}>
                        <FormLabel label="Sheet name"/>
                    </Col>
                </Row>
                <Form.Control 
                    type="text" 
                    name="sheetName" 
                    disabled={enableSheetNumber}
                    value={parameters.sheetName} 
                    onChange={handleChange} />
            </Col>
            </Row>
            </Form.Group>
           
            <Form.Group as={Row} controlId="colNo" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
                <FormLabel label="Column Number"/>
                <Form.Control 
                    type="text" 
                    name="columnNo" 
                    value={parameters.columnNo} 
                    onChange={handleChange} />
            </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="rowNo" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
                <FormLabel label="Start Row"/>
                <Form.Control 
                    type="text" 
                    name="startRow" 
                    value={parameters.startRow} 
                    onChange={handleChange} />
            </Col>
            </Form.Group>
        </Form>
    );
}

export default ExcelParameters;