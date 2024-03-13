import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { MRT_Table, useMaterialReactTable } from "material-react-table";

const StatusMessage = props => {

  const [errorMessage, setErrorMessage] = useState("");
  const [enableErrorView, setEnableErrorView] = useState(false);
  const [batchUploadResponse, setBatchUploadResponse] = useState();

  const columns = useMemo ( 
    () => [
      {
        accessorKey: 'position', 
        header: 'Position',
        size: 50,
      },
      {
        accessorKey: 'message',
        header: 'Message',
        size: 100,
      },
      {
        accessorKey: 'sequence',
        header: 'Glycan sequence',
        size: 10,
      },
    ],
    [],
  );

  const tableDetail = useMaterialReactTable({
    columns,
    data: errorMessage,
    enableFilters: false
  });

  const errorMessageTable = (setBatchUpload) => {
    return (
      <>
      <Modal
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        show={enableErrorView}
        onHide={() => setEnableErrorView(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <MRT_Table table={tableDetail}/>
        </Modal.Body>
        <Modal.Footer>
          <Button className="gg-btn-blue-reg" onClick={() => {
              setBatchUploadResponse();
              updateBatchUpload();
              setBatchUpload(false);
              setEnableErrorView(false);
            }
          }>
            Mark Read
          </Button>
        </Modal.Footer>
      </Modal>
    </>
    );
  };

  useEffect(() => {
    getJson ("api/data/checkbatchupload", getAuthorizationHeader()).then ( (json) => {
      props.setBatchUpload && props.setBatchUpload(true);
      setBatchUploadResponse(json.data.data);
    }).catch (function(error) {
      if (error && error.response && error.response.data) {
        if  (error.response.data["code"] === 404 || error.response.status === 404) {
          console.log ("no active batch upload");
        } else {
          setBatchUploadResponse("Failed to get most recent batch upload");
        }
      } else {
        axiosError(error, null, props.setAlertDialogInput);
      }
    });
  }, []);

  useEffect(() => {
    if (batchUploadResponse && batchUploadResponse.status === "DONE") {
      setTimeout(()=>{
        updateBatchUpload();
      }, 15000)
    } 
  }, [batchUploadResponse]);


  const updateBatchUpload = () => {
    postJson ("api/data/updatebatchupload",null, getAuthorizationHeader()).then ( (data) => {
      console.log ("marked the batch upload results as read");
    }).catch (function(error) {
        axiosError(error, null, props.setAlertDialogInput);
    }
  );
    
  }

  return (
    <div>
      {enableErrorView && errorMessageTable(props.setBatchUpload)}

      <div st1yle={{ textAlign: "center" }}  className="mt-3 mb-3">
        {batchUploadResponse && batchUploadResponse.status !== "DONE" ? (<div style={{ textAlign: "center" }}>
          <span>
            {batchUploadResponse.status &&
            batchUploadResponse.status === "ERROR" &&
            batchUploadResponse.errors &&
            batchUploadResponse.errors.length > 0 ? (
              <span>
                <strong>Status:</strong>&nbsp;{"Batch upload errors"}
                  &nbsp;&nbsp;
                  <span
                    onClick={() => {
                      setErrorMessage(batchUploadResponse.errors);
                      setEnableErrorView(true);
                    }}
                  >
                    <FontAwesomeIcon
                      key={"error"}
                      icon={["fas", "exclamation-triangle"]}
                      size="xs"
                      className={"caution-color table-btn"}
                      style={{
                        paddingTop: "9px"
                      }}
                    />
                  </span>
                </span>
            ) : (
              <span>
              <strong>Status:</strong>&nbsp;{"Batch upload in process"}
              &nbsp;&nbsp;
              <FontAwesomeIcon
                key={"error"}
                icon={["fas", "exclamation-triangle"]}
                size="xs"
                className={"warning-color table-btn"}
                style={{
                  paddingTop: "9px"
                }}
              />
              </span>
            )}
          </span>
        </div>) : (batchUploadResponse && batchUploadResponse.status === "DONE" ? (
          <span>
          <strong>Status:</strong>&nbsp;{"Upload completed successfully"}
          </span>
        ) : (batchUploadResponse && batchUploadResponse.status === "DEFAULT" ? 
            <span><strong>Status:</strong>&nbsp;{"Failed checking active batch uploads"}</span> : <></>
          )
        )}
      </div>
      <div>
      </div>
    </div>
  );
};

StatusMessage.propTypes = {
  setBatchUpload: PropTypes.func,
  uploadtype: PropTypes.string,
  moleculetype: PropTypes.string,
};

export { StatusMessage };
