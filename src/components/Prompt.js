import { useEffect } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { unstable_useBlocker as useBlocker } from 'react-router-dom'
import { unstable_usePrompt as usePrompt } from "react-router-dom";

/**function Prompt({ when, message }) {
    useBlocker(() => {
        if (when) {
            return ! window.confirm(message)
        }
        return false
    }, [when])

  return <div key={when} />
}*/

function Prompt ({when, message}) {

    let blocker = useBlocker(when); //useBlocker(isFormDirty)

    useEffect(() => {
        console.log(blocker);
    }, [blocker]);

    const handleClose = () => blocker.reset();
    const handleConfirm = () => blocker.proceed();

    return (
        <Modal show={blocker.state === "blocked"} onHide={handleClose}>
        <Modal.Header closeButton>
            <Modal.Title>Are you sure?</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
            Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm}>
            Confirm
            </Button>
        </Modal.Footer>
        </Modal>
    );
}

export default Prompt;