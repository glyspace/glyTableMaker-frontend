import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField,} from "@mui/material"
import FeedbackWidget from "../components/FeedbackWidget"
import { useEffect, useMemo, useReducer, useState } from "react";
import DialogAlert from "../components/DialogAlert";
import { PageHeading } from "../components/FormControls";
import { Card } from "react-bootstrap";
import { Loading } from "../components/Loading";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import { axiosError } from "../utils/axiosError";
import Table from "../components/Table";
import { ConfirmationModal } from "../components/ConfirmationModal";

const TagManagement = (props) => {

    useEffect(() => {
        props.authCheckAgent && props.authCheckAgent();
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [tagSelected, setTagSelected] = useState(null);
    const [showEditTag, setShowEditTag] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [labelError, setLabelError] = useState("");
    const [tagToDelete, setTagToDelete] = useState(null);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
    );

    const fetchData = async () => {
        if (!data.length) {
          setIsLoading(true);
        } 
        getJson ("api/data/getalltags", getAuthorizationHeader()).then ( (json) => {
            setData(json.data.data);
            setIsLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                setIsLoading(false);
                return;
            } else {
                setIsLoading(false);
                axiosError(error, null, setAlertDialogInput);
                return;
            }
        });
    }

    const askDelete = (id) => setTagToDelete(data.find((t) => t.tagId === id));

    const deleteTag = (id) => {
        setTextAlertInput({"show": false, "message":""});
        setIsLoading(true);
        deleteJson("api/data/deletetag/" + tagToDelete.tagId, getAuthorizationHeader())
        .then(() => { setTagToDelete(null); fetchData(); })
        .catch(function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                setIsLoading(false);
            } else {
                setIsLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const changeTag = (tag) => {
        setTagSelected(tag);
        setNewLabel(tag.label);
        setLabelError("");
        setShowEditTag(true);
    };

    const saveTag = () => {
        const label = newLabel.trim();
        if (!label) { setLabelError("Label is required"); return; }
        if (label === tagSelected.label) { setShowEditTag(false); return; }
        setIsLoading(true);
        postJson("api/data/renametag/" + tagSelected.tagId, { label }, getAuthorizationHeader())
            .then(() => { setShowEditTag(false); fetchData(); })
            .catch((error) => {
                setIsLoading(false);
                if (error?.response?.data) setLabelError(error.response.data.message);
                else axiosError(error, null, setAlertDialogInput);
            });
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'label', 
                header: 'Label',
                size: 50,
            },
            {
                accessorKey: 'glycanCount',
                header: '# Glycans',
                size: 30,
            },
            {
                accessorKey: 'glycoproteinCount',
                header: '# Glycoproteins',
                size: 30,
            },
        ],
        [],
    );

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
            <Loading show={isLoading}></Loading>
            <TextAlert alertInput={textAlertInput}/>
            <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Manage tags"
                  subTitle="The table below displays the list of all your tags. You can modify or delete them"
              />
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <Card>
                <Card.Body>   
                <Table
                    authCheckAgent={props.authCheckAgent}
                    data={data}
                    columns={columns}
                    enableRowActions={true}
                    setAlertDialogInput={setAlertDialogInput}
                    delete={askDelete}
                    showEdit={true}
                    editInPlace={changeTag}
                    initialSortColumn="label"
                    rowId="tagId"
                />
            </Card.Body>
          </Card>
          <ConfirmationModal
                showModal={!!tagToDelete}
                onCancel={() => setTagToDelete(null)}
                onConfirm={deleteTag}
                title="Confirm Delete"
                body={tagToDelete && (
                    `Delete the tag "${tagToDelete.label}"? It will be removed from ${tagToDelete.glycanCount} glycan(s) `
                    + `and ${tagToDelete.glycoproteinCount} glycoprotein(s). This cannot be undone.`)}
            />

            <Dialog open={showEditTag} onClose={() => setShowEditTag(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Rename tag</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        autoFocus fullWidth size="small" label="Label"
                        value={newLabel}
                        error={!!labelError} helperText={labelError}
                        inputProps={{ maxLength: 128 }}
                        onChange={(e) => { setNewLabel(e.target.value); setLabelError(""); }}
                        onKeyDown={(e) => e.key === "Enter" && saveTag()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowEditTag(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveTag}>Save</Button>
                </DialogActions>
            </Dialog>
        </div>
        </Container>
        </>
    );
};

export { TagManagement };