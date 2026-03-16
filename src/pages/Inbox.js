import { useEffect, useMemo, useReducer, useState } from "react";
import FeedbackWidget from "../components/FeedbackWidget";
import { Loading } from "../components/Loading";
import TextAlert from "../components/TextAlert";
import { Box, Container, Dialog, DialogActions, DialogContent, DialogTitle, Table as MTable, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { FormLabel, PageHeading } from "../components/FormControls";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Row } from "react-bootstrap";
import Table from "../components/Table";

const Inbox = props => {

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openViewMessage, setOpenViewMessage] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
  
    const [alertDialogInput, setAlertDialogInput] = useReducer(
          (state, newState) => ({ ...state, ...newState }),
          { show: false, id: "" }
    );
  
    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    useEffect(() => {
        props.authCheckAgent();
        fetchData();
    }, []);

    const fetchData = async () => {
        if (!data.length) {
            setIsLoading(true);
        } 
        getJson ("api/account/inbox", getAuthorizationHeader()).then ( (json) => {
            setData(json.data.data);
            setIsLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                setIsLoading(false);
                return;
            } else {
                setIsLoading(false);
                axiosError(error, null, setAlertDialogInput);
                return;
            }
        });
    }

    const columns = useMemo(
        () => [
            {
                id: 'unreadDot',
                header: '',
                size: 36,
                enableSorting: false,
                enableColumnFilter: false,
                Cell: ({ row }) => (
                    <Box
                        aria-label={row.original.status === "UNREAD" ? 'Unread message' : 'Read message'}
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: row.original.status === "UNREAD" ? 'primary.main' : 'transparent',
                        }}
                    />
                ),
            },
            {
                accessorKey: 'title', 
                header: 'Subject',
                size: 100,
            },
            {
                accessorKey: 'type',
                header: 'Type',
                size: 50,
            },
            {
                accessorFn: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : null,
                header: 'Received At',
                id: "receivedAt",
                size: 50,
            },
        ],
        [],
    );

    const deleteMessage = (id) => {
        setTextAlertInput({"show": false, "message":""});
        setIsLoading(true);
        deleteJson ("api/account/inbox/" + id, getAuthorizationHeader()).then ( (data) => {
            fetchData();
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                setIsLoading(false);
            } else {
                setIsLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const viewMessage = (id) => {
        setTextAlertInput({"show": false, "message":""});
        const message = data.find ((m) => m.id === id);
        setSelectedMessage(message);
        if (message.status === "UNREAD") {
            setIsLoading(true);
            postJson ("api/account/inbox/" + id + "/read", null, getAuthorizationHeader()).then ( (data) => {
                setIsLoading(false);
                setOpenViewMessage(true);
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInput ({"show": true, "message": error.response.data.message });
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                    axiosError(error, null, setAlertDialogInput);
                }
            });
        } else {
            setOpenViewMessage(true);
        }
    }

    const handleCloseViewMessage = () => {
        setOpenViewMessage(false);
    };

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
            <Loading show={isLoading}></Loading>
            <TextAlert alertInput={textAlertInput}/>
            <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Messages"
                  subTitle="Your messages, transfer requests, error message notifications displayed below"
              />
              <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
              <Card>
                <Card.Body>   
                    {selectedMessage && (
                <Dialog open={openViewMessage} onClose={handleCloseViewMessage} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedMessage.title}</DialogTitle>
                <DialogContent>
                    <Row>
                        <Col>
                            <FormLabel label="Message:"/>
                        </Col>
                        <Col>{selectedMessage.message}</Col>
                    </Row>
                    {selectedMessage.sender && 
                        <Row>
                            <Col>
                            <FormLabel label="From:"/>
                        </Col>
                        <Col>{selectedMessage.sender}
                        </Col>                        
                        </Row>}
                    <Row>
                        <Col>
                            <FormLabel label="Date Received:"/>
                        </Col>
                        <Col>{new Date(selectedMessage.createdAt).toLocaleString()}</Col>
                    </Row>
                    {selectedMessage.type !== "Transfer Request" ? 
                    <>
                    <FormLabel label="Errors:"/>
                    <MTable size="small">
                        <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 120 }}>Row Index</TableCell>
                            <TableCell>Exclusion Reason(s)</TableCell>
                        </TableRow>
                        </TableHead>

                        <TableBody>
                        {selectedMessage.metadata.excluded_records.map((record) => (
                            <TableRow key={record.row_index}>
                            <TableCell>{record.row_index}</TableCell>

                            <TableCell>
                                <ul style={{ margin: 0, paddingInlineStart: 18 }}>
                                {record.exclusion_flags.map((flag) => (
                                    <li key={flag}>
                                    <Typography variant="body2">
                                        {selectedMessage.metadata.exclusion_flag_desc[flag] ??
                                        `Unknown exclusion flag: ${flag}`}
                                    </Typography>
                                    </li>
                                ))}
                                </ul>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </MTable></> : <span>Transfer Request</span>}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseViewMessage}>Close</Button>
                </DialogActions>
                </Dialog>)}

                <Table
                    authCheckAgent={props.authCheckAgent}
                    data={data}
                    columns={columns}
                    enableRowActions={true}
                    setAlertDialogInput={setAlertDialogInput}
                    delete={deleteMessage}
                    view={viewMessage}
                    initialSortColumn="receivedAt"
                    rowId="id"
                    deletelabel="Delete"
                />
            </Card.Body>
          </Card>
        </div>
        </Container>
        </>
    );
}

export { Inbox };