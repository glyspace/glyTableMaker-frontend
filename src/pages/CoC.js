import { useEffect, useMemo, useReducer} from "react";
import { Container } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import Table from "../components/Table";
import FeedbackWidget from "../components/FeedbackWidget";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

const CoC = (props) => {

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  let navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(props.authCheckAgent, []);

  const getGlycanCount = (collections) => {
    let count = 0;
    collections.forEach(element => {
        if (element.glycans) {
            count += element.glycans.length;
        } 
    });
    return count;
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', 
        header: 'Name',
        size: 50,
      },
      {
        accessorKey: 'children.length',
        header: '# Collections',
        id: 'children',
        size: 30,
        enableColumnFilter: false,
      },
    ],
    [],
  );

  const saveColumnVisibilityChanges = (columnVisibility) => {
    var columnSettings = [];
    for (var column in columnVisibility) {
      columnSettings.push ({
        "tableName": "COC",
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
              title="Your Collections of Collections"
              subTitle="The table below displays a list of all collections that have been created. New collections may be added, old collectionns can be edited, and unused collections can
              be removed."
          />
          <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
              
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    onClick={()=> navigate(stringConstants.routes.addcoc)}>
                Add
                </Button>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getcocs"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  edit={stringConstants.routes.addcoc + "?cocId="}
                  deletews="api/data/deletecoc/"
                  initialSortColumn="name"
                  rowId="collectionId"
                  detailPanel={true}
                  columnsettingsws="api/setting/getcolumnsettings?tablename=COC"
                  saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default CoC;