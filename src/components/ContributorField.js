import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Radio,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { Col, Row } from "react-bootstrap";
import { getAuthorizationHeader, getContributorString, getJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import ContributorTable from "./ContributorTable";


export const hasContributor = (c) =>
  !!c && ((c.user && c.user.length > 0) || (c.software && c.software.length > 0));

const clone = (o) => JSON.parse(JSON.stringify(o));

export const parseContributorSettings = (list) =>
  (list || []).map((s) => {
    let contributor = { user: [], software: [] };
    try {
      if (s.contributor) contributor = JSON.parse(s.contributor);
    } catch (e) {
      console.warn("Could not parse contributor setting " + s.name, e);
    }
    return { id: s.id, name: s.name, isDefault: !!s.defaultSetting, contributor };
  });

/**
 * Contributor field of the metadata form:
 *  - read-only text with the summary string of the current contributor value
 *  - View   : read-only dialog (OK only)
 *  - Edit   : editable dialog, Save updates the field, Cancel leaves it unchanged
 *  - Switch : pick another named contributor setting of the user
 * When the value is empty at first, the user's default contributor setting (if any) is applied.
 *
 * props: label, value (contributor object), error, onChange(contributorObject), setAlertDialogInput
 */
export default function ContributorField({ 
  label, 
  value, 
  error, 
  onChange, 
  setAlertDialogInput 
}) {
  const [settings, setSettings] = useState(null);   
  const [dialog, setDialog] = useState(null);       
  const [selectedId, setSelectedId] = useState(null);
  const defaultApplied = useRef(false);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    let cancelled = false;
    getJson("api/setting/getallcontributorsettings", getAuthorizationHeader())
      .then(({ data }) => {
        if (cancelled) return;
        const list = parseContributorSettings(data.data);
        setSettings(list);
        const def = list.find((s) => s.isDefault);
        if (def && !defaultApplied.current && !hasContributor(valueRef.current)) {
          defaultApplied.current = true;
          onChangeRef.current(clone(def.contributor));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setSettings([]);
          setAlertDialogInput && axiosError(error, null, setAlertDialogInput);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contributorString = hasContributor(value) ? getContributorString(value) : "";

  const openSwitch = () => {
    setSelectedId(null);
    setDialog("switch");
  };

  const applySwitch = () => {
    const selected = (settings || []).find((s) => s.id === selectedId);
    if (selected) onChange(clone(selected.contributor));
    setDialog(null);
  };

  return (
    <>
      <Row>
        <Col xs={2} sm={3}> {label} </Col>
        <Col xs={7} sm={6}>
          <TextField
            size="small"
            fullWidth
            error={!!error}
            helperText={error}
            value={contributorString}
            variant="outlined"
            placeholder="Click to enter contributor information"
            onClick={() => setDialog("edit")}
            inputProps={{
              readOnly: true,
              "aria-label": "Edit contributor information",
              style: { cursor: "pointer", textOverflow: "ellipsis" },
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDialog("edit");
                }
              },
            }}
          />
        </Col>
        <Col xs={3} sm={3}>
          <Box sx={{ whiteSpace: "nowrap" }}>
            <Tooltip title="View contributor information">
              <IconButton color="primary" aria-label="View" onClick={() => setDialog("view")}>
                <VisibilityOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit contributor information">
              <IconButton color="primary" aria-label="Edit" onClick={() => setDialog("edit")}>
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Switch to another contributor setting">
              <IconButton color="primary" aria-label="Switch" onClick={openSwitch}>
                <SwapHorizIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Col>
      </Row>

      {(dialog === "view" || dialog === "edit") && (
        <ContributorTable
          open={true}
          edit={dialog === "edit"}
          viewOnly={dialog === "view"}
          title={dialog === "edit" ? "Edit Contributor" : "Contributor"}
          saveLabel={dialog === "edit" ? "Save" : "OK"}
          contributor={value}
          setContributor={(contrib) => onChange(contrib)}
          onClose={() => setDialog(null)}
        />
      )}

      <Dialog open={dialog === "switch"} onClose={() => setDialog(null)} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>Switch contributor setting</DialogTitle>
        <DialogContent dividers>
          {settings && settings.length > 0 ? (
            <>
              <Autocomplete
                options={settings}
                value={settings.find((s) => s.id === selectedId) ?? null}
                onChange={(e, option) => setSelectedId(option ? option.id : null)}
                getOptionLabel={(s) => `${s.name}${s.isDefault ? " (default)" : ""}`}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                disableClearable
                openOnFocus
                renderInput={(params) => (
                  <TextField {...params} label="Contributor setting" margin="dense" autoFocus />
                )}
                renderOption={(props, s) => {
                  const { key, ...rest } = props;      // key must not be spread into the element
                  return (
                    <li key={s.id} {...rest}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body1">
                          {s.name}
                          {s.isDefault ? " (default)" : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "normal" }}>
                          {getContributorString(s.contributor)}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
              />
              {/* details of the chosen setting, since the input only shows its name */}
              {selectedId != null && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  {getContributorString(settings.find((s) => s.id === selectedId)?.contributor)}
                </Typography>
              )}
            </>
          ) : (
            <Typography>
              You have not defined any contributor settings yet. You can add them on the Settings page.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={selectedId === null} onClick={applySwitch}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
