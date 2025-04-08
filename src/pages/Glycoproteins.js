import { useEffect, useMemo, useReducer, useState } from "react";
import FeedbackWidget from "../components/FeedbackWidget";
import { Container } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Nav, NavDropdown } from "react-bootstrap";
import { StatusMessage } from "../components/StatusMessage";
import Table from "../components/Table";
import { Loading } from "../components/Loading";
import stringConstants from '../data/stringConstants.json';
import { getAuthorizationHeader, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Link, useNavigate } from "react-router-dom";

const Glycoproteins = (props) => {

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [showLoading, setShowLoading] = useState(false);

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [batchUpload, setBatchUpload] = useState(false);

    const navigate = useNavigate();

    const columns = useMemo(
        () => [
          {
            accessorKey: 'uniprotId', 
            header: 'UniProtKB Accession',
            size: 50,
          },
          {
            accessorKey: 'name', 
            header: 'Name',
            size: 100,
          },
          {
            accessorKey: 'proteinName', 
            header: 'Protein Name',
            size: 100,
          },
          {
            accessorKey: 'sites.length', 
            header: '# Sites',
            id : "siteNo",
            size: 80,
            Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
          },
          {
            accessorFn: (row) => row.tags.map(tag => tag.label),
            header: 'Tags',
            id: "tags",
            size: 100,
            Cell: ({ cell }) => (
              <ul id="tags">
                    {cell.getValue() && cell.getValue().length > 0 && cell.getValue().map((tag, index) => (
                    <li key={index} className="tag_in_table">
                        <span className='tag-title'>{tag}</span>
                    </li>
                    ))}
                </ul>
            ),
          },
        ],
        [],
      );

    // eslint-disable-next-line react-hooks/exhaustive-deps 
    useEffect(props.authCheckAgent, []);

    const saveColumnVisibilityChanges = (columnVisibility) => {
        var columnSettings = [];
        for (var column in columnVisibility) {
        columnSettings.push ({
            "tableName": "GLYCOPROTEIN",
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
                title="Your Glycoproteins"
                subTitle="The table below displays a list of all glycoproteins that have been uploaded. New glycoproteins may be added, 
                old glycoproteins can be edited, and unused glycoproteins can
                be removed."
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
                    <Button variant="contained" className="gg-btn-blue-sm" style={{marginLeft:"5px", marginTop:"-1px"}}
                        onClick={()=>navigate(stringConstants.routes.addglycoprotein)}> 
                            Add a Glycoprotein
                    </Button>

                    <Nav className={ "gg-dropdown-nav"} 
                    style={{display:"inline-block", borderRadius:".5rem"}} 
                    disabled={batchUpload}>
                    <div
                        type="button"
                        className="gg-btn-blue-sm gg-dropdown-btn"
                        style={{
                        marginLeft: "5px", marginTop: "1.2px"
                        }}>
                        <span  style={{display:"inline-block"}}>
                            <NavDropdown
                            className={ "gg-dropdown-navbar gg-dropdown-navitem"}
                            style={{display:"inline-block", padding: "0px !important"}}
                            title="Add Glycoproteins(s) from File"
                            id="gg-dropdown-navbar2"
                            >
                            <NavDropdown.Item as={Link} to={`${stringConstants.routes.addglycoproteinfromfile}?type=byonic`}>
                                Byonic glycoprotein file (.csv)
                            </NavDropdown.Item>
                            </NavDropdown>
                        </span>
                    </div>
                    </Nav>
                    <StatusMessage
                        ws="api/data/checkbatchupload?type=GLYCOPROTEIN"
                        pageURL="/glycoproteins/fileupload"
                        setBatchUpload={setBatchUpload}
                        setAlertDialogInput={setAlertDialogInput}/>
                </div>
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    ws="api/data/getglycoproteins"
                    columns={columns}
                    enableRowActions={true}
                    setAlertDialogInput={setAlertDialogInput}
                    deletews="api/data/deleteglycoprotein/"
                    addtagws="api/data/addglycoproteintag/"
                    showEdit={true}
                    edit={stringConstants.routes.addglycoprotein + "?glycoproteinId="}
                    gettagws="api/data/getglycantags"
                    initialSortColumn="dateCreated"
                    rowId="id"
                    columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCOPROTEIN"
                    saveColumnVisibilityChanges={saveColumnVisibilityChanges}
                />
                </Card.Body>
            </Card>
        </div>
        <Loading show={showLoading}></Loading>
        </Container>
        </>
    )
}

export default Glycoproteins;