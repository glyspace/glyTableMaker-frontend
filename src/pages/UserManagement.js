import { Box, Container, IconButton, Tooltip } from "@mui/material"
import FeedbackWidget from "../components/FeedbackWidget"
import { useEffect, useMemo, useReducer, useState } from "react";
import DialogAlert from "../components/DialogAlert";
import InfoIcon from '@mui/icons-material/Info';
import { PageHeading } from "../components/FormControls";
import { Card } from "react-bootstrap";
import Table from "../components/Table";
import { Loading } from "../components/Loading";
import { deleteJson, getAuthorizationHeader, getJson, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import { axiosError } from "../utils/axiosError";

const UserManagement = (props) => {

    useEffect(() => {
        props.authCheckAgent && props.authCheckAgent();
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
    );

    const fetchData = async () => {
        if (!data.length) {
          setIsLoading(true);
        } 
        getJson ("api/account/getusers", getAuthorizationHeader()).then ( (json) => {
            setData(json.data.data.objects);
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

    const disableUser = (id) => {
        setTextAlertInput({"show": false, "message":""});
        setIsLoading(true);
        deleteJson ("api/account/disable/" + id, getAuthorizationHeader()).then ( (data) => {
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

    const enableUser = (id) => {
        setTextAlertInput({"show": false, "message":""});
        setIsLoading(true);
        postJson ("api/account/enable/" + id, null, getAuthorizationHeader()).then ( (data) => {
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

    const columns = useMemo(
        () => [
            {
                accessorKey: 'userName', 
                header: 'User Name',
                size: 50,
                Cell: ({renderedCellValue, row}) => (
                    <Box
                        sx={{
                        display: 'flex',
                        alignItems: 'center',
                        }}
                    >
                    <Tooltip title={`Name: ${row.original.firstName || ""} ${row.original.lastName || ""} Affiliation: ${row.original.affiliation || ""}`}>
                        <IconButton href={row.original.affiliationWebsite || undefined} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label="Visit organization" 
                            size="small" >
                            <InfoIcon />
                        </IconButton>
                    </Tooltip>
                    {renderedCellValue}
                    </Box>
                ),
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 100,
            },
            {
                accessorKey: 'dateCreated', 
                header: 'Creation Date',
                id: "dateCreated",
                size: 50,
            },
            {
                accessorKey: 'lastLoginDate', 
                header: 'Last Login Date',
                id: "loginDate",
                size: 50,
                enableColumnFilter: false,
            },
            {
                accessorKey: 'datasetNo',
                header: '# Public Datasets',
                size: 30,
                id: "rowNo",
            },
            {
                accessorFn: (row) => row.enabled ? "enabled" : "disabled",
                header: 'Status',
                id: "enabled",
                size: 120,
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
                        {(renderedCellValue === "disabled") ? <span style={{color: "red"}}>{renderedCellValue}</span>
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
            <Loading show={isLoading}></Loading>
            <TextAlert alertInput={textAlertInput}/>
            <Container maxWidth="xl">
            <div className="page-container">
              <PageHeading
                  title="Manage users"
                  subTitle="The table below displays the list of all users. An admin user can enable/disable users or promote them"
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
                    data={data}
                    columns={columns}
                    enableRowActions={true}
                    setAlertDialogInput={setAlertDialogInput}
                    delete={disableUser}
                    recover={enableUser}
                    initialSortColumn="userName"
                    rowId="userName"
                    deletelabel="Disable"
                    recoverLabel="Enable"
                />
            </Card.Body>
          </Card>
       </div>
        </Container>
        </>
    );
};

export { UserManagement };