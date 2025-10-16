import { useEffect, useMemo, useReducer, useState} from "react";
import { Container, IconButton, Popover, Tooltip } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import Table from "../components/Table";
import FeedbackWidget from "../components/FeedbackWidget";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const Collections = (props) => {

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [selectedError, setSelectedError] = useState([]);
  const [showSelectedError, setShowSelectedError] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  let navigate = useNavigate();

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(props.authCheckAgent, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', 
        header: 'Name',
        size: 50,
      },
      {
        id: 'type', 
        header: 'Type',
        size: 50,
        accessorFn: (row) => row.type === "GLYCOPROTEIN" ? "Glycoprotein collection" : "Glycan collection",
      },
      {
        accessorFn: (row) => row.glycans ? row.glycans.length : null,
        id: "glycanNo",
        header: '# Glycans',
        size: 30,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.glycoproteins ? row.glycoproteins.length : null,
        id: "proteinNo",
        header: '# Proteins',
        size: 30,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.metadata ? row.metadata.length : 0,
        header: '# Metadata Columns',
        id: 'metadata',
        size: 30,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.errors && row.errors.length > 0 ? "no": "yes",
        id: "glygenReady",
        header: 'GlyGen Ready?',
        size: 30,
        columnDefType: 'display',
        Cell: ({ cell, row }) => {
            const statusValue = cell.getValue(); // Get the value of the cell
            if (statusValue === 'yes') {
              return <CheckCircleIcon color="success" />;
            } else {
              return <CancelIcon color="error" onClick={(e) => showErrors(row.original.errors, e)}/>
                     
            }
          },
      },
    ],
    [],
  );

  const showErrors = (errors, event) => {
    setAnchorEl(event.currentTarget);
    setSelectedError(errors);
    setShowSelectedError(true);
  }

  const saveColumnVisibilityChanges = (columnVisibility) => {
    var columnSettings = [];
    for (var column in columnVisibility) {
      columnSettings.push ({
        "tableName": "COLLECTION",
        "columnName": column,
        "visible" :  columnVisibility[column] ? true: false,
      });
    }
    postJson ("api/setting/updatecolumnsetting", columnSettings, getAuthorizationHeader()).then (({ data }) => {
      console.log ("saved visibility settings");
    }).catch(function(error) {
      axiosError(error, null, setAlertDialogInput);
    });
  }

  return (
    <>
    <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
    <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
              title="Your Collections"
              subTitle="The table below displays a list of all collections that have been created. New collections may be added, old collectionns can be edited, and unused collections can
              be removed."
          />
          <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />

          {selectedError && selectedError.length > 0 && 
                <Popover
                    id={id}
                    open={showSelectedError}
                    anchorEl={anchorEl}
                    onClose={() => {
                        setAnchorEl(null);
                        setShowSelectedError(false);
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}>
                     <ul id="errors">
                      {selectedError.map((err, index) => (
                      <li key={index}>
                          <span>{err.message}</span>
                      </li>
                      ))}
                  </ul>
                  </Popover>}
              
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.addcollection, 
                  {
                    state: { collectionType: "GLYCAN" }
                  }
                )}>
                Add Glycan Collection
                </Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.addcollection,
                  {
                    state: { collectionType: "GLYCOPROTEIN" }
                  })}>
                Add Glycoprotein Collection
                </Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.importcollection)}>
                Import Collection From File
                </Button>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getcollections"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  edit={stringConstants.routes.addcollection + "?collectionId="}
                  showCopy={true}
                  showDownload={true}
                  copy={stringConstants.routes.addcollection + "?isCopy=true&collectionId="}
                  download={stringConstants.api.downloadcollection + "/"}
                  deletews="api/data/deletecollection/"
                  initialSortColumn="name"
                  rowId="collectionId"
                  detailPanel={true}
                  columnsettingsws="api/setting/getcolumnsettings?tablename=COLLECTION"
                  saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default Collections;