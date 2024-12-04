import { Row, Col, Form } from "react-bootstrap";
import { FormLabel } from "./FormControls";
import { useReducer } from "react";

const ExcelParameters = (props) => {

    const paramResource = {
        sheetNumber: 1,
        columnNo: 1,
        startRow: 1
    };
    
    const [parameters, setParameters] = useReducer((state, newState) => ({ ...state, ...newState }), paramResource);

    const handleChange = e => {
        const name = e.target.name;
        const value = e.target.value;
        setParameters({ [name]: value });
        props.setParameters && props.setParameters({ [name]: value });
      };

    return (
        <Form>
            <Form.Group as={Row} controlId="sheet" className="gg-align-center mb-3">
            <Col xs={12} lg={9}>
                <FormLabel label="Sheet number"/>
                <Form.Control 
                    type="text" 
                    name="sheetNumber" 
                    value={parameters.sheetNumber} 
                    onChange={handleChange} />
            </Col>
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