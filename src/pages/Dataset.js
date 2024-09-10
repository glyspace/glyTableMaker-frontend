import { Container } from "@mui/material";
import FeedbackWidget from "../components/FeedbackWidget";
import { PageHeading } from "../components/FormControls";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Button, Card } from "react-bootstrap";
import Table from "../components/Table";
import { useEffect, useMemo, useReducer } from "react";
import stringConstants from '../data/stringConstants.json';
import { useNavigate } from "react-router-dom";
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";

const Dataset = (props) => {

    let navigate = useNavigate();

    useEffect(props.authCheckAgent, []);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const columns = useMemo(
        () => [
          {
            accessorKey: 'datasetIdentifier', 
            header: 'ID',
            size: 50,
          },
          {
            accessorKey: 'name',
            header: 'Name',
            size: 100,
          },
          {
            accessorKey: 'noGlycans',
            header: '# Glycans',
            size: 30,
            id: "glycanNo",
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            accessorKey: 'noProteins',
            header: '# Proteins',
            id: "proteinNo",
            size: 30,
            enableColumnFilter: false,
            enableSorting: false,
          },
          {
            accessorKey: 'license.name', 
            header: 'License',
            id: "license",
            size: 100,
            enableColumnFilter: false,
            enableSorting: false,
          },
        ],
        [],
    );
    
    const saveColumnVisibilityChanges = (columnVisibility) => {
        var columnSettings = [];
        for (var column in columnVisibility) {
            columnSettings.push ({
            "tableName": "DATASET",
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
                  title="Your public datasets"
                  subTitle="The table below displays the list of your public datasets. New datasets may be added, existing datasets can be edited​
and retracted."
              />
              <TextAlert alertInput={textAlertInput}/>
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <Card>
                <Card.Body>
                    <div className="text-center mb-4">
                    <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.publishdataset)}>
                Publish new dataset
                </Button>
              </div>
              <Table
                  authCheckAgent={props.authCheckAgent}
                  ws="api/dataset/getdatasets"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  edit={stringConstants.routes.addDataset + "?datasetid="}
                  deletews="api/dataset/retractdataset/"
                  initialSortColumn="name"
                  rowId="datasetIdentifier"
                  detailPanel={true}
                  columnsettingsws="api/setting/getcolumnsettings?tablename=DATASET"
                  saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
    );
}

export default Dataset;