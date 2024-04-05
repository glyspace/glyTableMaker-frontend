import { useState } from "react";
import PropTypes from "prop-types";
import Tag from "./Tag";
import { Button } from "react-bootstrap";
import "./TagEdit.css";

const TagEdit = (props) => {
    const [tagList, setTagList] = useState(props.data);
    const [tag, setTag] = useState("");

    /*useEffect(() => {
        // load existing tags
        getJson (props.gettagws + "/" + props.rowId, getAuthorizationHeader()).then ( (json) => {
            setTagList(json.data.data);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                console.log("Failed to get list of existing glycan tags");
            } else {
              axiosError(error, null, props.setAlertDialogInput);
            }
          });
  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);*/

    const removeTags = index => {
        props.setTags([...tagList.filter(tag => tagList.indexOf(tag) !== index)]);
        setTagList([...tagList.filter(tag => tagList.indexOf(tag) !== index)]);
    };

    const addTags = () => {
        if ( tag !== '') {
           props.setTags([...tagList, tag])
           setTagList([...tagList, tag])
        }
    };
       
    return (
        <>

        <div className="tags-input">
            <ul id="tags">
                {tagList && tagList.length > 0 && tagList.map((tag, index) => (
                <li key={index} className="tag">
                    <span className='tag-title'>{tag}</span>
                    <span className='tag-close-icon'
                    onClick={() => removeTags(index)}
                    >
                    x
                    </span>
                </li>
                ))}
            </ul>
        </div>
        <div style={{marginTop: "15px", width:"660px"}}>
        <Tag validate={props.validate} setValidate={props.setValidate}
                setTag={setTag}
                setAlertDialogInput={props.setAlertDialogInput}
                gettagws={props.gettagws}
        />
        <Button className="gg-btn-blue-reg" onClick={()=> addTags()}>Add</Button>
        </div>
        </>
    );
}

TagEdit.propTypes = {
    setTags: PropTypes.func,
    gettagws: PropTypes.string,
    validate: PropTypes.bool,
    setValidate: PropTypes.func,
    setAlertDialogInput: PropTypes.func,          
}
export default TagEdit;