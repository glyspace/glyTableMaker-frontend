import { Col, Form, Row } from "react-bootstrap";
import { Feedback} from "./FormControls";
import { useEffect, useState } from "react";
import { getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import PropTypes from "prop-types";

const Tag = (props) => {
    const [existing, setExisting] = useState(true);
    const [tagList, setTagList] = useState([]);
    const [newValue, setNewValue] = useState(null);

    useEffect(() => {
        // load existing tags
        getJson (props.gettagws, getAuthorizationHeader()).then ( (json) => {
            setTagList(json.data.data);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                console.log("Failed to get list of existing glycan tags");
            } else {
              axiosError(error, null, props.setAlertDialogInput);
            }
          });
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectionChange = e => {
        let tag = e.target.options[e.target.selectedIndex].value;
        if (tag !== "") {
            props.setTag(tag);
            props.setValidate(false);
        }
    }

    const handleInputChange = e => {
        const val = e.target.value;  
        if (val.trim().length > 1) {
            props.setValidate(false);
        }
        setNewValue(val);
        props.setTag(val);
    };

    const handleChange = e => {
        const flag = e.target.checked;
        const id = e.currentTarget.id;
        if (flag && id === "existingTag") {
            setExisting(true);
            props.setTag("");
        } else if (flag) {  // text field is selected
            if (newValue) props.setTag(newValue);
            setExisting(false);
        } else {
            props.setTag("");
            setExisting (false);
        }
    }

    return (
        <Form>
            <Form.Group
                as={Row}
                controlId="tag"
                className="mb-3"
            >
                <Col xs={2} lg={1}>
                    <Form.Check
                        type="radio"
                        name="tagGroup"
                        id="existingTag"
                        defaultChecked={true}
                        onChange={handleChange}/>
                </Col>
                <Col xs={6} lg={8}>
                    <Form.Select
                        disabled={!existing}
                        onChange={handleSelectionChange}>
                        <option value="">Select</option>
                        {tagList.map((glycanTag, index) => {
                        return (
                            <option value={glycanTag.label} key={index}>
                            {glycanTag.label}
                            </option>
                        );
                        })}
                    </Form.Select>
                </Col>
            </Form.Group>
            <Form.Group
                as={Row}
                controlId="tag"
                className="mb-3">
                <Col xs={2} lg={1}>
                    <Form.Check
                        type="radio"
                        name="tagGroup"
                        id="newTag"
                        onChange={handleChange}/>
                </Col>
                <Col xs={6} lg={8}>
                    <Form.Control
                        type="text"
                        name="tag"
                        disabled={existing}
                        placeholder="Enter tag for all the glycans from this file"
                        isInvalid={props.validate}
                        onChange={handleInputChange}
                    />
                    <Feedback message="Please enter a valid tag" />
                </Col>
            </Form.Group>
        </Form>
    );
};

Tag.propTypes = {
    setTag: PropTypes.func,
    setAlertDialogInput: PropTypes.func,
    validate: PropTypes.bool,
    setValidate: PropTypes.func,
    gettagws: PropTypes.string,
  };

export default Tag;