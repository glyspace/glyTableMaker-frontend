import messages from '../data/messages';

/**
 * Call this function to stop page loading and display error dialog.
 * If page loading needs to be stopped, this function requires parent component to define PageLoader component and pass setPageLoading function.
 * If error dialog needs to be displayed, this function requires parent component to define DialogAlert component and pass setAlertDialogInput function.
 * @param {string} error - error code.
 * @param {function} setPageLoading - function to set PageLoader component state to false.
 * @param {function} setAlertDialogInput - function to set DialogAlert component state and display error dialog.
 */
export const axiosError = (error, setPageLoading, setAlertDialogInput) => {
    console.log(error);
    if (!error || !error.response) {
        let agent = "";
        if (navigator && navigator.userAgent) {
            agent = navigator.userAgent;
        }
        (setPageLoading && setPageLoading(false));
        (setAlertDialogInput && setAlertDialogInput({"show": true, "id": messages.errors.networkError.id}));
    } else if (error.response && !error.response.data) {
        (setPageLoading && setPageLoading(false));
        (setAlertDialogInput && setAlertDialogInput({"show": true, "id": error.response.status}));
    } else if (error.response.data && error.response.data["code"]) {
        (setPageLoading && setPageLoading(false));
        (setAlertDialogInput && setAlertDialogInput({"show": true, "id": error.response.data["code"]}));
    }
}