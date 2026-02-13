import { Container } from "@mui/material"
import FeedbackWidget from "../components/FeedbackWidget"
import { useReducer } from "react";
import DialogAlert from "../components/DialogAlert";

const UserManagement = () => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
            <Container maxWidth="md" className="card-page-container">
                <div>
                    <DialogAlert
                        alertInput={alertDialogInput}
                        setOpen={input => {
                        setAlertDialogInput({ show: input });
                        }}
                    />
                    Coming soon!
                </div>
            </Container>
        </>
    );
};

export { UserManagement };