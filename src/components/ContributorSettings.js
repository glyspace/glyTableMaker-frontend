import { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { Button } from "react-bootstrap";
import { MaterialReactTable, useMaterialReactTable } from "material-react-table";
import { Box, IconButton, Radio, TextField, Tooltip, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { FormLabel } from "../components/FormControls";
import ContributorTable from "./ContributorTable";
import { getContributorString } from "../utils/api";

const newId = () =>
    (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : "c" + Date.now() + Math.random().toString(16).slice(2);

export default function ContributorSettings(props) {
    const [rows, setRows] = useState(props.value ?? []);
    // dialog: {open, mode: "add" | "edit" | "clone", row, key}
    const [dialog, setDialog] = useState({ open: false });
    const [dialogName, setDialogName] = useState("");
    const [nameError, setNameError] = useState("");
 
    useEffect(() => {
        setRows(props.value ?? []);
    }, [props.value]);
 
    const dirty = JSON.stringify(rows) !== JSON.stringify(props.value ?? []);

    const openDialog = (mode, row) => {
        setDialogName(mode === "clone" ? `${row.name} copy` : row?.name ?? "");
        setNameError("");
        setDialog({ open: true, mode, row, key: newId() });
    };
 
    const closeDialog = () => setDialog({ open: false });

    const validateName = () => {
        const name = dialogName.trim();
        if (!name) {
            setNameError("Name is required");
            return false;
        }
        const clash = rows.some(
            (r) =>
                r.name.trim().toLowerCase() === name.toLowerCase() &&
                !(dialog.mode === "edit" && r.id === dialog.row.id)
        );
        if (clash) {
            setNameError("A contributor setting with this name already exists");
            return false;
        }
        setNameError("");
        return true;
    };
 
    // called by ContributorTable when its Save/OK is pressed (after beforeSave passed)
    const handleDialogSave = (contributor) => {
        const name = dialogName.trim();
        if (dialog.mode === "edit") {
            setRows((prev) =>
                prev.map((r) => (r.id === dialog.row.id ? { ...r, name, contributor } : r))
            );
        } else {
            // add / clone create a new row; the first row ever added becomes the default
            setRows((prev) => [
                ...prev,
                { id: newId(), name, isDefault: prev.length === 0, contributor },
            ]);
        }
    };
 
    const handleDelete = (row) => {
        setRows((prev) => {
            const next = prev.filter((r) => r.id !== row.id);
            if (next.length > 0 && !next.some((r) => r.isDefault)) {
                next[0] = { ...next[0], isDefault: true };
            }
            return next;
        });
    };
 
    const handleDefault = (row) => {
        setRows((prev) => prev.map((r) => ({ ...r, isDefault: r.id === row.id })));
    };
 
    const columns = useMemo(
        () => [
            {
                id: "isDefault",
                header: "Default",
                size: 80,
                enableSorting: false,
                Cell: ({ row }) => (
                    <Radio
                        name="defaultContributorSetting"
                        checked={!!row.original.isDefault}
                        onClick={() => handleDefault(row.original)}
                        onChange={() => handleDefault(row.original)}
                        inputProps={{ "aria-label": `Use ${row.original.name} as default` }}
                    />
                ),
            },
            { accessorKey: "name", header: "Name", size: 200 },
            {
                id: "settings",
                header: "Settings",
                accessorFn: (row) => getContributorString(row.contributor),
                Cell: ({ cell }) => (
                    <Typography variant="body2" sx={{ whiteSpace: "normal" }}>
                        {cell.getValue()}
                    </Typography>
                ),
            },
        ],
        []
    );
 
    const table = useMaterialReactTable({
        columns,
        data: rows,
        getRowId: (row) => row.id,
        enableTopToolbar: false,
        enableBottomToolbar: false,
        enablePagination: false,
        enableSorting: false,
        enableColumnActions: false,
        enableRowActions: true,
        positionActionsColumn: "last",
        displayColumnDefOptions: { "mrt-row-actions": { header: "Action", size: 140 } },
        muiTableBodyCellProps: { sx: { border: "0.5px solid rgba(200, 200, 200, .5)" } },
        muiTableHeadCellProps: { sx: { border: "0.5px solid rgba(200, 200, 200, .5)" } },
        renderEmptyRowsFallback: () => (
            <Typography sx={{ p: 2, textAlign: "center" }} color="text.secondary">
                No contributor settings defined yet. Use Add to create one.
            </Typography>
        ),
        renderRowActions: ({ row }) => (
            <Box sx={{ display: "flex", gap: "0.25rem" }}>
                <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => openDialog("edit", row.original)}>
                        <EditIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Clone">
                    <IconButton color="primary" onClick={() => openDialog("clone", row.original)}>
                        <ContentCopyIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(row.original)}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    });
 
    return (
        <Card>
            <Card.Body>
                <div style={{ marginLeft: "20px" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                        <FormLabel label="Contributor settings" />
                        <Button className="gg-btn-blue-reg" onClick={() => openDialog("add")}>
                            Add
                        </Button>
                    </Box>
                    <MaterialReactTable table={table} />
                </div>
                <Tooltip title="Save the contributor settings">
                    <span style={{ float: "right" }}>
                        <Button
                            className="gg-btn-outline-reg mb-3 mt-3"
                            style={{ marginLeft: "5px" }}
                            disabled={!dirty}
                            onClick={() => props.onSave && props.onSave(rows)}
                        >
                            Save
                        </Button>
                    </span>
                </Tooltip>
 
                {/* rendered only while open so it always starts from fresh state */}
                {dialog.open && (
                    <ContributorTable
                        key={dialog.key}
                        open={true}
                        edit={true}
                        title={
                            dialog.mode === "edit"
                                ? "Edit contributor setting"
                                : dialog.mode === "clone"
                                ? "Clone contributor setting"
                                : "Add contributor setting"
                        }
                        saveLabel="OK"
                        contributor={dialog.row?.contributor}
                        extraContent={
                            <TextField
                                label="Name"
                                required
                                fullWidth
                                size="small"
                                sx={{ mb: 2 }}
                                value={dialogName}
                                error={!!nameError}
                                helperText={nameError}
                                onChange={(e) => setDialogName(e.target.value)}
                            />
                        }
                        beforeSave={validateName}
                        setContributor={handleDialogSave}
                        onClose={closeDialog}
                    />
                )}
            </Card.Body>
        </Card>
    );
}