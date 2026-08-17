import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getBlob, getCartoonSetting, getJson, loadCartoons, postJson } from "../utils/api";
import { axiosError, loadDefaultImage } from "../utils/axiosError";
import { Box, Container, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Popover, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row, Modal} from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ScrollToTop } from "../components/ScrollToTop";
import FeedbackWidget from "../components/FeedbackWidget";
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SampleTypeSelector from "../components/SampleTypeSelector";
import DynamicMetadataForm from "../components/DynamicMetadataForm";
import metadata from '../data/metadata.json';
import { VpnLock } from "@mui/icons-material";

const Collection = (props) => {
    const [searchParams] = useSearchParams();
    let collectionId = searchParams.get("collectionId");
    let isCopy = searchParams.get("isCopy");
    if (!isCopy) isCopy=false;
    const navigate = useNavigate();
    const location = useLocation();

    const [publicationCache, setPublicationCache] = useState({});

    const [collectionType, setCollectionType] = useState((location.state && location.state.collectionType) ?? "GLYCAN");

    var base = process.env.REACT_APP_BASENAME;
    const username = window.localStorage.getItem(base ? base + "_loggedinuser" : "loggedinuser");

    const [isDirty, setIsDirty] = useState(false);
    const [error, setError] = useState(false);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInputMetadata, setTextAlertInputMetadata] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const collection = {
        name: "",
        description: "",
        glycans: [],
        glycoproteins: [],
        metadata: [],
        type: collectionType,
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, collection);

    const [showGlycanTable, setShowGlycanTable] = useState(false);
    const [showGlycoproteinTable, setShowGlycoproteinTable] = useState(false);
    const [showTagSelection, setShowTagSelection] = useState(false);
    const [showGlycoproteinTagSelection, setShowGlycoproteinTagSelection] = useState(false);
    const [selectedGlycans, setSelectedGlycans] = useState([]);
    const [selectedGlycoproteins, setSelectedGlycoproteins] = useState([]);
    //const [enableAddMetadata, setEnableAddMetadata] = useState(false);
    const [showPublicationDetails, setShowPublicationDetails] = useState(false);
    const [selectedPublication, setSelectedPublication] = useState(null);

    const [isVisible, setIsVisible] = useState(false);

    const [downloadReport, setDownloadReport] = useState(null);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
    const [fileFormat, setFileFormat] = useState("GWS");
    const [glycanStatus, setGlycanStatus] = useState(null);
    const [tag, setTag] = useState(null);
    const [glycanStatusList, setGlycanStatusList] = useState([]);
    const [glycanTags, setGlycanTags] = useState([]);

    const [contributor, setContributor] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);

    const tableMakerSoftware = {
        id: 1,
        name: "GlyTableMaker",
        url: "https://glygen.ccrc.uga.edu/tablemaker",
        role: "createdWith",
    };

    const [anchorEl, setAnchorEl] = useState(null);

    const glycanRef = useRef(null);
    const metadataRef = useRef(null);
    const metadataDialogRef = useRef(null);
    const handleClick = (ref) => {
        ref.current?.scrollIntoView({behavior: 'smooth'});
    };

    const scrollToDialogTop = () => {
        metadataDialogRef.current?.scrollTo({
            top: 0,
            behavior: "smooth"
          });
    }

    // Show button when page is scrolled upto given distance
    const toggleSaveVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // new metadata 
    const [sampleType, setSampleType] = useState("");
    const [enableGlyTableMakerMetadata, setEnableGlyTableMakerMetadata] = useState(false);
    const [activeStep2, setActiveStep2] = useState(0);
    const [metadataValues, setMetadataValues] = React.useState({});
    const steps2 = ["Sample Type", "Sample Specific Metadata", "Sample Specific Metadata - Modifications", "General Information"];
    const [metadataDialogTitle, setMetadataDialogTitle] = useState("GlyTableMaker Metadata");

    useEffect(() => {
        props.authCheckAgent();
        //getCategories();
        getStatusList();
        getGlycanTags();
        getProfile();
        window.addEventListener("scroll", toggleSaveVisibility);
    }, []);

    useEffect(() => {
        getCartoonSetting();
        if (collectionId && !isDirty) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId]);

    // Block navigation inside the app when there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isDirty) {
                const message = "You have unsaved changes. Are you sure you want to leave?";
                event.returnValue = message; // Standard for most browsers
                return message; // For some browsers
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup the event listener when component unmounts
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

   //const blocker = useBlocker(isDirty);
   // usePrompt("Are you sure you want to leave? You have changes that were not submitted yet!", isDirty) 

    // Block navigation with unsaved changes
   /* let blocker = useBlocker((shouldBlock) => 
        isDirty && shouldBlock.currentLocation.pathname != shouldBlock.nextLocation.pathname, [isDirty]
    );

    useEffect (() => {
        if (blocker.state ===  "blocked" && !isDirty)
            blocker.reset();

    }, [blocker, isDirty]);

    function ConfirmNavigation(blocker) {
        if (blocker.state === "blocked") {
          return (
            <>
              <p style={{ color: "red" }}>
                Blocked the last navigation to {blocker.location.pathname}
              </p>
              <button onClick={() => blocker.proceed?.()}>Let me through</button>
              <button onClick={() => blocker.reset?.()}>Keep me here</button>
            </>
          );
        }
      
        if (blocker.state === "proceeding") {
          return (
            <p style={{ color: "orange" }}>Proceeding through blocked navigation</p>
          );
        }
      
        return <p style={{ color: "green" }}>Blocker is currently unblocked</p>;
      }*/


   /*useBlocker ((tx) => {
    if (isDirty) {
        const confirmLeave = window.confirm ("Are you sure you want to leave? You have changes that were not submitted yet!");
        if (!confirmLeave) {
            console.log ("blocked to stay on the page");
            return false;
        }    
    } 
   });*/

    function getProfile() {
        getJson ("api/account/user/" + username, getAuthorizationHeader()).then (({ data }) => {
            if (data.data) {
               const user = {
                id: 1,
                name: data.data.firstName + " " + (data.data.lastName && data.data.lastName !== null ? data.data.lastName : ""),
                email: data.data.email,
                organization: data.data.affiliation ?? "",
                role: "createdBy",
               } 
               let userArray = [];
               userArray.push (user);
               let softwareArray = [];
               softwareArray.push(tableMakerSoftware);

               let contrib = {"user": userArray, "software": softwareArray}
               setMetadataValues(prev => ({
                    ...prev,
                    contributor: contrib
                    }));
                var c = getContributorString(contrib);
                setContributor(c);
               // set default contributor string
               // fill in the defaults
              /* let c = user.role + ":" + user.name + " (" + user.email + (user.organization && user.organization.length !== 0? ", " + user.organization : "") + ")";
               c += "|" + tableMakerSoftware.role + ":" + tableMakerSoftware.name + " (" + tableMakerSoftware.url + ")";
               setContributor(c);*/
            }
            
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
          });
    }

    function getContributorString (contrib) {
        var c = "";
        if (contrib.user && contrib.user.length > 0) {
            c += contrib.user[0].name;
            if (contrib.user.length > 1) {
                c+= " and " + (contrib.user.length - 1);
                c+= " other(s) are involved";
            }
        } 
        if (contrib.software && contrib.software.length > 0) {
            if (c.length !== 0) c+= "; ";
            c += contrib.software[0].name;
            if (contrib.software.length > 1) {
                c+= " and " + (contrib.software.length - 1);
                c+= " tool(s)";
            }
        }
        return c;
    }

    function getStatusList() {
        getJson ("api/util/getregistrationstatuslist").then (({ data }) => {
            setGlycanStatusList(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    function getGlycanTags() {
        getJson ("api/data/getglycantags", getAuthorizationHeader()).then (({ data }) => {
            setGlycanTags(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    const fetchData = async () => {
        setShowLoading(true);
        getJson ("api/data/getcollection/" + collectionId, getAuthorizationHeader())
            .then ((json) => {
                setUserSelection (json.data.data);
                if (json.data.data.glycans) {
                    setSelectedGlycans (json.data.data.glycans);
                    setCollectionType ("GLYCAN");
                    loadCartoons(json.data.data.glycans).then((updated) => {
                        setUserSelection({"glycans": updated})
                        setSelectedGlycans(updated);
                    });
                }
                if (json.data.data.glycoproteins) {
                    setSelectedGlycoproteins (json.data.data.glycoproteins);
                    setCollectionType("GLYCOPROTEIN")
                }
                if (isCopy) {
                    setUserSelection ({"name" : "", "glycans": []});
                }
                setShowLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setShowLoading(false);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                setShowLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const getPublication = (pubId, event) => {
        setAnchorEl(event.currentTarget)
        if (publicationCache[pubId]) {
            setSelectedPublication (publicationCache[pubId]);
            setShowPublicationDetails(true);
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
                    setShowPublicationDetails(true);
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

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue && newValue.trim().length > 1) {
            setValidate(false);
            setError(false);
        }
        setUserSelection({ [name]: newValue });
        setIsDirty(true);
    };

    const handleTagChange = e => {
        let tag = e.target.options[e.target.selectedIndex].value;
        if (tag !== "") {
            setSelectedTag(tag);
            setValidate(false);
        }
    }

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        if (userSelection.name === "" || userSelection.name.trim().length < 1) {
            setValidate(true);
            setError(true);
            return;
        }

        /*const metadata = [];
        userSelection.metadata.map ((m) => {
            if (m.new || isCopy) {
                m.metadataId = null;
            }
            metadata.push(m);
        });*/

        const collection = { 
            collectionId: collectionId && !isCopy ? collectionId : null,
            name: userSelection.name,
            description: userSelection.description,
            glycans: userSelection.glycans,
            glycoproteins: userSelection.glycoproteins,
            type: collectionType,
            metadata: userSelection.metadata,
            sampleType: sampleType
        }
        
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        let apiURL = collectionId && !isCopy ? "api/data/updatecollection" : "api/data/addcollection";

        setIsDirty(false);
        postJson (apiURL, collection, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/collections");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setTextAlertInputMetadata ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
        e.preventDefault();
    }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'glytoucanID', 
            header: 'GlyTouCan ID',
            size: 50,
          },
          {
            accessorKey: "cartoon",
            header: 'Image',
            size: 150,
            columnDefType: 'display',
            Cell: ({ cell }) => <img 
                                    src={"data:image/png;base64," + cell.getValue()} 
                                    alt="cartoon" 
                                    onError={e=> {
                                        loadDefaultImage(e.target, true)
                                    }}/>,
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
          {
            accessorKey: 'mass', 
            header: 'Mass',
            size: 80,
            Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
          }
        ],
        [],
      );
    
      const columns2 = useMemo(
        () => [
          {
            accessorKey: 'uniprotId', 
            header: 'UniProtKB Accession',
            size: 100,
          },
          {
            accessorKey: 'name', 
            header: 'Name',
            size: 100,
          },
          {
            accessorKey: 'sites.length', 
            header: '# Sites',
            id : "siteNo",
            size: 50,
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

    

    const metadatacolumns = useMemo(
    () => [
        {
            accessorKey: 'name',
            header: 'Name',
            size: 200
        },
        {
            accessorKey: 'value',
            header: 'Value',
            size: 500,
            Cell: ({ renderedCellValue, row }) => {

                const { fieldType, value } = row.original;
                if (fieldType === "publication") {
                    return <>
                     <span>{renderedCellValue}</span>
                     <IconButton
                        aria-label="show publication details"
                        onClick={(e) =>  {
                            getPublication(renderedCellValue, e);
                        }}
                        >
                    <ArticleIcon />
                    </IconButton>
                    </>
                }
                else if (fieldType === "contributor") {
                    return getContributorString(value);
                }
                else if (fieldType === "complex") {
                    return (
                        <Button
                        size="sm"
                        onClick={() => {
                            /*setSelectedMetadataName(row.original.name);
                            setSelectedMetadataDetail(value);
                            setMetadataDetailOpen(true);*/
                        }}
                        >
                        View Details
                        </Button>
                    );
                }

                if (Array.isArray(value)) {
                    return value.join(", ");
                }

                if (typeof value === "object" && value?.label) {
                    return value.label;
                }

                return String(value ?? "");
            }
        }
    ],
    []
    );

    function buildFieldMap() {

        const map = {};

        Object.keys(metadata).forEach(section => {
            if (metadata[section]?.fields) {
                metadata[section].fields.forEach(field => {
                    map[field.id] = field;
                });
            }

            if (Array.isArray(metadata[section])) {
                metadata[section].forEach(field => {
                    map[field.id] = field;
                });
            }
        });

        return map;
    }

    const fieldMap = buildFieldMap();

    function metadataToTableRows(metadataValues) {
        return Object.entries(userSelection.metadata || {}).map(
            ([key, value], index) => ({
                metadataId: index,
                key,
                name: fieldMap[key]?.label ?? key,
                fieldType: fieldMap[key]?.type,
                value
            })
        );
        
        /*
        Object.entries(metadataValues).map(([key, value], index) => {
            let displayValue = value;
            if (Array.isArray(value)) {
                displayValue = value.map(v =>
                    typeof v === "object"
                        ? (v.name && v.id ? v.name + ": " + v.id 
                            : getComplexValueString(key, v))
                        : v
                ).join(", ");
            }
            else if (typeof value === "object" && value !== null) {
                if (value.name) {
                    displayValue = value.name;
                    if (value.id) displayValue += ": " + value.id; 
                } else {
                    displayValue = getComplexValueString(key, value);
                }
            }

            return {
                metadataId: index,
                name: fieldMap[key]?.label ?? key,
                value: value
            };
        });*/
    }

    const metadataRows = useMemo(() => {
        return metadataToTableRows(userSelection.metadata || {});
    }, [userSelection.metadata]);

    

    const saveColumnVisibilityChanges = (columnVisibility) => {
        if (!collectionType || collectionType === "GLYCAN")
            saveColumnVisibility (columnVisibility, "GLYCANINCOLLECTION");
        else
            saveColumnVisibility (columnVisibility, "GLYCOPROTEININCOLLECTION");
    }

    const saveColumnVisibility = (columnVisibility, tableName) => {
        var columnSettings = [];
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

    const saveMetadataColumnVisibilityChanges = (columnVisibility) => {
        saveColumnVisibility(columnVisibility, "METADATA");
    }

    const listGlycans = () => {
        return (
          <>
            <Row>
                <Col style={{float: "right"}}>
                    <Button variant="primary" className="gg-btn-blue mt-2 mb-4 gg-ml-20 float-right"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                </Col>
            </Row>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getglycans"
                columns={columns}
                columnFilters={[{"id":"glytoucanID","value":"G"}]}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="dateCreated"
                rowSelection={true}
                rowSelectionChange={handleGlycanSelectionChange}
                rowId="glycanId"
                columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCANINCOLLECTION"
                saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </>
        );
    };

    const listGlycoproteins = () => {
        return (
          <>
            <Row>
                <Col style={{float: "right"}}>
                <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20 mb-4 float-right"
                            onClick={handleGlycoproteinSelect}>Add Selected Glycoproteins</Button>
                </Col>
            </Row>
          
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getglycoproteins"
                columns={columns2}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="dateCreated"
                rowSelection={true}
                rowSelectionChange={handleGlycoproteinSelectionChange}
                rowId="id"
                columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCOPROTEININCOLLECTION"
                saveColumnVisibilityChanges={saveColumnVisibilityChanges}
            />
            </>
        );
    };


    function getFieldsForSection (section, fields) {
        var filteredFields = [];
        fields.map ((field, index) => {
            if (section === 1 && !field.secondSection) filteredFields.push(field);
            if (section === 2 && field.secondSection) filteredFields.push(field);
        }); 
        return filteredFields; 
    }

    function getStepContent2 (stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                <SampleTypeSelector
                    datasetType={collectionType} 
                    value={sampleType}
                    titleChange={setMetadataDialogTitle}
                    onChange={setSampleType}
                />
                )
            case 1:
                return (
                <DynamicMetadataForm
                    fields={getFieldsForSection(1, metadata[sampleType].fields)}
                    values={metadataValues}
                    onChange={setMetadataValues}
                />)
            case 2:
                return (
                <DynamicMetadataForm
                    fields={getFieldsForSection(2, metadata[sampleType].fields)}
                    values={metadataValues}
                    onChange={setMetadataValues}
                />)
            case 3:
                return (
                <DynamicMetadataForm
                    fields={metadata["general"]}
                    values={metadataValues}
                    contributorValue={contributor}
                    onContributorChange={setContributor}
                    onChange={setMetadataValues}
                />)

        }

    }

    function getGlyTableMakerNavigationButtons() {
        return (
          <div className="text-center">
            {<Button disabled={activeStep2 === 0} onClick={handleBack2} className="gg-btn-blue gg-ml-20 gg-mr-20">
              Back
            </Button>
            }
            {activeStep2 < steps2.length - 1 &&
            <Button variant="contained" className="gg-btn-blue gg-ml-20" onClick={handleNext2}>
               Next
            </Button>}
          </div>
        );
    }

    const handleBack2 = () => {
        if (sampleType === "synthetic" && activeStep2 === 3) {
            setActiveStep2(0);
        } else if (sampleType === "biological_sample" && activeStep2 === 3) {
            setActiveStep2(1);
        } else {
            setActiveStep2(prevActiveStep => prevActiveStep - 1);
        }
    };

    const handleNext2 = () => {
        if (sampleType === "synthetic" && activeStep2 === 0) {
            setActiveStep2(3);
        } else if (sampleType === "biological_sample" && activeStep2 === 1) {
            setActiveStep2(3);
        } else {
            setActiveStep2(prevActiveStep => prevActiveStep + 1);
        }
    }

    const addNewMetadataForm = () => {
        return (
            <>
                <TextAlert alertInput={textAlertInputMetadata}/>
                <Stepper className="steper-responsive5 text-center" activeStep={activeStep2} alternativeLabel>
                  {steps2.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <div className="mt-4 mb-4">
                {getStepContent2(activeStep2, validate)}
              </div>
            </>
        )
    }

    const fetchByTag = (url, isGlycan) => {
        let searchParams = "start=0";
        searchParams += "&filters=" + encodeURI(JSON.stringify([{"id": "tags", "value": selectedTag}]));

        setShowLoading(true);
        getJson (url + "?" + searchParams, getAuthorizationHeader()).then ( (json) => {
            if (isGlycan) {
                const previous = userSelection.glycans && userSelection.glycans.length ? [...userSelection.glycans] : [];
                json.data.data.objects.forEach ((glycan) => {
                    if (!glycan.glytoucanID || glycan.glytoucanID.length === 0) {
                        // error, not allowed to select this for the collection
                        setTextAlertInput ({"show": true, 
                            "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + glycan.glycanId + " is not added."
                        });
                        ScrollToTop();
                    } else {
                        const found = previous.find ((item) => item.glycanId === glycan.glycanId);
                        if (!found) {
                            previous.push (glycan);
                        }
                    }
                })
                setSelectedGlycans(previous);
                setUserSelection({"glycans": previous});
            } else { // glycoproteins
                const previous = userSelection.glycoproteins && userSelection.glycoproteins.length ? [...userSelection.glycoproteins] : [];
                json.data.data.objects.forEach ((glycoprotein) => {
                    const found = previous.find ((item) => item.id === glycoprotein.id);
                    if (!found) {
                        previous.push (glycoprotein);
                    }
                    
                })
                setSelectedGlycoproteins(previous);
                setUserSelection({"glycoproteins" : previous});
            }
            setIsDirty(true);
            setShowLoading(false);
            isGlycan ? setShowTagSelection (false) : setShowGlycoproteinTagSelection (false);
        }).catch (function(error) {
          if (error && error.response && error.response.data) {
              setTextAlertInput ({"show": true, "message": error.response.data.message });
              setShowLoading(false);
              isGlycan ? setShowTagSelection (false) : setShowGlycoproteinTagSelection (false);
              return;
          } else {
              isGlycan ? setShowTagSelection (false) : setShowGlycoproteinTagSelection (false);
              setShowLoading(false);
              axiosError(error, null, setAlertDialogInput);
              return;
          }
        });
    }

    const handleGlycanbyTagSelect = () => {
        if (!selectedTag) {
            setValidate(true);
            return;
        } else {
            setValidate(false);
        }
        fetchByTag ("api/data/getglycans", true);
    }

    const handleGlycoproteinbyTagSelect = () => {
        setValidate(false);
        if (!selectedTag) {
            setValidate(true);
            return;
        } 
        fetchByTag ("api/data/getglycoproteins", false);
    }

    const handleGlycanSelect = () => {
        console.log("selected glycans" + selectedGlycans);
        setTextAlertInput({"show": false, id: ""});
        const selected=[];
        selectedGlycans.forEach ((glycan) => {
            if (!glycan.glytoucanID || glycan.glytoucanID.length === 0) {
                // error, not allowed to select this for the collection
                setTextAlertInput ({"show": true, 
                    "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + glycan.glycanId + " is not added."
                });
                ScrollToTop();
            } else {
                selected.push (glycan);
            }
        });

        setUserSelection({"glycans": selected});
        setShowGlycanTable(false);
        setIsDirty(true);
    }

    const handleGlycoproteinSelect = () => {
        console.log("selected glycoproteins" + selectedGlycoproteins);
        setTextAlertInput({"show": false, id: ""});
        const selected=[];
        selectedGlycoproteins.forEach ((glycoprotein) => {
                selected.push (glycoprotein);
        });

        setUserSelection({"glycoproteins": selected});
        setShowGlycoproteinTable(false);
        setIsDirty(true);
    }


    const deleteFromTable = (id) => {
        var glycans = userSelection.glycans;
        const index = glycans.findIndex ((item) => item["glycanId"] === id);
        var updated = [
            ...glycans.slice(0, index),
            ...glycans.slice(index + 1)
        ];
        setUserSelection ({"glycans": updated});
        setSelectedGlycans(updated);
        setIsDirty(true);
    }

    const deleteFromGlycoproteinTable = (id) => {
        var proteins = userSelection.glycoproteins;
        const index = proteins.findIndex ((item) => item["id"] === id);
        var updated = [
            ...proteins.slice(0, index),
            ...proteins.slice(index + 1)
        ];
        setUserSelection ({"glycoproteins": updated});
        setSelectedGlycoproteins(updated);
        setIsDirty(true);
    }

    const handleGlycanSelectionChange = (selected) => {
        // append new selections
        
        const previous = userSelection.glycans && userSelection.glycans.length ? [...userSelection.glycans] : [];
        selected.forEach ((glycan) => {
            const found = previous.find ((item) => item.glycanId === glycan.glycanId);
            if (!found) {
                previous.push (glycan);
            }
        })
        setSelectedGlycans(previous);
        setIsDirty(true);
    }

    const handleGlycoproteinSelectionChange = (selected) => {
        // append new selections
        const previous = userSelection.glycoproteins && userSelection.glycoproteins.length ? [...userSelection.glycoproteins] : [];
        selected.forEach ((protein) => {
            const found = userSelection.glycoproteins.find ((item) => item.id === protein.id);
            if (!found) {
                previous.push (protein);
            }
        })
        setSelectedGlycoproteins(previous);
        setIsDirty(true);
    }

    async function handleAddNewMetadata () {
        setTextAlertInputMetadata ({"show": false, "id": ""});
        setUserSelection ({"metadata": metadataValues});
        setEnableGlyTableMakerMetadata(false);
        setIsDirty(true);
    }

    const handleChangeDownloadForm = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "type") {
          setFileFormat(newValue);
        } else if (name === "status") {
          if (newValue && newValue.length > 0)
            setGlycanStatus(newValue);
        } else if (name === "tag") {
            if (newValue && newValue.length > 0)
              setTag(newValue);
        }
    };
    
      const download = () => {
        setShowLoading(true);
        setTextAlertInput({"show": false, id: ""});
    
        let url = "api/data/downloadcollectionglycans?filetype=" + fileFormat;
        if (glycanStatus) url += "&status=" + glycanStatus;
        if (tag) url += "&tag=" + encodeURIComponent(tag);
        url += "&collectionid=" + collectionId;
        getBlob (url, getAuthorizationHeader()).then ( (data) => {
            const contentDisposition = data.headers.get("content-disposition");
            const fileNameIndex = contentDisposition.indexOf("filename=") + 10;
            const fileNameEndIndex = contentDisposition.indexOf(":");
            const fileName = contentDisposition.substring(fileNameIndex, fileNameEndIndex);
            const reportId = contentDisposition.substring(fileNameEndIndex+1, contentDisposition.length - 1);
    
            //   window.location.href = fileUrl;
            var fileUrl = URL.createObjectURL(data.data);
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = fileUrl;
            a.download = fileName;
            a.click();
    
            window.URL.revokeObjectURL(fileUrl);
            getDownloadReport(reportId);
            setShowLoading(false);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                //setTextAlertInput ({"show": true, "message": error.response.data.message });
                // read blob as json
                error.response.data.text().then( (resp) => {
                    const { message } = JSON.parse (resp);
                    getDownloadReport(message);
                });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
        setOpenDownloadDialog(false);    
    }
    
    const getDownloadReport = (reportId) => {
        //get the report with reportId
        getJson ("api/table/getreport/" + reportId, getAuthorizationHeader()).then ((data) => {
            setDownloadReport (data.data.data);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }  
        });
    }
    
      const displayDownloadReport = () => {
        return (
            <>
            <div style={{ marginTop: "15px"}}/>
            <Typography variant="h6" color={downloadReport.success ? "": "red"}>{downloadReport.message}</Typography>
            <div>
            {downloadReport.errors && "Errors:"}  
            {downloadReport.errors && downloadReport.errors.map ((error) => {
                        return <li>{error}</li>
                    })
            }
            {downloadReport.warnings && "Warnings:"}  
            {downloadReport.warnings && downloadReport.warnings.map ((warning) => {
                        return <li>{warning}</li>
                    })
            }
            </div>
            </>
        )
      };
    
      const downloadForm = () => {
        return (
        <>
          <Form>
            <Form.Group
              as={Row}
              controlId="fileType"
              className="gg-align-center mb-3"
            >
              <Col xs={12} lg={9}>
                <FormLabel label="File Type" className="required-asterik"/>
                <Form.Select
                    as="select"
                    name="type"
                    onChange={handleChangeDownloadForm}
                  >
                    <option key={0} value="GWS">
                          Glycoworkbench
                    </option>
                    <option key={1} value="EXCEL">
                          EXCEL
                    </option>
                  </Form.Select>
              </Col>
            </Form.Group>
            <Form.Group
              as={Row}
              controlId="status"
              className="gg-align-center mb-3"
            >
              <Col xs={12} lg={9}>
                <FormLabel label="Status"/>
                <Form.Select
                  as="select"
                  name="status"
                  onChange={handleChangeDownloadForm}>
                      <option key="select" value="">
                          Select
                      </option>
                      {glycanStatusList && glycanStatusList.map((n , index) =>
                          <option
                          key={index}
                          value={n}>
                          {n}
                          </option>
                      )}
              </Form.Select>
              </Col>
            </Form.Group>
            <Form.Group
                as={Row}
                controlId="tag"
                className="gg-align-center mb-3"
                >
                <Col xs={12} lg={9}>
                    <FormLabel label="Tag"/>
                    <Form.Select
                    as="select"
                    name="tag"
                    onChange={handleTagChange}>
                        <option key="select" value="">
                            Select
                        </option>
                        {glycanTags && glycanTags.map((n , index) =>
                            <option
                            key={index}
                            value={n.label}>
                            {n.label}
                            </option>
                        )}
                </Form.Select>
                </Col>
            </Form.Group>
            </Form>
            </>
          );
      };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        <Container maxWidth="xl">
            <div className="page-container">
            <div className="scroll-to-top-save">
        {isVisible && (
            <div>
                <Button variant="contained" className="gg-btn-blue-sm" 
                    disabled={error} onClick={handleSubmit}>
                    Save
                </Button>
            </div>
        )}
        {/** <usePrompt message="Are you sure you want to leave? You have changes that were not submitted yet!" when={isDirty} /> */}
        {/**blocker ? <ConfirmNavigation blocker={blocker} /> : null**/}
        {/**blocker.state === "blocked" ? (
                <div>
                <p>You have unsaved changes!</p>
                <button onClick={() => blocker.reset()}>
                    Oh shoot - I need them keep me here!
                </button>
                <button onClick={() => blocker.proceed()}>
                    I know! They don't matter - let me out of here!
                </button>
                </div> 
            ) : blocker.state === "proceeding" ? (
                <p>Navigating away with unsaved changes...</p>
            ) : <p>Not blocked </p> */}

    
        </div>
             <PageHeading title={collectionId && !isCopy ? "Edit Collection" : "Add Collection"} subTitle="Please provide the information for the new collection." />
             {downloadReport &&
              displayDownloadReport()
            }
            <Card>
            <Card.Body>
            
            <div className="mt-4 mb-4">
            <TextAlert alertInput={textAlertInput}/>
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
            
            <ConfirmationModal
                showModal={openDownloadDialog}
                onCancel={() => {
                setOpenDownloadDialog(false);
                }} 
                onConfirm={() => download()}
                title={"Download Glycans"}
                body={downloadForm()}
            />

            {selectedPublication && 
            <Popover
                id={id}
                open={showPublicationDetails}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                    setShowPublicationDetails(false);
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
            </Popover>}
            
            {showGlycanTable && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop="static"
                    show={showGlycanTable}
                    onHide={() => setShowGlycanTable(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Glycans:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listGlycans()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycanTable(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                     </Modal.Footer>
                </Modal>
            )}

            {showTagSelection && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop="static"
                    show={showTagSelection}
                    onHide={() => setShowTagSelection(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Tag :
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <Form.Group
                        as={Row}
                        controlId="name"
                        className="gg-align-center mb-3"
                        >
                        <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                            <FormLabel label="Tag" className="required-asterik" />
                            <Form.Select
                                name={"tag"}
                                onChange={handleTagChange}
                                isInvalid={validate}
                                >
                                <option value="">Select</option>  
                                {glycanTags.map((glycanTag, index) => {
                                return (
                                    <option value={glycanTag.label} key={index}>
                                        {glycanTag.label}
                                    </option>
                                );
                                })}
                                </Form.Select>
                            <Feedback message="Tag selection is required"></Feedback>
                            </Col>
                        </Form.Group>
                    </Form>
                    <Loading show={showLoading}></Loading>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowTagSelection(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanbyTagSelect}>Add Glycans with Selected Tag</Button>
                     </Modal.Footer>
                </Modal>
            )}

            {showGlycoproteinTagSelection && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop="static"
                    show={showGlycoproteinTagSelection}
                    onHide={() => setShowGlycoproteinTagSelection(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Tag :
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                    <Form>
                        <Form.Group
                        as={Row}
                        controlId="name"
                        className="gg-align-center mb-3"
                        >
                        <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                            <FormLabel label="Tag" className="required-asterik" />
                            <Form.Select
                                name={"tag"}
                                onChange={handleTagChange}
                                isInvalid={validate}
                                >
                                <option value="">Select</option>  
                                {glycanTags.map((glycanTag, index) => {
                                return (
                                    <option value={glycanTag.label} key={index}>
                                        {glycanTag.label}
                                    </option>
                                );
                                })}
                                </Form.Select>
                            <Feedback message="Tag selection is required"></Feedback>
                            </Col>
                        </Form.Group>
                    </Form>
                    <Loading show={showLoading}></Loading>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycoproteinTagSelection(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycoproteinbyTagSelect}>Add Glycoproteins with Selected Tag</Button>
                     </Modal.Footer>
                </Modal>
            )}

            {showGlycoproteinTable && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop="static"
                    show={showGlycoproteinTable}
                    onHide={() => setShowGlycoproteinTable(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Glycoproteins:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listGlycoproteins()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycoproteinTable(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycoproteinSelect}>Add Selected Glycoproteins</Button>
                     </Modal.Footer>
                </Modal>
            )}

            {enableGlyTableMakerMetadata && (
                <Dialog
                    maxWidth="xl"
                    fullWidth="true"
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    scroll="paper"
                    centered
                    open={enableGlyTableMakerMetadata}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setEnableGlyTableMakerMetadata(false)
                    }}
                >
                    <DialogTitle id="parent-modal-title">
                        <Typography id="parent-modal-title" variant="h6" component="h2">
                        {metadataDialogTitle}
                        </Typography>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => setEnableGlyTableMakerMetadata(false)}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                        >
                    <CloseIcon />
                    </IconButton>
                    <DialogContent dividers ref={metadataDialogRef}>
                        <Typography id="parent-modal-description" sx={{ mt: 2 }}>
                        {addNewMetadataForm()}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        {getGlyTableMakerNavigationButtons()}
                        <Button className="gg-btn-outline-reg"
                            onClick={()=> {
                                setActiveStep2(0);
                                setEnableGlyTableMakerMetadata(false);
                            }}>Cancel</Button>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=>handleAddNewMetadata()}>Add</Button>
                    </DialogActions>
                     
                </Dialog>
            )}
            <Form>
                <Form.Group
                  as={Row}
                  controlId="name"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name of the collection"
                      value={userSelection.name}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Name is required"></Feedback>
                    </Col>
                </Form.Group>
                
                {/* Description */}
                <Form.Group
                  as={Row}
                  controlId="description"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Description" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="description"
                      placeholder="Enter description"
                      value={userSelection.description}
                      onChange={handleChange}
                      required={false}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                </Col>
                </Form.Group>
                {/* collection type */}
                <Form.Group
                  as={Row}
                  controlId="type"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Collection Type" />
                    <Form.Control
                      type="text"
                      name="type"
                      value={userSelection.type ?? collectionType}
                      readOnly
                      />
                </Col>
                </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Button onClick={()=> navigate("/collections")}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Collections</Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={handleSubmit}>
                    Save
                </Button> 
            </div>
            <div className="text-center mb-2">
                <Button onClick={()=> handleClick(metadataRef)}
                    className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Go to Metadata</Button>
                {collectionType && collectionType === "GLYCAN" &&
                <Button className="gg-btn-outline mt-2 gg-ml-20" 
                    onClick={()=> handleClick(glycanRef)}>
                    Go to Glycans
                </Button>}
                {collectionType && collectionType === "GLYCOPROTEIN" ?
                <Button className="gg-btn-outline mt-2 gg-ml-20" 
                    onClick={()=> handleClick(glycanRef)}>
                    Go to Glycoproteins
                </Button> : <></>}
            </div>
            </Card.Body>
          </Card>
          <Card ref={glycanRef} style={{marginTop: "15px"}}>
            <Card.Body>
            {collectionType && collectionType === "GLYCAN" &&
            <h5 className="gg-blue" style={{textAlign: "left"}}>
                 Glycans in the Collection</h5>}
            {collectionType && collectionType === "GLYCOPROTEIN" &&
            <h5 className="gg-blue" style={{textAlign: "left"}}>
                 Glycoproteins in the Collection</h5>
            }
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                    {collectionType && collectionType === "GLYCAN" &&
                        <>
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setShowGlycanTable(true)}>
                         Add Glycan
                        </Button>
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                        disabled={error} onClick={()=> {
                            setSelectedTag(null);
                            setShowTagSelection(true);
                        }}>
                        Add Glycan by Tag
                       </Button>
                       </> }
                       {collectionType && collectionType === "GLYCOPROTEIN" &&
                       <>
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setShowGlycoproteinTable(true)}>
                         Add Glycoprotein
                        </Button>
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                        disabled={error} onClick={()=> {
                            setSelectedTag(null);
                            setShowGlycoproteinTagSelection(true);
                        }}>
                        Add Glycoprotein by Tag
                       </Button>
                       </>}
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20"
                           disabled={error || !collectionId} onClick={()=>setOpenDownloadDialog(true)}> 
                        Download
                </Button>
                        </div>
                    </Col>
                    </Row>
                {collectionType && collectionType === "GLYCAN" &&
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "glycanId"
                    data = {userSelection.glycans}
                    columns={columns}
                    enableRowActions={true}
                    delete={deleteFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                    columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCANINCOLLECTION"
                    saveColumnVisibilityChanges={saveColumnVisibilityChanges}
                />}
                {collectionType && collectionType === "GLYCOPROTEIN" &&
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "id"
                    data = {userSelection.glycoproteins}
                    columns={columns2}
                    enableRowActions={true}
                    delete={deleteFromGlycoproteinTable}
                    setAlertDialogInput={setAlertDialogInput}
                    columnsettingsws="api/setting/getcolumnsettings?tablename=GLYCOPROTEININCOLLECTION"
                    saveColumnVisibilityChanges={saveColumnVisibilityChanges}
                />}
            </Card.Body>
          </Card>
          <Card ref={metadataRef} style={{marginTop: "15px"}}>
            <Card.Body>
            <h5 className="gg-blue" style={{textAlign: "left"}}>
                Metadata</h5>
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                        {collectionType &&
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> {
                            setTextAlertInputMetadata({"show": false, "message":""});
                            setActiveStep2(0);
                            setEnableGlyTableMakerMetadata(true);
                         }
                        }>
                         Add GlyTableMaker Metadata
                        </Button> }
                        </div>
                    </Col>
                    </Row>
                
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "metadataId"
                    data = {metadataRows}
                    columns={metadatacolumns}
                    enableRowActions={false}
                    setAlertDialogInput={setAlertDialogInput}
                    columnsettingsws="api/setting/getcolumnsettings?tablename=METADATA"
                    saveColumnVisibilityChanges={saveMetadataColumnVisibilityChanges}
                />
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
};

export default Collection;