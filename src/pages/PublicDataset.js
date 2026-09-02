import { useNavigate, useParams } from "react-router-dom";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import { getAuthorizationHeader, getBlob, getJson, postJson } from "../utils/api";
import { useEffect, useMemo, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { axiosError, loadDefaultImage } from "../utils/axiosError";
import { GrantsOnDataset } from "../components/GrantsOnDataset";
import { PubOnDataset } from "../components/PubOnDataset";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { Table as BootstrapTable } from "react-bootstrap";
import { FormLabel, Title } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { DatabasesOnDataset } from "../components/DatabasesOnDataset";
import "./PublicDataset.css";
import Table from "../components/Table";
import { Checkbox, FormControlLabel, FormGroup, Popover, Tooltip } from "@mui/material";
import TextAlert from "../components/TextAlert";
import VersionAlert from "../components/VersionAlert";
import { PublicationTable } from "../components/PublicationTable";
import glygenLogo from "../images/GlyGen logo.png";
import metadata from '../data/metadata.json';
import { MetadataValueRenderer } from "../components/MetadataValueRenderer";
import { MRT_ShowHideColumnsMenu } from "material-react-table";

const PublicDataset = (props) => {
    let { datasetId } = useParams();

    const navigate = useNavigate();

    const [publicationCache, setPublicationCache] = useState({});

    const [dataset, setDataset] = useState();
    const [descOpen, setDescOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [pubOpen, setPubOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    //const [errorMessage, setErrorMessage] = useState("");

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
    const [retractionData, setRetractionData] = useState([]);
    const [selectedVersionId, setSelectedVersionId] = useState(null);
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
            if (data.data.data.removed) {
              // do not display the data
              return;
            }
            setDataset (data.data.data);
            if (data.data.data.retracted) {
              var details = "";
              if (data.data.data.retraction) {
                details += "When: " + new Date(data.data.data.retraction.retractionDate).toLocaleString() 
                        + "\nReason: " + data.data.data.retraction.reason;
              }
              setRetractionData ([{"retracted": true, "title" : "This dataset has been retracted!", 
                                  "description" : "Details (if any): \n" + details}]);
            } else {
              setRetractionData([]);
            }
            if (data.data.data.noProteins && data.data.data.noProteins > 0) 
              setDatasetType ("GLYCOPROTEIN");
            setIsLoading(false);
            const versionList = data.data.data.versions;
            versionList.sort((a, b) => a.version > b.version ? -1 : a.version < b.version ? 1 : 0);
            setListVersions(versionList);
            if (!datasetId.includes("-")) {
              setSelectedVersion("latest");
              setSelectedVersionId(null);
              setVersionData([]);
            } else {
              const v = datasetId.substring(datasetId.indexOf("-")+1);
              setVersionData ([{"title": "You are viewing an earlier version (" + v + ") of the dataset.",
                "description" : "Latest version can be found here: ",
                "url": datasetId.substring(0, datasetId.indexOf("-")),
                "url_name" : datasetId.substring(0, datasetId.indexOf("-"))
              }]);
              setSelectedVersion (v);
              const ver = versionList.find ((ver) => ver.version === v);
              setSelectedVersionId (ver.versionId);
            }
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
                //setErrorMessage(error.response.data.message);
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
        return user.firstName ? user.firstName + (user.lastName ? " " + user.lastName : "") : user.userName;
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

    const getPublication = doi => {
        return doi.length > 10 && !pubOpen ? `${doi.substring(0, 10)}...` : pubOpen ? `${doi}` : doi;
    };

    const getCellValue = (row, columnName) => row?.metadata?.[columnName] ?? null;

    const getFieldDefinition = (sampleType,fieldId) => {
      const sampleFields = metadata?.[sampleType]?.fields || [];

      let field = sampleFields.find(
        f => f.id === fieldId
      );

      if (field) {
        return field;
      }

      return (
        metadata.general?.find(f => f.id === fieldId) || null
      );
    };

    const proteinColumns = useMemo (
      () => [
        {
          accessorKey: 'uniProtId',
          header: 'UniProtKB Accession',
          id: 'uniProtId',
          enableHiding: false, 
          size: 50,
          Cell: ({renderedCellValue, row}) => <a href={"https://www.uniprot.org/uniprotkb/" + renderedCellValue} target="_blank" rel="noopener noreferrer">
                        {renderedCellValue}</a>
        },
        {
          accessorKey: 'glytoucanId',
          header: 'GlyTouCan ID',
          id: 'glytoucanId',
          enableHiding: false, 
          size: 50,
          Cell: ({renderedCellValue, row}) => <a href={"https://glytoucan.org/Structures/Glycans/" + renderedCellValue} target="_blank" rel="noopener noreferrer">
                        {renderedCellValue}</a>
          
        },
        {
          accessorFn: (row) => row.cartoon,
          header: 'Image',
          id: 'cartoon',
          enableColumnFilter: false,
          enableSorting: false,
          Cell: ({ cell }) => <img 
                                src={"data:image/png;base64, " + cell.getValue()} 
                                alt="cartoon" 
                                onError={e=> {
                                  loadDefaultImage(e.target, true)
                                }}/>
        },
        {
          accessorFn: (row) => row.aminoAcid + row.site,
          header: 'Residue',
          id: 'residue',
          size: 50,
        },
        {
          accessorFn: (row) => {
            var subType = row.glycosylationSubType && row.glycosylationSubType !== "" ? ", " + row.glycosylationSubType : "";
            return row.glycosylationType + subType;
          },
          header: 'Glycosylation Type',
          id: 'glycosylationType',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'publication'),
          id: "publication",
          header: 'Publication',
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(), "publication")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
            )
        },
        {
          accessorKey: 'sampleType',
          header: 'Sample Type',
          id: 'sampleType',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'species'),
          header: 'Species',
          id: "species",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"species")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'strain'),
          header: 'Strain',
          id: "strain",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"strain")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'expressionSystem'),
          header: 'Expression System',
          id: "expressinSystem",
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"expressionSystem")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'disease'),
          header: 'Disease',
          id: "disease",
          enableSorting: false,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"disease")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'tissue'),
          header: 'Tissue',
          id: "tissue",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"tissue")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'cellline'),
          header: 'Cell line',
          id: "cellline",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"cellline")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'variant'),
          header: 'Variant',
          id: "variant",
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"disease")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'cellularComponent'),
          header: 'Cellular Component',
          id: "cellularComponent",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"cellularComponent")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'developmentalStage'),
          header: 'Developmental Stage',
          id: "developmentalStage",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"developmentalStage")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'geneticBackgroundAlteration'),
          header: 'Genetic Background Alteration',
          id: "geneticBackgroundAlteration",
          enableSorting: false,
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"geneticBackgroundAlteration")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'analyzedProteinMutation'),
          header: 'Protein modification',
          id: "analyzedProteinMutation",
          size: 100,
          enableSorting: false,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"analyzedProteinMutation")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'perturbation'),
          header: 'Perturbation',
          id: "perturbation",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"perturbation")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'experimentalTechnique'),
          header: 'Experimental technique',
          id: "experimentalTechnique",
          enableSorting: false,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"experimentalTechnique")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'contributor'),
          header: 'Contributor',
          id: "contributor",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"contributor")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'comment'),
          header: 'Comment',
          id: "comment",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"comment")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          id: 'other',
          header: 'Other',
          enableHiding: false,       // this column itself can't be hidden
          enableColumnActions: false,
          enableSorting: false,
          enableColumnFilter: false,
          size: 150,
          muiTableBodyCellProps: {
            sx: { padding: 0 },
          },
          Cell: ({ table }) => {
            const [anchorEl, setAnchorEl] = useState(null);

            const hideableColumns = table.getAllLeafColumns().filter(col => col.getCanHide());
            const hiddenCount = hideableColumns.filter(col => !col.getIsVisible()).length;

            if (hiddenCount === 0) return null;

            return (
              <>
                <Button variant="contained" size="small" className="gg-blue" onClick={(e) => setAnchorEl(e.currentTarget)}>
                  {hiddenCount} column{hiddenCount > 1 ? 's' : ''} not shown
                </Button>
                <MRT_ShowHideColumnsMenu
                  anchorEl={anchorEl}
                  setAnchorEl={setAnchorEl}
                  table={table}
                />
              </>
            );
          },
        }
      ],
      [],
    );

    const columns = useMemo (
      () => [
        {
          accessorKey: 'glytoucanId',
          header: 'GlyTouCan ID',
          id: 'glytoucanId',
          enableHiding: false, 
          size: 50,
          Cell: ({renderedCellValue, row}) => <a href={"https://glytoucan.org/Structures/Glycans/" + renderedCellValue} target="_blank" rel="noopener noreferrer">
                        {renderedCellValue}</a>
        },
        {
          accessorFn: (row) => row.cartoon,
          header: 'Image',
          id: 'cartoon',
          enableColumnFilter: false,
          enableSorting: false,
          Cell: ({ cell, row }) => 
            <img 
                src={"data:image/png;base64, " + cell.getValue()} 
                alt="cartoon" 
                onError={e=> {
                    loadDefaultImage(e.target, true)
                }}/>,
        },
        {
          accessorFn: (row) => getCellValue (row, 'publication'),
          id: "publication",
          header: 'Publication',
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"publication")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorKey: 'sampleType',
          header: 'Sample Type',
          id: 'sampleType',
          size: 50,
        },
        {
          accessorFn: (row) => getCellValue (row, 'species'),
          header: 'Species',
          id: "species",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"species")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'strain'),
          header: 'Strain',
          id: "strain",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"strain")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'disease'),
          header: 'Disease',
          id: "disease",
          enableSorting: false,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"disease")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'tissue'),
          header: 'Tissue',
          id: "tissue",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"tissue")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'cellline'),
          header: 'Cell line',
          id: "cellline",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"cellline")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'variant'),
          header: 'Variant',
          id: "variant",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"variant")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
        },
        {
          accessorFn: (row) => getCellValue (row, 'cellularComponent'),
          header: 'Cellular Component',
          id: "cellularComponent",
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"cellularComponent")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'developmentalStage'),
          header: 'Developmental Stage',
          id: "developmentalStage",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"developmentalStage")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'geneticBackgroundAlteration'),
          header: 'Genetic Background Alteration',
          id: "geneticBackgroundAlteration",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"geneticBackgroundAlteration")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
        {
          accessorFn: (row) => getCellValue (row, 'perturbation'),
          header: 'Perturbation',
          id: "perturbation",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"perturbation")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          )
        },
         {
          accessorFn: (row) => getCellValue (row, 'experimentalTechnique'),
          header: 'Experimental technique',
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"experimentalTechnique")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
          id: "experimentalTechnique",
          enableSorting: false,
          size: 100,
        },
        {
          accessorFn: (row) => getCellValue (row, 'contributor'),
          header: 'Contributor',
          id: "contributor",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"contributor")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
        },
        {
          accessorFn: (row) => getCellValue (row, 'comment'),
          header: 'Comment',
          id: "comment",
          size: 100,
          Cell: ({ row, cell }) => (
            <MetadataValueRenderer
              field={getFieldDefinition(row.original.sampleType.toLowerCase(),"comment")}
              value={cell.getValue()}
              publicationCache={publicationCache}
              setPublicationCache={setPublicationCache}
              setShowLoading={setIsLoading}
              setTextAlertInput={setTextAlertInput}
              setAlertDialogInput={setAlertDialogInput}
              axiosError={axiosError}
            />
          ),
        },
        {
          id: 'other',
          header: 'Other',
          enableHiding: false,       // this column itself can't be hidden
          enableColumnActions: false,
          enableSorting: false,
          enableColumnFilter: false,
          size: 150,
          muiTableBodyCellProps: {
            sx: { padding: 0 },
          },
          Cell: ({ table }) => {
            const [anchorEl, setAnchorEl] = useState(null);

            const hideableColumns = table.getAllLeafColumns().filter(col => col.getCanHide());
            const hiddenCount = hideableColumns.filter(col => !col.getIsVisible()).length;

            if (hiddenCount === 0) return null;

            return (
              <>
                <Button variant="contained" size="small" className="gg-blue" 
                    onClick={(e) => setAnchorEl(e.currentTarget)}>
                  {hiddenCount} column{hiddenCount > 1 ? 's' : ''} not shown
                </Button>
                <MRT_ShowHideColumnsMenu
                  anchorEl={anchorEl}
                  setAnchorEl={setAnchorEl}
                  table={table}
                />
              </>
            );
          },
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
      setIsLoading(true);
      setTextAlertInput({"show": false, id: ""});
      let url = "api/public/downloadtablefordataset/"+datasetId+"?version="+selectedVersion+"&filename=GlygenDataset-" + datasetId;
      getBlob (url).then ( (data) => {
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
        {datasetType && datasetType === "GLYCOPROTEIN" && (datasetId || selectedVersionId) &&
          <Table 
              columns={proteinColumns} 
              ws={ selectedVersionId 
                      ? `api/public/getdatasetdata?type=GLYCOPROTEIN&versionid=${selectedVersionId}`
                      : `api/public/getdatasetdata?type=GLYCOPROTEIN&datasetid=${datasetId}`}
              detailPanel={false}
              enableRowActions={false}
              initialSortColumn={[
                { id: 'uniProtId', desc: false },
                { id: 'glytoucanId', desc: false },
                { id: 'residue', desc: false },
              ]}
              rowId="uniProtId"
              columnsettingsws="api/setting/getcolumnsettings?tablename=DATASETGLYCOPROTEINMETADATA"
              saveColumnVisibilityChanges={saveColumnVisibilityChanges}
              columnVisibility={{
                uniProtId: true,
                glytoucanId: true,
                cartoon: true,
                residue: true,
                glycosylationType: false,
                "publication": true,        // Publication
                sampleType: false, // hidden by default
                "species": true,         // Species
                "strain": false,        // Strain — hidden by default
                "expressionSystem": true,       // Expression System
                "disease": true,         // Disease
                "tissue": true,         // Tissue
                "cellline": true,         // Cellline 
                "variant": false,
                "cellularComponent": false,       // Cellular Component - hidden by default
                "developmentalStage": false,       // Developmental Stage - hidden by default
                "geneticBackgroundAlteration": false,       // genetic background - hidden by default
                "analyzedProteinMutation": false,       // anlyzed protein mutation - hidden by default
                "perturbation": false,       // perturbation - hidden by default
                "experimentalTechnique": false,       // experimental technique - hidden by default
                "contributor": false,       // contributor - hidden by default
                "comment": false,       // comment - hidden by default
              }}
          />
        }
        {datasetType && datasetType === "GLYCAN" &&
        <Table 
            columns={columns} 
            ws={ selectedVersionId 
                      ? `api/public/getdatasetdata?type=GLYCAN&versionid=${selectedVersionId}`
                      : `api/public/getdatasetdata?type=GLYCAN&datasetid=${datasetId}`}
            detailPanel={false}
            enableRowActions={false}
            rowId="glytoucanId"
            initialSortColumn="glytoucanId"
            columnsettingsws="api/setting/getcolumnsettings?tablename=DATASETMETADATA"
            saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            columnVisibility={{
                glytoucanId: true,
                cartoon: true,
                "publication": true,        // Publication
                sampleType: false, // hidden by default
                "species": true,         // Species
                "strain": false,        // Strain — hidden by default
                "disease": true,         // Disease
                "tissue": true,         // Tissue
                "cellline": true,         // Cellline 
                "variant": false,
                "cellularComponent": false,       // Cellular Component - hidden by default
                "developmentalStage": false,       // Developmental Stage - hidden by default
                "geneticBackgroundAlteration": false,       // genetic background - hidden by default
                "perturbation": false,       // perturbation - hidden by default
                "experimentalTechnique": false,       // experimental technique - hidden by default
                "contributor": false,       // contributor - hidden by default
                "comment": false,  
              }}
        />}
        </>)
    }

    const getSubmitterDetails = (submitterinfo) => {
        return (
          <>
          <div>
            <strong>Username: </strong>
            {/*submitterinfo.userName*/}
            {submitterinfo.userName}
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
          {submitterinfo.researchCenter && (
            <div>
              <strong>Research Center: </strong>
              {submitterinfo.researchCenter}
            </div>
          )}
          {submitterinfo.affiliation && (
            <div>
              <strong>Institution: </strong>
              {submitterinfo.affiliation}
            </div>
          )}
          {submitterinfo.role === "SOFTWARE" && (
            <>
              {submitterinfo.software.url ? 
              <div>
              <strong>Software Name: </strong>
              <a href={submitterinfo.software.url} target={"_blank"} rel="noopener noreferrer">
              {submitterinfo.software.name}</a>
              </div>
              :
              <div>
              <strong>Software Name: </strong>
              {submitterinfo.software.name}
              </div>}
              {submitterinfo.software.publication && 
              <div>
              <strong>Software Publication: </strong>
              {submitterinfo.software.publication.includes ("/") ?    // DOI
                  <>
                  <a
                    href={`https://doi.org/${submitterinfo.software.publication}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getPublication(submitterinfo.software.publication)}
                  </a>
                  <button className={"more-less"} onClick={() => setPubOpen(!pubOpen)}>
                      {submitterinfo.software.publication.length > 10 && !pubOpen ? `more` : pubOpen ? `less` : ``}
                    </button>
                    </>
               :   // PMID
                <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${submitterinfo.software.publication}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {submitterinfo.software.publication}
                  </a>
              }                  
              </div>}
              </>
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
              setTextAlertInput({"show": true, "message":error.response.data.message});
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
        <Loading show={isLoading}></Loading>
        <VersionAlert data={retractionData} pageLoading={isLoading}></VersionAlert>
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
                    {dataset.user && dataset.user.userName ? (
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
                          let ver = getVersion(e.target.value);
                          setSelectedVersionId(ver.versionId);
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
                {(datasetId || selectedVersionId) && <PublicationTable
                    ws={ selectedVersionId 
                      ? `api/public/getdatasetpublications?versionid=${selectedVersionId}`
                      : `api/public/getdatasetpublications?datasetid=${datasetId}`}
                    setAlertDialogInput={setAlertDialogInput}
                />}
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
                  <div style={{ display: "flex", gap: "30px", alignItems: "center" }}>
                    {dataset.integratedIn.map((datasource, index) => {
                      const isGlyGen = datasource.resource.name.toLowerCase() === "glygen";
                      const link = datasource.resource.url;
                      const identifier = datasource.resource.identifier;

                      if (isGlyGen) {
                        return (
                          <a key={index} href={link} 
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textAlign: "center", textDecoration: "none", color: "inherit" }} >
                            <img src={glygenLogo} alt="GlyGen" style={{ width: "120px", display: "block", margin: "0 auto" }} />
                            <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                              {identifier}
                            </div>
                          </a>
                        );
                      }

                      // Default rendering for other resources
                      return (
                        <a key={index} href={link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: "none", color: "inherit", fontWeight: "bold" }} >
                          {datasource.resource.name} ({identifier})
                        </a>
                      );
                    })}
                  </div>
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