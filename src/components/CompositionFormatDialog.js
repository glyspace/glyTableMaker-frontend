import React, { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import {
    Alert,
    Box,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    FormGroup,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Button, Col, Row } from "react-bootstrap";
import TextAlert from "./TextAlert";
import { Loading } from "./Loading";
import compositionList from "../data/composition.json";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import {
    COMMON_RESIDUES,
    buildExample,
    emptyForm,
    fromDefinition,
    splitByCapacity,
    splitIntoColumns,
    syncOrder,
    toDefinition,
    validateFormat,
} from "../utils/compositionFormat";

/**
 * One dialog for four entry points:
 *   add   : empty form
 *   edit  : filled, saves over the existing format
 *   clone : filled, saves as a NEW format owned by the account (the name must be changed)
 *   view  : filled, every field disabled, OK is the only button
 *
 * props:
 *   mode            "add" | "edit" | "clone" | "view"
 *   formatId        id of the format to load (not needed for "add")
 *   existingFormats [{id, name}] formats the account can see, used for the duplicate name check
 *   onClose()       dialog closed without saving
 *   onSaved()       format saved (the caller closes the dialog and reloads its list)
 *   setAlertDialogInput  the page's error dialog setter
 *
 * Mount it only while it is open ({dialog && <CompositionFormatDialog .../>}): every opening then
 * starts from a clean state, with "Show all" on and nothing remembered.
 *
 * Endpoints:
 *   GET  api/data/getcompositionformat/{id}   -> {id, name, description, example, system, definition}
 *   POST api/data/addcompositionformat        (add and clone)
 *   POST api/data/updatecompositionformat     (edit)
 */

const RESIDUES = compositionList; // [{id, name, image}, ...] same list as the composition dialog
const RESIDUE_IDS = compositionList.map((r) => r.id);
// residue id -> backend ResidueType constant, from the "type" field of composition.json
const RESIDUE_TYPES = Object.fromEntries(compositionList.map((r) => [r.id, r.type]));

const BADGE_BLUE = "#4479b2";

const switchSx = {
    "&.MuiSwitch-root .MuiSwitch-switchBase": { color: "white" },
    "&.MuiSwitch-root .Mui-checked": { color: "#1c4e78" },
};

const TIPS = {
    name: "A short name that identifies this format, for example Byonic compact. It must be different from the names of all other formats you can see, including the system formats.",
    description: "Optional. Explain where this notation is used, for example which software or publication writes compositions this way.",
    residues: "Enter the text this notation uses for each residue. Leave a residue empty if the notation does not use it. A text can be used for one residue only. Use Show all to see the less common residues.",
    order: "The order in which the residues are written in a composition. The badges are added automatically as you enter residue texts; drag them to change the order, or use the left and right arrow keys on a selected badge.",
    left: "The character written before a count, for example ( in HN(2). Leave it empty if the notation does not put anything around a count.",
    right: "The character written after a count, for example ) in HN(2). It can only be used together with an opening character.",
};

const imageBase = () =>
    window.location.origin + (process.env.REACT_APP_BASENAME === undefined ? "" : process.env.REACT_APP_BASENAME);

function InfoTip({ text }) {
    return (
        <Tooltip title={text} arrow placement="top-start">
            <InfoOutlinedIcon
                fontSize="small"
                tabIndex={0}
                aria-label={text}
                sx={{ color: "text.secondary", cursor: "help", flexShrink: 0 }}
            />
        </Tooltip>
    );
}

function SectionTitle({ title, required, tooltip }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                borderBottom: "1px solid #ddd",
                pb: 0.5,
                mt: 3,
                mb: 1.5,
            }}
        >
            {tooltip && <InfoTip text={tooltip} />}
            <Typography component="h6" variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
                {required && <span style={{ color: "#d32f2f" }}> *</span>}
            </Typography>
        </Box>
    );
}

function FieldLabel({ children, required, tooltip }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            {tooltip && <InfoTip text={tooltip} />}
            <Typography variant="body2" color="text.secondary">
                {children}
                {required && <span style={{ color: "#d32f2f" }}> *</span>}
            </Typography>
        </Box>
    );
}

