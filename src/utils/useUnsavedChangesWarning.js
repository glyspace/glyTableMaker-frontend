import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const DEFAULT_MESSAGE = "You have unsaved changes. Are you sure you want to leave this page?";

export function useUnsavedChangesWarning(isDirty, message = DEFAULT_MESSAGE) {
    useEffect(() => {
        if (!isDirty) return undefined;
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = message;   // modern browsers show their own generic text
            return message;
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty, message]);

    return useBlocker(
        ({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname
    );
}

export function UnsavedChangesDialog({ blocker, message = DEFAULT_MESSAGE }) {
    return (
        <Dialog open={blocker.state === "blocked"} onClose={() => blocker.reset()}>
            <DialogTitle>Unsaved changes</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => blocker.reset()} autoFocus>Stay on this page</Button>
                <Button color="error" onClick={() => blocker.proceed()}>Leave without saving</Button>
            </DialogActions>
        </Dialog>
    );
}
