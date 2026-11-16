import React, { useEffect, useMemo, useReducer, useState } from "react";
import { Box, Container, IconButton, Tooltip, Typography } from "@mui/material";
import { Button, Card } from "react-bootstrap";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FeedbackWidget from "../components/FeedbackWidget";
import DialogAlert from "../components/DialogAlert";
import TextAlert from "../components/TextAlert";
import { Loading } from "../components/Loading";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { PageHeading } from "../components/FormControls";
import { deleteJson, getAuthorizationHeader, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import CompositionFormatDialog from "../components/CompositionFormatDialog";

/**
 * Manage > Composition formats
 *
 * Lists the system defined formats and the formats owned by the logged in user.
 *  - system formats : view, clone
 *  - own formats    : view, clone, edit, delete
 * Add, view, clone and edit all open the same dialog (components/CompositionFormatDialog.js).
 *
 * Endpoints used:
 *   GET    api/data/getcompositionformats              -> SuccessResponse<List<{id, name, description, example, system}>>
 *   DELETE api/data/deletecompositionformat/{id}
 */
const CompositionFormats = (props) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [formatToDelete, setFormatToDelete] = useState(null);
    const [dialog, setDialog] = useState(null); // {mode: "add" | "view" | "clone" | "edit", format}

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    useEffect(() => {
        props.authCheckAgent && props.authCheckAgent();
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleError = (error) => {
        setIsLoading(false);
        if (error && error.response && error.response.data) {
            setTextAlertInput({ show: true, message: error.response.data.message });
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
    };

    const fetchData = () => {
        setIsLoading(true);
        getJson("api/data/getcompositionformats", getAuthorizationHeader())
            .then(({ data }) => {
                setData(data.data ?? []);
                setIsLoading(false);
            })
            .catch(handleError);
    };

    const deleteFormat = () => {
        const format = formatToDelete;
        setFormatToDelete(null);
        if (!format) return;
        setTextAlertInput({ show: false, message: "" });
        setIsLoading(true);
        deleteJson("api/data/deletecompositionformat/" + format.id, getAuthorizationHeader())
            .then(() => fetchData())
            .catch(handleError);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: "name",
                header: "Format",
                filterFn: "contains",
                size: 500,
            },
        ],
        []
    );

    const table = useMaterialReactTable({
        columns,
        data, // stable state, so the table does not reset on every render
        getRowId: (row) => String(row.id),

        // expand control (first column) + full-width detail panel
        positionExpandColumn: "first",
        renderDetailPanel: ({ row }) => (
            <Box
                component="dl"
                sx={{
                    display: "grid",
                    gridTemplateColumns: "max-content 1fr",
                    columnGap: 3,
                    rowGap: 1,
                    m: 0,
                    py: 1,
                    pl: 2,
                    textAlign: "left",
                }}
            >
                <Typography component="dt" variant="subtitle2">
                    Description
                </Typography>
                <Typography component="dd" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
                    {row.original.description || "-"}
                </Typography>
                <Typography component="dt" variant="subtitle2">
                    Example
                </Typography>
                <Typography
                    component="dd"
                    sx={{ m: 0, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                >
                    {row.original.example || "-"}
                </Typography>
            </Box>
        ),

        // actions (last column): view, clone, edit, delete
        enableRowActions: true,
        positionActionsColumn: "last",
        renderRowActions: ({ row }) => {
            const format = row.original;
            const editable = format.system !== true; // system defined formats are read only
            return (
                <Box sx={{ display: "flex", gap: "0.5rem" }}>
                    <Tooltip title="View">
                        <IconButton
                            aria-label={"View " + format.name}
                            onClick={() => setDialog({ mode: "view", format })}
                        >
                            <VisibilityOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Clone">
                        <IconButton
                            color="primary"
                            aria-label={"Clone " + format.name}
                            onClick={() => setDialog({ mode: "clone", format })}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </Tooltip>
                    {editable && (
                        <Tooltip title="Edit">
                            <IconButton
                                color="primary"
                                aria-label={"Edit " + format.name}
                                onClick={() => setDialog({ mode: "edit", format })}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {editable && (
                        <Tooltip title="Delete">
                            <IconButton
                                color="error"
                                aria-label={"Delete " + format.name}
                                onClick={() => setFormatToDelete(format)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            );
        },
        displayColumnDefOptions: {
            "mrt-row-expand": { header: "", size: 60 },
            "mrt-row-actions": { header: "Actions", size: 190 },
        },

        // only the Format column is sorted / filtered
        enableGlobalFilter: false,
        enableColumnActions: false,
        enableHiding: false,
        enableDensityToggle: false,
        enableFullScreenToggle: false,
        initialState: {
            showColumnFilters: true,
            sorting: [{ id: "name", desc: false }],
            pagination: { pageIndex: 0, pageSize: 10 },
        },
    });

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput} />
            <Loading show={isLoading}></Loading>
            <TextAlert alertInput={textAlertInput} />
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={(input) => {
                    setAlertDialogInput({ show: input });
                }}
            />
            {dialog && (
                <CompositionFormatDialog
                    mode={dialog.mode}
                    formatId={dialog.format ? dialog.format.id : null}
                    existingFormats={data}
                    setAlertDialogInput={setAlertDialogInput}
                    onClose={() => setDialog(null)}
                    onSaved={() => {
                        setDialog(null);
                        fetchData();
                    }}
                />
            )}
            <ConfirmationModal
                showModal={!!formatToDelete}
                onCancel={() => setFormatToDelete(null)}
                onConfirm={deleteFormat}
                title="Confirm Delete"
                body={
                    formatToDelete &&
                    'Are you sure you want to delete the composition format "' +
                        formatToDelete.name +
                        '"? This cannot be undone.'
                }
            />
            <Container maxWidth="xl">
                <div className="page-container">
                    <PageHeading
                        title="Composition formats"
                        subTitle="A composition format defines how a glycan composition is written, so that compositions you enter or upload can be recognized. The formats supplied by the system cannot be changed, but you can view them or clone them to create your own."
                    />
                    <Card>
                        <Card.Body>
                            <div style={{ textAlign: "right" }} className="mb-3">
                                <Button
                                    variant="contained"
                                    className="gg-btn-blue mt-2 gg-ml-20"
                                    onClick={() => setDialog({ mode: "add" })}
                                >
                                    Add new format
                                </Button>
                            </div>
                            <MaterialReactTable table={table} />
                        </Card.Body>
                    </Card>
                </div>
            </Container>
        </>
    );
};

export { CompositionFormats };