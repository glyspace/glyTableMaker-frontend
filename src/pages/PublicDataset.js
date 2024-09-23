import { useNavigate, useParams } from "react-router-dom";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import { getAuthorizationHeader, getJson, getJsonAsync, postJson } from "../utils/api";
import { useEffect, useMemo, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { axiosError } from "../utils/axiosError";
import { GrantsOnDataset } from "../components/GrantsOnDataset";
import { PubOnDataset } from "../components/PubOnDataset";
import { Button, Card, Col, Form, Image, Row } from "react-bootstrap";
import { FormLabel, Title } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { DatabasesOnDataset } from "../components/DatabasesOnDataset";
import "./PublicDataset.css";
import Table from "../components/Table";
import { Tooltip } from "@mui/material";

const PublicDataset = (props) => {
    let { datasetId } = useParams();

    const navigate = useNavigate();

    const [dataset, setDataset] = useState();
    const [descOpen, setDescOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedVersion, setSelectedVersion] = useState("");
    const [listVersions, setListVersions] = useState ([]);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    useEffect(() => {
        if (datasetId) {
            fetchData();
        }
    }, [datasetId]);

    const fetchData = async () => {
        setIsLoading(true);
        getJson (stringConstants.api.getpublicdataset + "/" + datasetId).then ((data) => {
            setDataset (data.data.data);
            setIsLoading(false);
            setListVersions(data.data.data.versions);
            if (!datasetId.includes("-")) {
              setSelectedVersion("latest");
            } else {
              setSelectedVersion (datasetId.substring(datasetId.indexOf("-")+1));
            }
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setErrorMessage(error.response.data.message);
                setIsLoading(false);
                return;
            } else {
                setIsLoading(false);
                axiosError(error, null, setAlertDialogInput);
                return;
            }
        });
    }

    const getFullName = user => {
        return user.firstName ? user.firstName + (user.lastName ? " " + user.lastName : "") : user.username;
    }

    const getDateCreated = dateCreated => {
        const d = new Date(dateCreated);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate() + 1;
        return `${month}/${day}/${year}`;
    }

    const getDetails = () => {
        return (
            <>
            <div>
                <strong>Dataset Name: </strong>
                {dataset.name}
            </div>
            <div>
                <strong>Publish Date: </strong>
                {getDateCreated(dataset.dateCreated)}
            </div>
    
            {dataset.description && (
                <div>
                <strong>Description: </strong>
                {getDescription(dataset.description)}
                <button className={"more-less"} onClick={() => setDescOpen(!descOpen)}>
                    {dataset.description.length > 150 && !descOpen ? `more` : descOpen ? `less` : ``}
                </button>
                </div>
            )}
            </>
        );
    };
        
    const getDescription = desc => {
        return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
    };

    const getCellValue = (row, columnName, id, uri) => {
      var value = "";
      row.columns.forEach ((col) => {
        if (col.glycanColumn) {
          if (col.glycanColumn === columnName) {
            value = col.value;
          }
        } else if (col.datatype) {
          if (col.datatype.name === columnName) {
            if (id) {
              value = col.valueId;
            } else if (uri) {
              value =  col.valueUri;
            } else { 
              value =  col.value;
            }
          }
        }
      });

      return value;
    }

    const columns = useMemo (
      () => [
        {
          accessorFn: (row) => getCellValue (row, 'GlytoucanID'),
          header: 'GlyTouCan ID',
          id: '1',
          size: 50,
        },
        {
          accessorFn: (row) => row.cartoon,
          header: 'Image',
          id: 'cartoon',
          size: 150,
          enableColumnFilter: false,
          enableSorting: false,
          Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />
        },
        {
          accessorFn: (row) => getCellValue (row, 'Evidence'),
          id: "2",
          header: 'Evidence',
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Species', true),
          header: 'Species',
          id: "3",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Strain'),
          header: 'Strain',
          id: "4",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Tissue', true),
          header: 'Tissue',
          id: "5",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cell line ID', true),
          header: 'Cell line ID',
          id: "6",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Disease', true),
          header: 'Disease',
          id: "7",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Glycan dictionary term ID'),
          header: 'Glycan dictionary term ID',
          id: "8",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'has_abundance'),
          header: 'has_abundance',
          id: "9",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'has_expression'),
          header: 'has_expression',
          id: "10",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Functional annotation/Keyword'),
          header: 'Functional annotation/Keyword',
          id: "11",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Experimental technique'),
          header: 'Experimental technique',
          id: "12",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Variant (Fly, yeast, mouse)'),
          header: 'Variant (Fly, yeast, mouse)',
          id: "13",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Organismal/cellular Phenotype', true),
          header: 'Organismal/cellular Phenotype',
          id: "14",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Molecular Phenotype'),
          header: 'Molecular Phenotype',
          id: "15",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Contributor'),
          header: 'Contributor',
          id: "16",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Comment'),
          header: 'Comment',
          id: "17",
          size: 100,
        }
      ],
      [],
    );

    const saveColumnVisibilityChanges = (columnVisibility) => {
      props.authCheckAgent && props.authCheckAgent();
      var columnSettings = [];
      for (var column in columnVisibility) {
        columnSettings.push ({
          "tableName": "DATASETMETADATA",
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

    const download = () => {
      //TODO download csv file
    }

    const getData = () => {
        return (
        <>
        <Table 
            columns={columns} 
            data={dataset.data} 
            detailPanel={false}
            enableRowActions={false}
            initialSortColumn="1"
            rowId="1"
            columnsettingsws="api/setting/getcolumnsettings?tablename=DATASETMETADATA"
            saveColumnVisibilityChanges={saveColumnVisibilityChanges}
        />
        </>)
    }

    const getSubmitterDetails = (submitterinfo) => {
        return (
          <>
          <div>
            <strong>Username: </strong>
            {/*submitterinfo.userName*/}
            {submitterinfo.username}
          </div>
          <div>
            <strong>Full Name: </strong>
            <span
            >{getFullName(submitterinfo)}</span>
          </div>
          {submitterinfo.groupName && (
            <div>
              <strong>Group Name: </strong>
              {submitterinfo.groupName}
            </div>
          )}
          {submitterinfo.department && (
            <div>
              <strong>Department: </strong>
              {submitterinfo.department}
            </div>
          )}
          {submitterinfo.affiliation && (
            <div>
              <strong>Institution: </strong>
              {submitterinfo.affiliation}
            </div>
          )}
        </>);
    }

    const getVersion = (versionName) => {
      if (versionName.includes ("latest")) {
        const v = listVersions.find ((version) => version.head === true);
        return v;
      }
      const v = listVersions.find ((version) => version.version === versionName);
      return v;
    }

    const getVersionString = (version) => {
      return "Version (" + (version.head ? "latest" : version.version)  + (version.versionDate ? ", " + version.versionDate + ")" :  ")");
    } 

    const getDatasetVersion = (versionName) => {
      var version;
      if (versionName.includes("latest")) {
        version = listVersions.find ((version) => version.head === true);
      } else {
        version = listVersions.find ((v) => v.version === versionName);
      }

      const datasetIdentifier = version.head ? datasetId : datasetId + "-" + version.version;
      setIsLoading(true);
      getJson (stringConstants.api.getpublicdataset + "/" + datasetIdentifier).then ((data) => {
          setDataset (data.data.data);
          setIsLoading(false);
      }).catch (function(error) {
          if (error && error.response && error.response.data) {
              setErrorMessage(error.response.data.message);
              setIsLoading(false);
              return;
          } else {
              setIsLoading(false);
              axiosError(error, null, setAlertDialogInput);
              return;
          }
      });
    }

    return (
        <>
        <FeedbackWidget />
        <DialogAlert
            alertInput={alertDialogInput}
            setOpen={input => {
                setAlertDialogInput({ show: input });
            }}
        />
        <div style={{margin: "30px"}}>
        {dataset ? (
          <>
            <Row style={{marginBottom: "30px"}}>
              <Col md={8}>
                <Card style={{ height: "100%" }}>
                  <Card.Body>
                    <Title title="Summary" />
                    {getDetails()}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} style={{display: "flex",  flexDirection: "column"}}>
                <Card style={{ height: "100%", marginBottom: "30px" }}>
                  <Card.Body>
                    <Title title="Submitter" />
                    {dataset.user && dataset.user.username ? (
                      getSubmitterDetails(dataset.user)
                    ) : null}
                  </Card.Body>
                </Card>

                <Card style={{ height: "100%" }}>
                  <Card.Body>
                    <Title title="License" />
                    <div className="text-center">
                      <a href={dataset.license.url} target="_blank" rel="noopener noreferrer">
                        {dataset.license.name}</a>
                      <p>{dataset.license.name}</p>
                      {/**  <a href={"https://creativecommons.org/licenses/by/4.0/"} target="_blank" rel="noopener noreferrer">
                        <Image src={licenseLogo} className="licenseIcons" />
                      </a> */}
                    </div>
                  </Card.Body>
                </Card>

            </Col>
            </Row>
            <Card style={{marginBottom: "30px"}}>
              <Loading show={isLoading} />
              <Card.Body>
                <Title title="Versions" />
                
                <div className="pt-2">
                  <Row>
                  <Col xs={8} lg={8}>
                  <Form.Group className="pb-3">
                    
                      <FormLabel label={"Rendered Version"} />
                      <Form.Select
                        name="renderedVersion "
                        value={selectedVersion}
                        onChange={e => {
                          setSelectedVersion(e.target.value);
                          getDatasetVersion(e.target.value);
                        }}
                      >
                        {listVersions && listVersions.length > 0 ? (
                          listVersions.map(ver => {
                            return <option value={ver.head ? "latest" : ver.version}>{getVersionString(ver)}</option>;
                          })
                        ) : (
                          <option value={selectedVersion}>{getVersionString(getVersion(selectedVersion))}</option>
                        )}
                      </Form.Select>
                    
                  </Form.Group>
                  </Col>
                  <Col>
                  <Tooltip title="Download table data">
                  <Button variant="contained" className="gg-btn-blue-rightalign" style={{marginTop: '10px', marginRight: '15px'}}
                    onClick={()=>download()}> 
                        Download
                  </Button>
                  </Tooltip>
                  </Col> </Row>
                  {getData()}
                </div>
              </Card.Body>
            </Card>
            <Card style={{marginBottom: "30px"}}>
              <Card.Body>
                <Title title="Publications" />
                {dataset.publications && dataset.publications.length > 0 ? (
                  <PubOnDataset publications={dataset.publications} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>

            <Card style={{marginBottom: "30px"}}>
              <Card.Body>
                <Title title="Associated Papers" />
                {dataset.associatedPapers && dataset.associatedPapers.length > 0 ? (
                  <PubOnDataset publications={dataset.associatedPapers} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>

            <Card style={{marginBottom: "30px"}}>
              <Card.Body>
                <Title title="Grants" />
                {dataset.grants && dataset.grants.length > 0 ? (
                  <GrantsOnDataset grants={dataset.grants} fromPublicDatasetPage={true} />
                ) : (
                  <span>No data available</span>
                )}
              </Card.Body>
            </Card>
            <Card style={{marginBottom: "30px"}}>
              <Card.Body>
                <Title title="Associated Datasources" />
                {dataset.associatedDatasources && dataset.associatedDatasources.length > 0 ? (
                    <DatabasesOnDataset
                        associatedDatasources={dataset.associatedDatasources}
                        fromPublicDatasetPage={true}/> 
                ) : (
                    <span>No data available</span>  
                )}
                </Card.Body>
                </Card>
            
        
            <div className="text-center">
              <Button className="gg-btn-blue" onClick={() => navigate("/data")}>
                Back
              </Button>
            </div>
          </>
        ) : (
          <> No data available </>
        )}
      </div>
        </>
    )
}

export { PublicDataset }