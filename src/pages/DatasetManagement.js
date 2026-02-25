import { Box, Container } from "@mui/material";
import FeedbackWidget from "../components/FeedbackWidget";
import DialogAlert from "../components/DialogAlert";
import { useEffect, useMemo, useReducer } from "react";
import { PageHeading } from "../components/FormControls";
import TextAlert from "../components/TextAlert";
import { Button, Card } from "react-bootstrap";
import Table from "../components/Table";

const DatasetManagement = (props) => {

    useEffect(props.authCheckAgent, []);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
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
                accessorKey: 'noRows',
                header: '# Records',
                size: 30,
                id: "rowNo",
                enableColumnFilter: false,
                enableSorting: false,
            },
            {
                accessorKey: 'dateCreated', 
                header: 'Creation Date',
                id: "dateCreated",
                size: 50,
            },
            {
                accessorKey: 'versionDate', 
                header: 'Last Update',
                id: "versionDate",
                size: 50,
                enableColumnFilter: false,
            },
            {
                accessorKey: 'version', 
                header: 'Current Version',
                id: "version",
                size: 20,
                enableColumnFilter: false,
            },
            {
                accessorFn: (row) => row.removed ? "removed" : row.retracted ? "retracted" : "published",
                header: 'Status',
                id: "retracted",
                size: 100,
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ renderedCellValue, row }) => (
                    <Box
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        }}
                    >
                        {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                        {(renderedCellValue === "retracted" || renderedCellValue === "removed") ? <span style={{color: "red"}}>{renderedCellValue}</span>
                        : <span>{renderedCellValue}</span>
                        }
                    </Box>
                ),
            },
        ],
        [],
    );

    return (
        <>
            <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
            <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Manage datasets"
                  subTitle="The table below displays the list of all public datasets. An admin user can delete (retract/hide) or recover (unhide) datasets"
              />
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <Card>
                <Card.Body>   
                <Table
                    authCheckAgent={props.authCheckAgent}
                    ws="api/dataset/getalldatasets"
                    columns={columns}
                    enableRowActions={true}
                    setAlertDialogInput={setAlertDialogInput}
                    deletews="api/dataset/retractdataset/"
                    recoverws="api/dataset/recoverdataset/"
                    initialSortColumn="name"
                    rowId="datasetIdentifier"
                    detailPanel={true}
                    deletelabel="Retract"
                />
            </Card.Body>
          </Card>
       </div>
        </Container>
        </>
    );
};

export { DatasetManagement };