function ResidueRow({ residue, value, error, showNames, disabled, onChange }) {
    return (
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Box
                sx={{
                    width: 44,
                    height: 40,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {residue.image ? (
                    <img
                        src={imageBase() + "/icons/svg/" + residue.image}
                        alt={residue.id}
                        style={{ maxWidth: 40, maxHeight: 40, objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ fontWeight: 700 }}>{residue.id}</span>
                )}
            </Box>
            {showNames && (
                <Typography sx={{ width: 72, flexShrink: 0, alignSelf: "center", wordBreak: "break-word" }}>
                    {residue.id}
                </Typography>
            )}
            <TextField
                size="small"
                fullWidth
                value={value || ""}
                disabled={disabled}
                error={!!error}
                helperText={error || undefined}
                onChange={(e) => onChange(residue.id, e.target.value)}
                inputProps={{ "aria-label": "Text for " + residue.id, maxLength: 30 }}
            />
        </Box>
    );
}

function CompositionFormatForm({
    mode,
    formatId,
    initial,
    existingFormats,
    onClose,
    onSaved,
    setAlertDialogInput,
}) {
    const view = mode === "view";

    const [name, setName] = useState(initial.name);
    const [description, setDescription] = useState(initial.description);
    const [texts, setTexts] = useState(initial.texts);
    const [order, setOrder] = useState(initial.order);
    const [noOrder, setNoOrder] = useState(initial.noOrder);
    const [left, setLeft] = useState(initial.left);
    const [right, setRight] = useState(initial.right);
    const [omitOne, setOmitOne] = useState(initial.omitOne);

    // display only, always start on whatever the dialog opens with, never remembered
    const [showAll, setShowAll] = useState(true);
    const [showNames, setShowNames] = useState(true);

    const [showErrors, setShowErrors] = useState(false);
    const [nameTouched, setNameTouched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverAlert, setServerAlert] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [dragId, setDragId] = useState(null);
    const badgeRefs = useRef({});
    const pendingFocus = useRef(null);
    const contentRef = useRef(null);

    const currentId = mode === "edit" ? formatId : null;
    const form = { name, description, texts, order, noOrder, left, right, omitOne };

    const { errors, warnings, valid } = useMemo(
        () => validateFormat({ name, texts, left, right }, RESIDUE_IDS, existingFormats, currentId),
        [name, texts, left, right, existingFormats, currentId]
    );
    const builtExample = useMemo(
        () => buildExample({ texts, order, noOrder, left, right, omitOne }, RESIDUE_IDS),
        [texts, order, noOrder, left, right, omitOne]
    );

    const example = view && initial.system && initial.example ? initial.example : builtExample;

    const visibleResidues = showAll ? RESIDUES : RESIDUES.filter((r) => COMMON_RESIDUES.includes(r.id));
    // full list: same columns as the composition dialog; the common subset is spread evenly (4/3/3)
    const residueColumns = showAll ? splitByCapacity(visibleResidues) : splitIntoColumns(visibleResidues, 3);

    // after a keyboard move React re-inserts the badge, which drops focus: put it back
    useLayoutEffect(() => {
        if (pendingFocus.current) {
            const node = badgeRefs.current[pendingFocus.current];
            if (node) node.focus();
            pendingFocus.current = null;
        }
    }, [order]);

    const changeText = (id, value) => {
        const next = { ...texts, [id]: value };
        setTexts(next);
        setOrder(syncOrder(order, next, RESIDUE_IDS)); // append / remove / keep (relabel) the badge
    };

    const changeLeft = (value) => {
        setLeft(value);
        if (value === "") setRight(""); // a closing character alone has no effect
    };

    const moveBadge = (id, toIndex) => {
        const from = order.indexOf(id);
        if (from < 0 || toIndex < 0 || toIndex >= order.length || from === toIndex) return;
        const next = [...order];
        next.splice(from, 1);
        next.splice(toIndex, 0, id);
        setOrder(next);
    };

    const clearAll = () => {
        const blank = emptyForm();
        setName(blank.name);
        setDescription(blank.description);
        setTexts(blank.texts);
        setOrder(blank.order);
        setNoOrder(blank.noOrder);
        setLeft(blank.left);
        setRight(blank.right);
        setOmitOne(blank.omitOne);
        setShowErrors(false);
        setNameTouched(false);
        setServerAlert({ show: false, message: "" });
    };

    const save = () => {
        setShowErrors(true);
        setServerAlert({ show: false, message: "" });
        if (!valid) {
            // bring the first problem into view
            requestAnimationFrame(() => {
                const first =
                    contentRef.current &&
                    contentRef.current.querySelector(".Mui-error, [data-invalid='true']");
                if (first && first.scrollIntoView) first.scrollIntoView({ block: "center", behavior: "smooth" });
            });
            return;
        }
        const body = {
            id: mode === "edit" ? formatId : null,
            name: name.trim(),
            description: description.trim() === "" ? null : description.trim(),
            example,
            definition: toDefinition(form, RESIDUE_IDS, RESIDUE_TYPES),
        };
        setSaving(true);
        postJson(
            mode === "edit" ? "api/data/updatecompositionformat" : "api/data/addcompositionformat",
            body,
            getAuthorizationHeader()
        )
            .then(() => {
                setSaving(false);
                onSaved();
            })
            .catch((error) => {
                setSaving(false);
                if (error && error.response && error.response.data) {
                    setServerAlert({ show: true, message: error.response.data.message });
                    requestAnimationFrame(() => contentRef.current && contentRef.current.scrollTo({ top: 0 }));
                } else {
                    axiosError(error, null, setAlertDialogInput);
                }
            });
    };

    const orderLocked = view || noOrder;
    const nameError = (showErrors || nameTouched) && errors.name ? errors.name : null;

    return (
        <Dialog
            open={true}
            maxWidth="lg"
            fullWidth
            scroll="paper"
            aria-labelledby="composition-format-title"
            onClose={(event, reason) => {
                if (reason === "backdropClick") return; // do not lose the work by a stray click
                onClose();
            }}
        >
            <Row className="sups-dialog-title" style={{ margin: 0, flexShrink: 0 }}>
                <Col>
                    <h5 id="composition-format-title">Composition format definition</h5>
                </Col>
                <Col style={{ display: "flex", justifyContent: "right" }}>
                    <FormGroup row>
                        <FormControlLabel
                            control={
                                <Switch
                                    color="error"
                                    checked={showAll}
                                    onChange={(e) => setShowAll(e.target.checked)}
                                    sx={switchSx}
                                />
                            }
                            label="Show all"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    color="error"
                                    checked={showNames}
                                    onChange={(e) => setShowNames(e.target.checked)}
                                    sx={switchSx}
                                />
                            }
                            label="Show Names"
                        />
                    </FormGroup>
                </Col>
            </Row>

            <DialogContent ref={contentRef} sx={{ px: 5, pb: 3 }}>
                <TextAlert alertInput={serverAlert} />

                {/* General */}
                <SectionTitle title="General" />
                <FieldLabel required tooltip={TIPS.name}>
                    Name of the format
                </FieldLabel>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="e.g. Byonic compact"
                    value={name}
                    disabled={view}
                    autoFocus={!view}
                    error={!!nameError}
                    helperText={nameError || undefined}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setNameTouched(true)}
                    onFocus={(e) => mode === "clone" && e.target.select()} // a clone needs a new name
                    inputProps={{ "aria-label": "Name of the format", maxLength: 255 }}
                    sx={{ mb: 2 }}
                />
                <FieldLabel tooltip={TIPS.description}>Description (optional)</FieldLabel>
                <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    value={description}
                    disabled={view}
                    onChange={(e) => setDescription(e.target.value)}
                    inputProps={{ "aria-label": "Description", maxLength: 4000 }}
                />

                {/* Residues */}
                <SectionTitle title="Residues" required tooltip={TIPS.residues} />
                {showErrors && errors.residues && (
                    <Typography data-invalid="true" color="error" variant="body2" sx={{ mb: 1 }}>
                        {errors.residues}
                    </Typography>
                )}
                {warnings.length > 0 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        {warnings.slice(0, 3).map((w) => (
                            <div key={w.prefix + "|" + w.longer}>
                                &quot;{w.prefix}&quot; is the beginning of &quot;{w.longer}&quot;, so a composition that
                                uses both can be read in more than one way.
                            </div>
                        ))}
                        {warnings.length > 3 && <div>and {warnings.length - 3} more.</div>}
                    </Alert>
                )}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                        columnGap: 4,
                        alignItems: "start",
                    }}
                >
                    {residueColumns.map((column, c) => (
                        <Box key={c}>
                            {column.map((residue) => (
                                <ResidueRow
                                    key={residue.id}
                                    residue={residue}
                                    value={texts[residue.id]}
                                    error={errors.residueTexts[residue.id]}
                                    showNames={showNames}
                                    disabled={view}
                                    onChange={changeText}
                                />
                            ))}
                        </Box>
                    ))}
                </Box>

                {/* Order */}
                <SectionTitle title="Order" required />
                <FieldLabel tooltip={TIPS.order}>Drag badges to define order</FieldLabel>
                <Box
                    role="list"
                    aria-label="Order of residues"
                    aria-disabled={orderLocked}
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 1.5,
                        minHeight: 60,
                        p: 1.5,
                        border: "1px solid #bbb",
                        borderRadius: 1,
                        opacity: orderLocked ? 0.5 : 1,
                    }}
                >
                    {order.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                            The badges appear here as you enter residue texts.
                        </Typography>
                    )}
                    {order.map((id, index) => (
                        <Box
                            key={id}
                            role="listitem"
                            component="span"
                            ref={(node) => {
                                if (node) badgeRefs.current[id] = node;
                                else delete badgeRefs.current[id];
                            }}
                            tabIndex={orderLocked ? -1 : 0}
                            draggable={!orderLocked}
                            aria-label={
                                (texts[id] || "").trim() +
                                ", position " + (index + 1) + " of " + order.length +
                                (orderLocked ? "" : ". Use the left and right arrow keys to move it.")
                            }
                            onDragStart={(e) => {
                                setDragId(id);
                                e.dataTransfer.effectAllowed = "move";
                                e.dataTransfer.setData("text/plain", id);
                            }}
                            onDragOver={(e) => {
                                if (dragId && dragId !== id) e.preventDefault();
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                if (dragId) moveBadge(dragId, order.indexOf(id));
                                setDragId(null);
                            }}
                            onDragEnd={() => setDragId(null)}
                            onKeyDown={(e) => {
                                if (orderLocked) return;
                                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                                    e.preventDefault();
                                    pendingFocus.current = id;
                                    moveBadge(id, order.indexOf(id) + (e.key === "ArrowLeft" ? -1 : 1));
                                }
                            }}
                            sx={{
                                minWidth: 44,
                                px: 2,
                                py: 0.75,
                                borderRadius: 999,
                                bgcolor: BADGE_BLUE,
                                color: "white",
                                fontWeight: 700,
                                textAlign: "center",
                                userSelect: "none",
                                cursor: orderLocked ? "default" : "grab",
                                opacity: dragId === id ? 0.4 : 1,
                                outlineOffset: 2,
                            }}
                        >
                            {(texts[id] || "").trim() || "·"}
                        </Box>
                    ))}
                </Box>
                <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                        <Checkbox
                            checked={noOrder}
                            disabled={view}
                            onChange={(e) => setNoOrder(e.target.checked)}
                        />
                    }
                    label="No defined order"
                />

                {/* Number format */}
                <SectionTitle title="Number format" />
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    <Box sx={{ width: 230 }}>
                        <FieldLabel tooltip={TIPS.left}>Left delimiter</FieldLabel>
                        <TextField
                            fullWidth
                            size="small"
                            value={left}
                            disabled={view}
                            error={!!errors.left}
                            helperText={errors.left || undefined}
                            onChange={(e) => changeLeft(e.target.value)}
                            inputProps={{ "aria-label": "Left delimiter", maxLength: 5 }}
                        />
                    </Box>
                    <Box sx={{ width: 230 }}>
                        <FieldLabel tooltip={TIPS.right}>Right delimiter</FieldLabel>
                        <TextField
                            fullWidth
                            size="small"
                            value={right}
                            disabled={view || left === ""}
                            error={!!errors.right}
                            helperText={errors.right || undefined}
                            onChange={(e) => setRight(e.target.value)}
                            inputProps={{ "aria-label": "Right delimiter", maxLength: 5 }}
                        />
                    </Box>
                </Box>
                <FormControlLabel
                    sx={{ mt: 1 }}
                    control={
                        <Checkbox
                            checked={omitOne}
                            disabled={view}
                            onChange={(e) => setOmitOne(e.target.checked)}
                        />
                    }
                    label="Number 1 can be omitted"
                />

                {/* Example */}
                <SectionTitle title="Example" />
                <Box
                    aria-live="polite"
                    sx={{
                        bgcolor: "#f5f7fb",
                        border: "1px solid #dde3ee",
                        borderRadius: 1,
                        p: 2,
                        minHeight: 56,
                        fontFamily: "monospace",
                        fontSize: "1.3rem",
                        wordBreak: "break-all",
                    }}
                >
                    {example || (
                        <Typography component="span" color="text.secondary" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>
                            Enter residue texts to see an example.
                        </Typography>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 5, py: 2, justifyContent: "flex-end", gap: 1 }}>
                {view ? (
                    <Button className="gg-btn-blue" onClick={onClose}>
                        OK
                    </Button>
                ) : (
                    <>
                        <Button className="gg-btn-outline" onClick={clearAll} disabled={saving}>
                            Clear all
                        </Button>
                        <Button className="gg-btn-outline" onClick={onClose} disabled={saving}>
                            Cancel
                        </Button>
                        <Button className="gg-btn-blue" onClick={save} disabled={saving}>
                            Save
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default function CompositionFormatDialog(props) {
    const { mode, formatId, onClose, setAlertDialogInput } = props;
    const [initial, setInitial] = useState(mode === "add" ? emptyForm() : null);

    // edit, clone and view load the full format (the list does not carry the definition)
    useEffect(() => {
        props.authCheckAgent && props.authCheckAgent();
        if (mode === "add") return undefined;
        let cancelled = false;
        getJson("api/data/getcompositionformat/" + formatId, getAuthorizationHeader())
            .then(({ data }) => {
                if (cancelled) return;
                const f = data.data;
                setInitial({
                    name: f.name || "",
                    description: f.description || "",
                    example: f.example || "",
                    system: f.system === true,
                    ...fromDefinition(f.definition, RESIDUE_IDS, RESIDUE_TYPES),
                });
            })
            .catch((error) => {
                if (cancelled) return;
                onClose();
                axiosError(error, null, setAlertDialogInput);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!initial) return <Loading show={true} />;
    return <CompositionFormatForm {...props} initial={initial} />;
}