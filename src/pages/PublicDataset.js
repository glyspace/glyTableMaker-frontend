import { useNavigate, useParams } from "react-router-dom";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import { getAuthorizationHeader, getJson, postJson, postToAndGetBlob } from "../utils/api";
import { useEffect, useMemo, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { axiosError } from "../utils/axiosError";
import { GrantsOnDataset } from "../components/GrantsOnDataset";
import { PubOnDataset } from "../components/PubOnDataset";
import { Button, Card, Col, Form, Image, Modal, Row } from "react-bootstrap";
import { Table as BootstrapTable } from "react-bootstrap";
import { FormLabel, Title } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { DatabasesOnDataset } from "../components/DatabasesOnDataset";
import "./PublicDataset.css";
import Table from "../components/Table";
import { Tooltip } from "@mui/material";
import TextAlert from "../components/TextAlert";
import VersionAlert from "../components/VersionAlert";

const PublicDataset = (props) => {
    let { datasetId } = useParams();

    const navigate = useNavigate();

    const [dataset, setDataset] = useState();
    const [descOpen, setDescOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [selectedVersion, setSelectedVersion] = useState("");
    const [listVersions, setListVersions] = useState ([]);

    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
      (state, newState) => ({ ...state, ...newState }),
      { show: false, id: "" }
    );

    const [versionData, setVersionData] = useState ([]);
    const [showVersionLog, setShowVersionLog] = useState(false);
    const [datasetType, setDatasetType] = useState("GLYCAN");

    useEffect(() => {
        if (datasetId) {
            fetchData();
        }
    }, [datasetId]);

    const fetchData = async () => {
        setIsLoading(true);
        getJson (stringConstants.api.getpublicdataset + "/" + datasetId).then ((data) => {
            setDataset (data.data.data);
            if (data.data.data.glycoproteinData && data.data.data.glycoproteinData.length > 0) 
              setDatasetType ("GLYCOPROTEIN");
            setIsLoading(false);
            const versionList = data.data.data.versions;
            versionList.sort((a, b) => a.version > b.version ? -1 : a.version < b.version ? 1 : 0);
            setListVersions(versionList);
            if (!datasetId.includes("-")) {
              setSelectedVersion("latest");
              setVersionData([]);
            } else {
              const v = datasetId.substring(datasetId.indexOf("-")+1);
              setVersionData ([{"title": "You are viewing an earlier version (" + v + ") of the dataset.",
                "description" : "Latest version can be found here: ",
                "url": datasetId.substring(0, datasetId.indexOf("-")),
                "url_name" : datasetId.substring(0, datasetId.indexOf("-"))
              }]);
              setSelectedVersion (v);
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
                <strong>Dataset ID: </strong>
                {dataset.datasetIdentifier}
            </div>
            <div>
                <strong>Dataset Name: </strong>
                {dataset.name}
            </div>
            <div>
                <strong>Dataset Type: </strong>
                {datasetType}
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
            {dataset.notes && (
                <div>
                <strong>Notes: </strong>
                {getNotes(dataset.notes)}
                <button className={"more-less"} onClick={() => setNotesOpen(!notesOpen)}>
                    {dataset.notes.length > 150 && !notesOpen ? `more` : notesOpen ? `less` : ``}
                </button>
                </div>
            )}
            </>
        );
    };
        
    const getDescription = desc => {
        return desc.length > 150 && !descOpen ? `${desc.substring(0, 100)}...` : descOpen ? `${desc}` : desc;
    };

    const getNotes = desc => {
        return desc.length > 150 && !notesOpen ? `${desc.substring(0, 100)}...` : notesOpen ? `${desc}` : desc;
    };

    const getCellValue = (row, columnName, id, uri) => {
      var value = "";
      row.columns.forEach ((col) => {
        if (col.glycanColumn) {
          if (col.glycanColumn === columnName) {
            value = col.value;
          }
        } else if (col.glycoproteinColumn) {
          if (col.glycoproteinColumn === columnName) {
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

    const proteinColumns = useMemo (
      () => [
        {
          accessorFn: (row) => getCellValue (row, 'UniProtID'),
          header: 'UniProtKB Accession',
          id: '1',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'GlyTouCanID'),
          header: 'GlyTouCan ID',
          id: '2',
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
          accessorFn: (row) => getCellValue (row, 'AminoAcid'),
          header: 'Amino Acid',
          id: '3',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Site'),
          header: 'Site/Position',
          id: '4',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'GlycosylationType'),
          header: 'Glycosylation Type',
          id: '5',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'GlycosylationSubtype'),
          header: 'Glycosylation Subtype',
          id: '6',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Evidence'),
          id: "7",
          header: 'Evidence',
          Cell: ({ cell }) => {
            if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Species'),
          header: 'Species',
          id: "speciesValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Species', true),
          header: 'Species ID',
          id: "8",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Strain'),
          header: 'Strain',
          id: "9",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Tissue'),
          header: 'Tissue',
          id: "tissueValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Tissue', true),
          header: 'Tissue ID',
          id: "10",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cell line ID'),
          header: 'Cell line',
          id: "celllineValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cell line ID', true),
          header: 'Cell line ID',
          id: "11",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Disease'),
          header: 'Disease',
          id: "diseaseValue",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Disease', true),
          header: 'Disease ID',
          Cell: ({ cell }) => {
            if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          id: "12",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Functional annotation/Keyword'),
          header: 'Functional annotation/Keyword',
          id: "13",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Experimental technique'),
          header: 'Experimental technique',
          id: "14",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cellular Component'),
          header: 'Cellular Component',
          id: "cellularCompValue",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cellular Component', true),
          header: 'Cellular Component ID',
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          id: "17",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Contributor'),
          header: 'Contributor',
          id: "15",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Comment'),
          header: 'Comment',
          id: "16",
          size: 100,
        }
      ],
      [],
    );

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
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Species'),
          header: 'Species',
          id: "speciesValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Species', true),
          header: 'Species ID',
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
          accessorFn: (row) => getCellValue (row, 'Tissue'),
          header: 'Tissue',
          id: "tissueValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Tissue', true),
          header: 'Tissue ID',
          id: "5",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cell line ID'),
          header: 'Cell line',
          id: "celllineValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cell line ID', true),
          header: 'Cell line ID',
          id: "6",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Disease'),
          header: 'Disease',
          id: "diseaseValue",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Disease', true),
          header: 'Disease ID',
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
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
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          id: "11",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Experimental technique'),
          header: 'Experimental technique',Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
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
          accessorFn: (row) => getCellValue (row, 'Organismal/cellular Phenotype'),
          header: 'Organismal/cellular Phenotype',
          id: "phenotypeValue",
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Organismal/cellular Phenotype', true),
          header: 'Organismal/cellular Phenotype ID',
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
          accessorFn: (row) => getCellValue (row, 'Cellular Component'),
          header: 'Cellular Component',
          id: "cellularCompValue",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'Cellular Component', true),
          header: 'Cellular Component ID',
          id: "18",
          Cell: ({ cell }) => {
             if (cell.getValue() === null) {
              return <></>
            } else {
              const items = cell.getValue().split('|'); // Split the string by '|'
              return (
                <>
                  {items.map((item, index) => (
                    <div key={index}>{item}</div> // Render each item in a separate div (or other element)
                  ))}
                </>
              );
            }
          },
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
      props.authCheckAgent && props.authCheckAgent(true);
      var columnSettings = [];
      const tableName = datasetType === "GLYCAN" ? "DATASETMETADATA" : "DATASETGLYCOPROTEINMETADATA";
      for (var column in columnVisibility) {
        columnSettings.push ({
          "tableName": tableName,
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
      // download csv file
      var tableDef = {
        "filename" : "GlygenDataset-" + datasetId,
      }
      if (datasetType === "GLYCAN") {
        tableDef["data"] = dataset.data;
      } else {
        tableDef["glycoproteinData"] = dataset.glycoproteinData;
      }
      setIsLoading(true);
      setTextAlertInput({"show": false, id: ""});
      let url = "api/public/downloadtable";
      postToAndGetBlob (url, tableDef).then ( (data) => {
          const contentDisposition = data.headers.get("content-disposition");
          const fileNameIndex = contentDisposition.indexOf("filename=") + 10;
          const fileName = contentDisposition.substring(fileNameIndex, contentDisposition.length-1);

          //   window.location.href = fileUrl;
          var fileUrl = URL.createObjectURL(data.data);
          var a = document.createElement("a");
          document.body.appendChild(a);
          a.style = "display: none";
          a.href = fileUrl;
          a.download = fileName;
          a.click();

          window.URL.revokeObjectURL(fileUrl);
          setIsLoading(false);
        }).catch (function(error) {
          if (error && error.response && error.response.data) {
              //setTextAlertInput ({"show": true, "message": error.response.data.message });
              // read blob as json
              error.response.data.text().then( (resp) => {
                  const { message } = JSON.parse (resp);
                  setTextAlertInput ({"show": true, "message": message });
              });
          } else {
              axiosError(error, null, setAlertDialogInput);
          }
          setIsLoading(false);
        }
      );
    }

    const getData = () => {
        return (
        <>
        {datasetType && datasetType === "GLYCOPROTEIN" &&
          <Table 
              columns={proteinColumns} 
              data={dataset.glycoproteinData} 
              detailPanel={false}
              enableRowActions={false}
              initialSortColumn="1"
              rowId="1"
              columnsettingsws="api/setting/getcolumnsettings?tablename=DATASETGLYCOPROTEINMETADATA"
              saveColumnVisibilityChanges={saveColumnVisibilityChanges}
          />
        }
        {datasetType && datasetType === "GLYCAN" &&
        <Table 
            columns={columns} 
            data={dataset.data} 
            detailPanel={false}
            enableRowActions={false}
            initialSortColumn="1"
            rowId="1"
            columnsettingsws="api/setting/getcolumnsettings?tablename=DATASETMETADATA"
            saveColumnVisibilityChanges={saveColumnVisibilityChanges}
        />}
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
      return "Version " + version.version + (version.versionDate ? " (" + version.versionDate + ")" :  "") + (version.head ? "-latest" : "");
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
          if (data.data.data.glycoproteinData && data.data.data.glycoproteinData.length > 0) 
            setDatasetType ("GLYCOPROTEIN");
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

    const getVersionLog = () => {
      return (
        <BootstrapTable hover style={{ border: "none" }}>
                <tbody style={{ border: "none" }}>
                <tr style={{ border: "none" }} key={0}>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Comment</th>
                  </tr>
                {listVersions.map((version, index) => {
                  return (<tr style={{ border: "none" }} key={index}>
                    <td>{version.version}{version.head ? "-latest" : ""}</td>
                    <td>{version.versionDate ?? dataset.dateCreated}</td>
                    <td>{version.comment ?? ""}</td>
                  </tr>)
                })}
                </tbody>
        </BootstrapTable>
      )
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
        <VersionAlert data={versionData} pageLoading={isLoading}/>
        {showVersionLog && (
          <Modal
              aria-labelledby="contained-modal-title-vcenter"
              centered
              show={showVersionLog}
              onHide={() => setShowVersionLog(false)}
          >
              <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                  Version Log:
              </Modal.Title>
              </Modal.Header>
              <Modal.Body>{getVersionLog()}</Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" className="mt-2 gg-ml-20"
                      onClick={(()=> setShowVersionLog(false))}>Close</Button>
              </Modal.Footer>
          </Modal>) 
        }
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
                      {/**  <a href={dataset.license.url} target="_blank" rel="noopener noreferrer">
                        <Image src={licenseLogo} className="licenseIcons" />
                      </a> */}
                    </div>
                  </Card.Body>
                </Card>

            </Col>
            </Row>
            <Card style={{marginBottom: "30px"}}>
              <Loading show={isLoading} />
              <TextAlert alertInput={textAlertInput}/>
              <Card.Body>
                <Title title="Data" />
                
                <div className="pt-2">
                  <Row>
                  <Col xs={6} lg={6}>
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
                  <Col style={{marginTop: '35px', marginLeft: '15px'}}>
                        <button className="gg-link-button" onClick={()=>setShowVersionLog(true)}>Version Log</button>
                  </Col>
                  <Col>
                  <Tooltip title="Download table data">
                  <Button variant="contained" className="gg-btn-blue-rightalign" style={{marginTop: '15px', marginRight: '15px'}}
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
                <Title title="(Data from) Publications" />
                {dataset.publications && dataset.publications.length > 0 ? (
                  <PubOnDataset publications={dataset.publications} fromPublicDatasetPage={true} />
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
                <Title title="Data Integrated In" />
                {dataset.integratedIn && dataset.integratedIn.length > 0 ? (
                  <li>
                  {dataset.integratedIn.forEach ((datasource) => {
                    <ul>
                      {datasource.resource.name}-({datasource.versionInResource})
                    </ul>
                  })}
                  </li>
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