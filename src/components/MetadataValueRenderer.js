import { Dialog, DialogContent, DialogTitle, IconButton, Popover, Tooltip, Typography } from "@mui/material";
import { getContributorString, getJson } from "../utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ContributorTable from "./ContributorTable";
import { useState } from "react";
import ArticleIcon from '@mui/icons-material/Article';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ComplexFieldTable from "./ComplexFieldTable";

export function MetadataValueRenderer({
    field,
    value,
    publicationCache,
    setPublicationCache,
    setShowLoading,
    setTextAlertInput,
    setAlertDialogInput,
    axiosError
}) {

    const [publicationOpen, setPublicationOpen] = useState(false);
    const [complexOpen, setComplexOpen] = useState(false);
    const [contributorOpen, setContributorOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPublication, setSelectedPublication] = useState(null);
    const [selectedMetadataField, setSelectedMetadataField] = useState(null);
    const [selectedMetadataDetail, setSelectedMetadataDetail] = useState(null);

    const getPublication = (pubId, event) => {
        setAnchorEl(event.currentTarget)
        if (publicationCache[pubId]) {
            setSelectedPublication (publicationCache[pubId]);
            setPublicationOpen(true);
        }
        else {
            setShowLoading(true);
            // get the publication details
            getJson ("api/util/getpublication?identifier=" + pubId).then (({ data }) => {
                if (data.data) {
                    setSelectedPublication(data.data);
                    setPublicationCache(prev => ({
                        ...prev,
                        pubId: data.data
                    }));
                    setPublicationOpen(true);
                    setShowLoading(false);
                }
            }).catch(function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInput ({"show": true, "message": error.response.data.message });
                    setShowLoading(false);
                    return;
                } else {
                    axiosError(error, null, setAlertDialogInput);
                }
            });
        }
    }

    if (value == null) {
        return null;
    }

    if (field?.type === "publication") {
        return <>
            <span>{value}</span>
            <IconButton
                aria-label="show publication details"
                onClick={(e) =>  {
                    getPublication(value, e);
            }}
            >
        <ArticleIcon />
        </IconButton>

        {selectedPublication && (
        <Popover
            open={publicationOpen}
            anchorEl={anchorEl}
            onClose={() => {
                setAnchorEl(null);
                setPublicationOpen(false);
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            >
            <Typography sx={{ p: 2 }}>
                <div>
                <h6 style={{ marginBottom: "3px" }}>
                <strong>{selectedPublication.title}</strong>
                </h6>
            </div>

            <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                <div>{selectedPublication.authors}</div>
                <div>
                {selectedPublication.journal} <span>&nbsp;</span>({selectedPublication.year})
                </div>
                <div>
                <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />

                {selectedPublication.pubmedId && 
                <>
                <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${selectedPublication.pubmedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {selectedPublication.pubmedId}
                </a>
                </>
                }
                {selectedPublication.doiId && 
                <>
                <span style={{ paddingLeft: "15px" }}>DOI:&nbsp;</span>
                <a
                    href={`https://doi.org/${selectedPublication.doiId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {selectedPublication.doiId}
                </a>
                </>
                }
                </div>
            </div>
            </Typography>
        </Popover>)}
        </>
    }
    else if (field?.type === "contributor") {
        return (
            <>
            {<span>{getContributorString(value)}</span>}
            <Tooltip title="View contributor information">
                <IconButton color="primary" onClick={(event) => {
                    //setEditContributor(false); 
                    setContributorOpen(true)}}>
                <VisibilityOutlinedIcon />
                </IconButton>
            </Tooltip>
            <ContributorTable 
                    open={contributorOpen}
                    onClose={() => setContributorOpen(false)}
                    contributor={value}
                />
            </>
        );
    }
    else if (field?.type === "complex") {
        return (
            <>
            {<span>{getComplexFieldSummary (field, value)}</span>}
            <Tooltip title="View details">
                <IconButton color="primary" onClick={(event) => {
                    setSelectedMetadataField(field);
                    setSelectedMetadataDetail(value);
                    setComplexOpen(true);
                    }}>
                <VisibilityOutlinedIcon />
                </IconButton>
            </Tooltip>
            <Dialog
                open={complexOpen}
                onClose={() => setComplexOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    {selectedMetadataField?.label}
                </DialogTitle>

                <DialogContent>
                    <ComplexFieldTable
                        field={selectedMetadataField}
                        value={selectedMetadataDetail}
                        readOnly={true}
                    />
                </DialogContent>
            </Dialog>
            </>
        );
    }

    if (Array.isArray(value)) {
        if (field && field.type === "autocomplete") {
            return value.map((item, index) => {
                if (item.uri) {
                    return (
                        <>
                        {item.name}{" "}
                        (
                        <a href={item.uri} target="_blank" rel="noopener noreferrer">{item.id}</a>
                        )</>
                    )
                }
                return item.name + " (" + item.id + ")";
            });
        } else return value.join(", ");
    }

    if (typeof value === "object" && value?.name) {
        if (value.uri) {
            return (
                <>
                {value.name}{" "}
                (
                <a href={value.uri} target="_blank" rel="noopener noreferrer">{value.id}</a>
                )</>
            )
        }
        return value.name + " (" + value.id + ")";
    }

    return String(value ?? "");
}

function getComplexFieldSummary (field, value) {
    var displayValue = "";
    if (field.id === "perturbation") {
        if (value?.length > 0) {
            const perturbation = value[0];

            const drugCount = perturbation.drug?.length || 0;
            const chemicalCount = perturbation.chemical?.length || 0;
            const radiationCount = perturbation.radiation?.length || 0;

            displayValue =
                `${drugCount} drug(s), ` +
                `${chemicalCount} chemical(s), ` +
                `${radiationCount} radiation(s)`;
        }
    } else if (field.id === "geneticBackgroundAlteration") {
        displayValue = value
            .map(v =>
                `${v.gene}${
                    v.mutantPosition ? ` (${v.mutantPosition})` : ""
                }`
            )
            .join(", ");
    } else if (field.id === "analyzedProteinMutation") {
        displayValue = value
            .map(v =>
                `${v.molecularPhenotype}${
                    v.mutantPosition ? ` (${v.mutantPosition})` : ""
                }`
            )
            .join(", ");
    } else if (field.id === "expressionSystem") {
        displayValue = value.species.name;
    } else {
        return JSON.stringify (value);
    }

    return displayValue;
}



