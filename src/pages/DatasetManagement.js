import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Table as MTable, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import FeedbackWidget from "../components/FeedbackWidget";
import DialogAlert from "../components/DialogAlert";
import { useEffect, useMemo, useReducer, useState } from "react";
import { PageHeading } from "../components/FormControls";
import { Card } from "react-bootstrap";
import Table from "../components/Table";

const DatasetManagement = (props) => {

    useEffect(props.authCheckAgent, []);

    const [openGlygenErrorDialog, setOpenGlygenErrorDialog] = useState(false);
    const [glygenError, setGlygenError] = useState({"excluded_records": []});

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const handleOpenGlygenErrorDialog = (error) => {
        if (error) {
            setGlygenError(JSON.parse(error)); 
            setOpenGlygenErrorDialog(true);
        }
    };

    const handleCloseGlygenErrorDialog = () => {
        setOpenGlygenErrorDialog(false);
    };

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
            },
            {
                accessorKey: 'version', 
                header: 'Current Version',
                id: "version",
                size: 20,
            },
            {
                accessorFn: (row) => {
                    if (row.error) {
                        var err = JSON.parse(row.error);
                        if (err.excluded_records) return err.excluded_records.length;
                    }
                    return 0;
                },
                header: '# of Glygen Errors',
                id: "errors",
                size: 50,
                enableColumnFilter: false,
                enableSorting: false,
                Cell: ({ renderedCellValue, row }) => (
                    <Box
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        }}
                    >
                        <span
                            style={renderedCellValue === 0 ? {} :{ color: "#1976d2", cursor: "pointer"}}
                            onClick={() => handleOpenGlygenErrorDialog(row.original.error)}
                        >
                            {renderedCellValue}
                        </span>
                    </Box>
                ),
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

               <Dialog open={openGlygenErrorDialog} onClose={handleCloseGlygenErrorDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Excluded Records</DialogTitle>

                <DialogContent>
                    {glygenError.excluded_records.length === 0 ? (
                    <p>No excluded records</p>
                    ) : (
                    
                    <MTable size="small">
                        <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 120 }}>Row Index</TableCell>
                            <TableCell>Exclusion Reason(s)</TableCell>
                        </TableRow>
                        </TableHead>

                        <TableBody>
                        {glygenError.excluded_records.map((record) => (
                            <TableRow key={record.row_index}>
                            <TableCell>{record.row_index}</TableCell>

                            <TableCell>
                                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                                {record.exclusion_flags.map((flag) => (
                                    <li key={flag}>
                                    <Typography variant="body2">
                                        {glygenError.exclusion_flag_desc[flag] ??
                                        `Unknown exclusion flag: ${flag}`}
                                    </Typography>
                                    </li>
                                ))}
                                </ul>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </MTable>

                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseGlygenErrorDialog}>Close</Button>
                </DialogActions>
                </Dialog>


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
                    admin={true}
                />
            </Card.Body>
          </Card>
       </div>
        </Container>
        </>
    );
};

export { DatasetManagement };