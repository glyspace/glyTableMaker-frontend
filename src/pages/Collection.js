import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getBlob, getJson, postJson, postJsonAsync } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Autocomplete, Box, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, IconButton, Popover, Radio, RadioGroup, Step, StepLabel, Stepper, TextField, Tooltip, Typography } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Row, Modal} from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";
import MetadataTreeView from "../components/MetadataTreeView";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { ScrollToTop } from "../components/ScrollToTop";
import FeedbackWidget from "../components/FeedbackWidget";
import DeleteIcon from '@mui/icons-material/Delete';
import { AddCircleOutline } from "@mui/icons-material";
import HelpTooltip from "../components/HelpTooltip";
import CloseIcon from '@mui/icons-material/Close';
import ArticleIcon from '@mui/icons-material/Article';
import ContributorTable from "../components/ContributorTable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

let idCounter = 1000;

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
    const [validMetadata, setValidMetadata] = useState([]);
    const [validationMessage, setValidationMessage] = useState([]);
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
    const [enableAddMetadata, setEnableAddMetadata] = useState(false);
    const [showPublicationDetails, setShowPublicationDetails] = useState(false);
    const [selectedPublication, setSelectedPublication] = useState(null);

    const [categories, setCategories] = useState([]);
    const [options, setOptions] = useState([]);    // array (for each selected metadata) of options array
    const [namespace, setNamespace] = useState([]);
    const [selectedMetadataValue, setSelectedMetadataValue] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);
    const [selectedDatatype, setSelectedDatatype]  = useState([]);
    const [metadataItemKey, setMetadataItemKey] = useState([]);

    const [isVisible, setIsVisible] = useState(false);

    const [downloadReport, setDownloadReport] = useState(null);
    const [openDownloadDialog, setOpenDownloadDialog] = useState(false);
    const [fileFormat, setFileFormat] = useState("GWS");
    const [glycanStatus, setGlycanStatus] = useState(null);
    const [tag, setTag] = useState(null);
    const [glycanStatusList, setGlycanStatusList] = useState([]);
    const [glycanTags, setGlycanTags] = useState([]);

    const [activeStep, setActiveStep] = useState(0);
    const [glygen, setGlygen] = useState(false);

    const [contributor, setContributor] = useState(null);
    const [userProfile, setUserProfile] = useState([]);
    const [softwareProfile, setSoftwareProfile] = useState([]);

    const [canonicalForm, setCanonicalForm] = useState([]);
    const [enableMultiValueSelect, setEnableMultiValueSelect] = useState(false);
    const [multiValueSelectIndex, setMultiValueSelectIndex] = useState(-1);
    const [selectedCanonical, setSelectedCanonical] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);

    const [availableMetadata, setAvailableMetadata] = useState([]);
    const [availableMetadataSelected, setAvailableMetadataSelected] = useState(null);

    const tableMakerSoftware = {
        id: 1,
        name: "GlyTableMaker",
        url: "https://glygen.ccrc.uga.edu/tablemaker",
        role: "createdWith",
    };

    const steps = ["Select metadata", "Enter values"];

    const [selectedMetadataItems, setSelectedMetadataItems] = useState([]);

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

    useEffect(() => {
        props.authCheckAgent();
        getCategories();
        getStatusList();
        getGlycanTags();
        getProfile();
        window.addEventListener("scroll", toggleSaveVisibility);
    }, []);

    useEffect(() => {
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
               setUserProfile(userArray);
               let softwareArray = [];
               softwareArray.push(tableMakerSoftware);
               setSoftwareProfile(softwareArray);
               // set default contributor string
               // fill in the defaults
               let c = user.role + ":" + user.name + " (" + user.email + (user.organization && user.organization.length !== 0? ", " + user.organization : "") + ")";
               c += "|" + tableMakerSoftware.role + ":" + tableMakerSoftware.name + " (" + tableMakerSoftware.url + ")";
               setContributor(c);
            }
            
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
          });
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

    function getCategories() {
        getJson ("api/metadata/getcategories", getAuthorizationHeader()).then (({ data }) => {
            setCategories(data.data);
        }).catch(function(error) {
            axiosError(error, null, setAlertDialogInput);
        });
    }

    function getCanonicalForm (namespace, value, index) {
        if (!value || value.length === 0) return;
        // get the canonical form
        return postJson ("api/util/getcanonicalform?namespace=" + namespace + "&value=" + encodeURIComponent(value),
            null, getAuthorizationHeader()).then ((data) => {
                if (data.data && data.data.data) {
                    if (data.data.data.length > 1) {
                        setCanonicalForm (data.data.data);
                        setMultiValueSelectIndex(index);
                        setEnableMultiValueSelect (true);
                    } else {
                        const nextSelectedMetadataValue = selectedMetadataValue.map((v, i) => {
                            if (i === index && data.data.data[0]) {
                                return data.data.data[0].label;
                            } else {
                                return v;
                            }
                        });
            
                        setSelectedMetadataValue(nextSelectedMetadataValue);
                    }
                }
            }).catch(function(error) {
                axiosError(error, null, setAlertDialogInput);
            });
    }
 
    const onInputChange = (event, value, reason, index, dropdown, typeahead) => {
        if (!event) return;
        setTextAlertInputMetadata ({"show": false, "id":""});
        if (value) {
          if (!dropdown && typeahead && reason === "input") getTypeAhead(value, index);
          if (!dropdown && typeahead && reason === "reset") {
             event && event.preventDefault();
             getCanonicalForm (namespace[index], value, index);
          } else {
            const nextSelectedMetadataValue = selectedMetadataValue.map((v, i) => {
                if (i === index) {
                return value;
                } else {
                return v;
                }
            });

            setSelectedMetadataValue(nextSelectedMetadataValue);
          }
        } else { 
            const nextOptions = options.map ((o, i) => {
                if (i === index && !dropdown) {
                    return [];
                }
                else
                    return o;
            });
            setOptions(nextOptions);
        }
    };

    const getTypeAhead =  (searchTerm, index) => {
        getJson ("api/util/gettypeahead?namespace=" + namespace[index] + "&limit=10&value=" + encodeURIComponent(searchTerm), 
                getAuthorizationHeader()).then (({ data }) => {
                    const nextOptions = options.map ((o, i) => {
                        if (i === index)
                            return data.data;
                        else
                            return o;
                    });
                    setOptions(nextOptions);
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
                    publicationCache[pubId] = data.data;
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

        const metadata = [];
        userSelection.metadata.map ((m) => {
            if (m.new || isCopy) {
                m.metadataId = null;
            }
            metadata.push(m);
        });

        const collection = { 
            collectionId: collectionId && !isCopy ? collectionId : null,
            name: userSelection.name,
            description: userSelection.description,
            glycans: userSelection.glycans,
            glycoproteins: userSelection.glycoproteins,
            type: collectionType,
            metadata: metadata,
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
            accessorKey: 'cartoon',
            header: 'Image',
            size: 150,
            columnDefType: 'display',
            Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
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
            accessorKey: 'type.name', 
            header: 'Name',
            size: 50,
            id: 'name',
        },
        {
            accessorKey: 'type.description',
            header: 'Description',
            size: 250,
            id: 'typeDescr',
        },
        {
            accessorKey: 'value',
            header: 'Value',
            size: 150,
            Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* using renderedCellValue instead of cell.getValue() preserves filter match highlighting */}
                <span>{renderedCellValue}</span>
                {row.original.type.name === "Evidence" && <IconButton
                        aria-label="show publication details"
                        onClick={(e) =>  {
                            getPublication(renderedCellValue, e);
                        }}
                        >
                    <ArticleIcon />
                </IconButton>}
              </Box>
            ),
        },
        {
            accessorKey: 'valueId',
            header: 'Value ID',
            size: 150,
        },
        {
            accessorKey: 'valueUri',
            header: 'Value URI',
            size: 150,
        },
    ],
    [],
    );

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

    const removeMetadataItems = index => {
        setIsDirty(true);
        let removed = [...selectedMetadataItems];
        removed.splice(index, 1);
        let removedValue = [...selectedMetadataValue];
        removedValue.splice(index, 1);
        //handleMetadataSelectionChange(removed, false);
        let nextDatatype = [...selectedDatatype];
        nextDatatype.splice(index, 1);
        let nextNamespace = [...namespace];
        nextNamespace.splice(index, 1);
        let nextSelectedOption = [...selectedOption];
        nextSelectedOption.splice(index, 1);
        let nextValidMetadata = [...validMetadata];
        nextValidMetadata.splice(index, 1);
        let nextOptions = [...options];
        nextOptions.splice(index, 1);
        let nextMetadataItemKey = [...metadataItemKey];
        nextMetadataItemKey.splice(index, 1);
        setSelectedMetadataItems(removed);
        setSelectedMetadataValue(removedValue);
        setSelectedOption(nextSelectedOption);
        setSelectedDatatype(nextDatatype);
        setNamespace(nextNamespace);
        setValidMetadata(nextValidMetadata);
        setOptions(nextOptions);
        setMetadataItemKey(nextMetadataItemKey);
        updateAvailableMetadata (removed);
    };

    const addItemToSelection = (datatypeId) => {
        setIsDirty(true);

        let added = [...selectedMetadataItems];
        let addedValues = [...selectedMetadataValue];
        let addedItemKey = [...metadataItemKey];

        var idx = findSortedIndex (added, datatypeId);
        added.splice(idx, 0, datatypeId);
        addedValues.splice (idx, 0, "");
        addedItemKey.splice(idx, 0, null);
        
        let categoryId = 1;
        let itemId = datatypeId;
        if (itemId > 200) {
            categoryId = 2;
            itemId = itemId - 200;
        } else if (itemId > 100) {
            itemId = itemId - 100;
        } 

        handleMetadataSelectionChange (added, addedValues, categoryId, addedItemKey);
        setMetadataItemKey(addedItemKey);
        setSelectedMetadataItems(added);
        setSelectedMetadataValue(addedValues);
    }

    const handleSelectedItemsChange = (event, ids) => {
        setTextAlertInputMetadata({"show": false, "message":""});
        let filteredSelection = [];
        let filteredValues = [];
        ids.map ((item, index) => {
            if (typeof item === 'number') {
                let itemId = item;
                if (itemId > 200) 
                    itemId = itemId - 200;
                else if (itemId > 100) 
                    itemId = itemId - 100;
                const multiple = isMultiple(itemId);
                const existing = userSelection.metadata.find ((meta) => 
                    meta.type.datatypeId === itemId);
                var idx = findSortedIndex (filteredSelection, item);
                filteredSelection.splice(idx, 0, item);
                if (existing) {
                    filteredValues.splice (idx, 0, existing.value);
                } else {
                    filteredValues.splice (idx, 0, "");
                }
              /*  if (!multiple && userSelection.metadata) {
                    // check if it already exists
                    const existing = userSelection.metadata.find ((meta) => 
                        meta.type.datatypeId === itemId);
                    if (existing) {
                        setTextAlertInputMetadata({"show" : true, message: getDatatypeName(itemId) + " already exists and is not added to the list. If you'd like to override, please go back and delete it first!"});
                        scrollToDialogTop();
                        return;
                    }
                }
                filteredSelection.push(item);*/
                setIsDirty(true);
            }
        });
        setSelectedMetadataItems (filteredSelection);
        setSelectedMetadataValue (filteredValues);
    }

    const getDatatype = (datatypeId) => {
        for (let element of categories) {
            if (element.dataTypes) {
                var datatype = element.dataTypes.find ((item) => item.datatypeId === datatypeId);
                if (datatype) 
                    return datatype;
            }
        }
        return null;
    }

    const getDatatypeName = (datatypeId) => {
        var datatype = getDatatype(datatypeId);
        if (datatype) {
            return datatype.name;
        }    
        return null;
    }

    const isDropdown = (datatypeId) => {
        var datatype = getDatatype(datatypeId);
        if (datatype) {
            return datatype.namespace.fileIdentifier && datatype.namespace.hasUri === false && datatype.namespace.hasId === false;
        }
        return false;
    }

    const isTypeahead = (datatypeId) => {
        var datatype = getDatatype(datatypeId);
        if (datatype) {
            return !! (datatype.namespace.fileIdentifier && (datatype.namespace.hasUri || datatype.namespace.hasId));
        }
        return false;
    }

    const isMultiple = (datatypeId) => {
        const datatype = getDatatype(datatypeId);
        if (datatype) 
            return datatype.multiple;   
        return false;
    }

    const isMandatory = (datatypeId) => {
        const datatype = getDatatype(datatypeId);
        if (datatype) 
            return datatype.mandatory;   
        return false;
    }

    const isSecondCopy = (datatypeId, index) => {
        if (index > 0) {
            for (let i = 0; i < index; i++) {
                if (selectedMetadataItems[i] === datatypeId) {
                    return true; // this is the second or later copy
                }
            }
        }
        return false;
    }

    function getStepContent (stepIndex) {
        switch (stepIndex) {
            case 0:
                return (
                    <>
                    <h5 className="gg-blue" style={{textAlign: "left"}}>
                        Selected Metadata</h5>
                    <div className="tags-input">
                        <ul id="tags">
                            {selectedMetadataItems && selectedMetadataItems.length > 0 && 
                            selectedMetadataItems.map((m, index) => {
                                let itemId = m;
                                if (itemId > 200) 
                                    itemId = itemId - 200;
                                else if (itemId > 100) 
                                    itemId = itemId - 100;
                                return ( <li key={index} className="tag">
                                            <span className='tag-title'>{getDatatypeName(itemId)}</span>
                                            <span className='tag-close-icon'
                                            onClick={() => removeMetadataItems(index)}
                                            >
                                            x
                                            </span>
                                        </li>
                                )
                            })}
                        </ul>
                    </div>
                    <MetadataTreeView data={categories} checkboxSelection
                        onSelectedItemsChange={handleSelectedItemsChange}
                        selectedItems={selectedMetadataItems}/>
                    </>
                );
            case 1:
                return (
                    <>
                    {enableMultiValueSelect && multiValueSelectIndex !== -1 && multiValueDialog()} 
                    {selectedMetadataItems.map ((dId, index) => {
                        let datatypeId = dId;
                        if (datatypeId > 200) {
                            datatypeId = datatypeId - 200;
                        } else if (datatypeId > 100) {
                            datatypeId = datatypeId - 100;
                        } 
                        const dropdown = isDropdown(datatypeId);
                        const typeahead = isTypeahead(datatypeId);
                        const mandatory = isMandatory(datatypeId);
                        const secondCopy = isSecondCopy (dId, index);
                        const dType = getDatatype(datatypeId);
                        return (
                        <Row>
                            <Col style={{marginTop: "15px"}} md="4">
                            {mandatory ? 
                            <FormLabel label={getDatatypeName(datatypeId)} className="required-asterik"/> :
                            <FormLabel label={getDatatypeName(datatypeId)}/> }
                            <HelpTooltip
                                title={dType ? dType.name: ""}
                                text={dType && dType && dType.description ? dType.description : undefined}
                                example={dType && dType.example ? dType.example : undefined}
                                url={dType && dType.wikiUrl  ? dType.wikiUrl : undefined}
                                urlText="Read more..."
                            />
                            </Col>
                            <Col style={{marginTop: "10px"}} md="5">
                                 {dType && dType.name === "Contributor" && (
                                    <>
                                    <ContributorTable 
                                        setContributor={setContributor} 
                                        user={userProfile} 
                                        software={softwareProfile} 
                                        contributor={contributor}
                                        error={validMetadata[index]}
                                        validationMessage={validMetadata[index] ? validationMessage[index] : ""}/>
                                    { /** <Button className="gg-btn-blue-sm mt-2" onClick={(e)=> {setEnableContributorDialog(true);}}>Edit</Button> **/}
                                    </>)}
                                 {dType && dType.name !== "Contributor" && (
                                    <>                           
                                    <Autocomplete
                                        freeSolo={!dropdown}
                                        disablePortal={dropdown}
                                        disabled={!namespace[index]}
                                        id={`"typeahead"_ ${ index }}`}
                                        key={metadataItemKey[index]}
                                        value={selectedMetadataValue[index] ?? ""}
                                        onClose={(event, reason) => {
                                            console.log("closing reason " + reason );
                                            if (options[index].length === 0) return;
                                            if (!dropdown && typeahead && (reason === "selectOption" || reason === "blur")) {
                                                getCanonicalForm (namespace[index], 
                                                    reason === "selectOption" ? event.target.textContent : event.target.value, 
                                                    index);
                                            }
                                        }}
                                        isOptionEqualToValue={(option, value) => (dropdown || option === value)}
                                        options={options[index]}
                                        onChange={(e, value) => {
                                            const nextSelectedOption = selectedOption.map ((item, i) => {
                                                if (i === index) {
                                                    return value;
                                                } else {
                                                    return item;
                                                }
                                            });
                                            setSelectedOption(nextSelectedOption);
                                        }}
                                        onInputChange={(e, value, reason) => onInputChange(e, value, reason, index, dropdown, typeahead)}
                                        getOptionLabel={(option) => option}
                                        style={{ width: '100%' }}
                                        renderInput={(params) => (
                                        <TextField {...params} 
                                            error={validMetadata[index]} 
                                            helperText={validMetadata[index] ? validationMessage[index] : ""}
                                            disabled={!namespace[index]} label="Value" variant="outlined" />
                                        )}
                                />
                                </>)}
                            </Col>
                            <Col style={{marginTop: "10px", display: "flex", justifyContent:"left"}} md="3">
                            {(!mandatory || (mandatory && secondCopy)) && (
                            <Tooltip title="Remove this metadata">
                                <IconButton color="error" onClick={(event) => {removeMetadataItems(index)}}>
                                <DeleteIcon />
                                </IconButton>
                            </Tooltip>)}
                            {isMultiple (datatypeId) && (
                              <Tooltip title="Add another copy of this metadata">
                              <IconButton color="primary" onClick={(event) => {addItemToSelection(dId)}}>
                                <AddCircleOutline />
                              </IconButton></Tooltip>
                            )}
                            </Col>
                        </Row>
                        );
                    })}

                    {availableMetadata && 
                    <>
                    <br/>
                    <hr style={{width:"100%", height:"2px", color:"#2f78b7", backgroundColor: "#2f78b7",align:"center"}}/>
                    <Row>
                    <Col xs={4} lg={4}>
                        <FormLabel label="Add Missing/Additional Metadata"/>
                    </Col>
                    <Col xs={5} lg={5}>
                        <Form.Select
                            as="select"
                            name="metadata"
                            onChange={(e) => {setAvailableMetadataSelected(Number(e.target.value))}}
                        >
                        {availableMetadata && availableMetadata.map((n , index) => 
                          <option
                          key={index}
                          value={100 + n.datatypeId}>
                          {n.name}
                          </option>
                        )}
                        </Form.Select>
                    </Col>
                    <Col xs={3} lg={3}>
                        <Tooltip title="Add another copy of this metadata">
                            <IconButton color="primary" onClick={(event) => {addItemToSelection(availableMetadataSelected)}}>
                                <AddCircleOutline />
                            </IconButton>
                        </Tooltip>
                    </Col>
                    </Row>
                    </>}
                    </>
                );
        }
    }

    function multiValueDialog () {
        return (
            <Dialog
                    maxWidth="sm"
                    fullWidth="true"
                    aria-labelledby="multivalue-modal-title"
                    aria-describedby="multivaluee-modal-description"
                    scroll="paper"
                    
                    sx={{ //You can copy the code below in your theme
                        '& .MuiBackdrop-root': {
                          backgroundColor: 'transparent' // Try to remove this to see the result
                        }
                      }}
                    open={enableMultiValueSelect}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setEnableMultiValueSelect(false);
                        setMultiValueSelectIndex(-1);
                        setSelectedCanonical(null);
                    }}
                >
                    <DialogTitle id="multivalue-modal-title">
                        <Typography id="multivalue-modal-title" variant="h6" component="h2">
                        There are multiple matches for this selection. Select one: 
                        </Typography>
                    </DialogTitle>
                    <DialogContent dividers>
                        {canonicalForm && 
                        <FormControl>
                        <RadioGroup
                          aria-labelledby="demo-radio-buttons-group-label"
                          name="radio-buttons-group"
                          defaultValue={canonicalForm[0] && canonicalForm[0].label}
                        >
                        {canonicalForm.map ((val, i) => {
                            return <FormControlLabel 
                                value={val.label} 
                                control={<Radio />} 
                                label={val.label}
                                onChange={(event) => {
                                    setSelectedCanonical (event.target.value);
                                }} />
                        })}
                        </RadioGroup>
                      </FormControl>}
                    </DialogContent>
                    <DialogActions>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=> {
                                // set the selected metadatavalue
                                const nextSelectedMetadataValue = selectedMetadataValue.map((v, i) => {
                                    if (i === multiValueSelectIndex) {
                                        if (selectedCanonical)
                                            return selectedCanonical;
                                        else 
                                            return canonicalForm[0].label;
                                    } else {
                                        return v;
                                    }
                                });
                    
                                setSelectedMetadataValue(nextSelectedMetadataValue);
                                setEnableMultiValueSelect (false);
                                setMultiValueSelectIndex(-1);
                                setSelectedCanonical(null);
                            }}>Select</Button>
                    </DialogActions>
            </Dialog>
        )
    }

    function getNavigationButtons() {
        return (
          <div className="text-center">
            {!glygen &&
            <Button disabled={activeStep === 0} onClick={handleBack} className="gg-btn-blue gg-ml-20 gg-mr-20">
              Back
            </Button>
            }
            {activeStep < steps.length - 1 &&
            <Button variant="contained" className="gg-btn-blue gg-ml-20" onClick={handleNext}>
               Next
            </Button>}
          </div>
        );
    }

    const handleBack = () => {
        setActiveStep(prevActiveStep => prevActiveStep - 1);
    };

    const sortMetadata = (metadataItems) => {
        metadataItems.sort((a, b) => {
            var first;
            var second;
            var firstMandatory;
            var secondMandatory;
            if (typeof a === 'number') {  // datatype selected
                let itemId = a;
                if (itemId > 200) {
                    itemId -= 200;
                } else if (itemId > 100) {
                    itemId -= 100;
                }
                first = getDatatypeName(itemId);
                firstMandatory = isMandatory(itemId);
            }
            if (typeof b === 'number') {  // datatype selected
                let itemId = b;
                if (itemId > 200) {
                    itemId -= 200;
                } else if (itemId > 100) {
                    itemId -= 100;
                }
                second = getDatatypeName(itemId);
                secondMandatory = isMandatory(itemId);
            }

            if (firstMandatory < secondMandatory) {
                return 1;
            } 
            if (secondMandatory < firstMandatory) {
                return -1;
            }

            if (first && first.toLowerCase() > second.toLowerCase())
                return 1;
            else
                return -1;
        });
    }

    const handleMetadataSelectionChange = (metadataItems, metadataValues, categoryId, metadataItemKey) => {
        const nextDatatype = [];
        const nextNamespace = [];
        const nextOptions = [];
        const nextSelectedOption = [];
        const nextValidMetadata = [];
        const nextSelectedMetadataValue = [];
        const nextMetadataItemKey = [];

        //if (isNew) sortMetadata(metadataItems);

        
        metadataItems.map ((iId, index) => {
            if (typeof iId === 'number') {  // datatype selected
                // find namespace of the datatype and display appropriate value field
                // locate the datatype
                let itemId = iId;
                if (itemId > 200) {
                    itemId -= 200;
                } else if (itemId > 100) {
                    itemId -= 100;
                }
                let found = false;
                categories.map ((element) => {
                    if (categoryId && element.categoryId === categoryId) {
                        if (element.dataTypes) {
                            var datatype = element.dataTypes.find ((item) => item.datatypeId === itemId);
                            if (datatype) {
                                nextDatatype.push(datatype);
                                nextNamespace.push (datatype.namespace.name);
                                if (datatype.allowedValues) {
                                    nextOptions.push(datatype.allowedValues);
                                } else {
                                    nextOptions.push([]);
                                }
                                return;
                            }
                        }
                    }
                    if (!categoryId && !found) {
                        if (element.dataTypes) {
                            var datatype = element.dataTypes.find ((item) => item.datatypeId === itemId);
                            if (datatype) {
                                nextDatatype.push(datatype);
                                nextNamespace.push (datatype.namespace.name);
                                if (datatype.allowedValues) {
                                    nextOptions.push(datatype.allowedValues);
                                } else {
                                    nextOptions.push([]);
                                }
                                found = true;
                                return;
                            }
                        }
                    }
                });
                nextSelectedOption.push(selectedOption[index] ?? null);
                nextValidMetadata.push (false);
                nextSelectedMetadataValue.push(metadataValues[index]);
                nextMetadataItemKey.push(metadataItemKey[index] ?? idCounter++);
            }
        });

        setSelectedDatatype(nextDatatype);
        setNamespace(nextNamespace);
        setOptions(nextOptions);
        setSelectedOption(nextSelectedOption);
        setValidMetadata(nextValidMetadata);
        setSelectedMetadataValue(nextSelectedMetadataValue);
        setMetadataItemKey(nextMetadataItemKey);
        setIsDirty(true);
    }

    const handleNext = () => {
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        handleMetadataSelectionChange (selectedMetadataItems, selectedMetadataValue, null, metadataItemKey);
    }

    function getStepLabel(stepIndex) {
        switch (stepIndex) {
          case 0:
            return "Select metadata by using checkboxes, top level categories cannot be selected";
          case 1:
            return "Enter values for each metadata";
          default:
            return "Unknown step " + stepIndex ;
        }
    }

    const addMetadataForm = () => {
        return (
            <>
                <TextAlert alertInput={textAlertInputMetadata}/>
                <Stepper className="steper-responsive5 text-center" activeStep={activeStep} alternativeLabel>
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <h5 className="text-center gg-blue mt-4 mb-4">{getStepLabel(activeStep)}</h5>
              {getNavigationButtons()}
              <div className="mt-4 mb-4">
                {getStepContent(activeStep, validate)}
              </div>
              {/**getNavigationButtons()**/}
            </>
        )
    }

    const fetchByTag = (url, isGlycan) => {
        let searchParams = "start=0";
        searchParams += "&filters=" + encodeURI(JSON.stringify([{"id": "tags", "value": selectedTag}]));

        setShowLoading(true);
    
        getJson (url + "?" + searchParams, getAuthorizationHeader()).then ( (json) => {
          isGlycan ? setSelectedGlycans(json.data.data.objects) : setSelectedGlycoproteins (json.data.data.objects);
          const selected=[];
          json.data.data.objects.forEach ((item) => {
            if (isGlycan && (!item.glytoucanID || item.glytoucanID.length === 0)) {
                // error, not allowed to select this for the collection
                setTextAlertInput ({"show": true, 
                    "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + item.glycanId + " is not added."
                });
                ScrollToTop();
            } else {
                selected.push (item);
            }
          });

          isGlycan ? setUserSelection({"glycans": selected}) : setUserSelection({"glycoproteins" : selected});
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

    const deleteMetadataFromTable = (id) => {
        var metadata = userSelection.metadata;
        const index = metadata.findIndex ((item) => item["metadataId"] === id);
        var updated = [
            ...metadata.slice(0, index),
            ...metadata.slice(index + 1)
        ];
        setUserSelection ({"metadata": updated});
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

    const fillInContributor = () => {
        // fill in the contributor
        for (let element of categories) {
            if (element.dataTypes) {
                const datatype = element.dataTypes.find ((item) => item.name === "Contributor");
                if (datatype) {
                    const index = selectedMetadataItems.findIndex ((item) => item === element.categoryId * 100 + datatype.datatypeId);
                    if (index != -1) {
                        selectedMetadataValue[index] = contributor;
                    }
                }
            }
        }
        setIsDirty(true);
    }

    const parseContributor = (val) => {
        // split by | -> multiple items
        const userSoftware = val.split("|");
        let userId = 1;
        let sId = 1;
        let userArray = [];
        let softwareArray = [];
        userSoftware.forEach (u => {
            const parts = u.split(":");
            if (parts.length >= 2) {
                const role = parts[0];
                if (role.includes ("By")) { // user
                    const remainder = parts[1];
                    if (remainder.includes ("(")) {
                        const name = remainder.substring(0, remainder.indexOf("(")).trim();
                        const emailOrg = remainder.substring (remainder.indexOf("(")+1, remainder.indexOf(")"));
                        const splitted = emailOrg.split(",");
                        const user = {
                            id: userId,
                            name: name,
                            role: role,
                            email: splitted[0],
                            organization: splitted.length > 1 ? splitted[1] : "",
                        }
                        userId = userId + 1;
                        userArray.push (user);
                    } else {
                        const user = {
                            id: userId,
                            name: remainder,
                            role : role
                        }
                        userId = userId + 1;
                        userArray.push (user);
                    }
                } else {  // sofware
                    const remainder = u.substring (u.indexOf(":")+1);
                    if (remainder.includes ("(")) {
                        const name = remainder.substring(0, remainder.indexOf("(")).trim();
                        const url = remainder.substring (remainder.indexOf("(")+1, remainder.indexOf(")"));
                        const software = {
                            id: sId,
                            name: name,
                            role: role,
                            url: url,
                        }
                        sId = sId + 1;
                        softwareArray.push(software);
                    } else {
                        const software = {
                            id: sId,
                            name: remainder,
                            role: role,
                        }
                        sId = sId + 1;
                        softwareArray.push(software);
                    }
                }
                
            }
        });
        setUserProfile(userArray);
        setSoftwareProfile(softwareArray);
        
    }

    async function handleAddMetadata () {
        setTextAlertInputMetadata ({"show": false, "id": ""});
        console.log("adding metadata " + selectedMetadataValue);

        fillInContributor();

        if (selectedMetadataValue.length === 0) {
            setTextAlertInputMetadata ({"show": true, "message": "Enter a value for all selected metadata"});
            return;
        }

        let valuesFilled = true;
        selectedMetadataValue.map ((selected, index) => {
            if (!selected || selected.length < 1) 
                valuesFilled = false;
        });

        if (!valuesFilled) {
            setTextAlertInputMetadata ({"show": true, "message": "Enter a value for all selected metadata"});
            return;
        }
 
        setShowLoading(true);
        var metadata = userSelection.metadata;
        if (metadata === null) 
            metadata = [];

        let allMetadataToSubmit = [];
        let error = false;
        selectedMetadataValue.map ((selected, index) => {
            // check if the metadata already exists, if so, we need to check if it is allowed to be multiple
            /*if (!selectedDatatype[index].multiple) {
                const existing = metadata.find ((meta) => meta.type.name === selectedDatatype[index].name);
                if (existing) {
                    setTextAlertInputMetadata({"show": true, "message": "Multiple copies are not allowed for " + selectedDatatype[index].name});
                    error = true;
                    //setEnableAddMetadata(false);
                    //return;
                }
            }*/
            const existing = metadata.find ((meta) => meta.type.name === selectedDatatype[index].name);
            if (selectedOption[index]) {
                const m = {
                    metadataId: metadataItemKey[index],
                    new: existing ? false : true,
                    type: selectedDatatype[index],
                    value: selected,
                }
                allMetadataToSubmit.push(m);
            } else {
                const m = {
                    metadataId: metadataItemKey[index],
                    new: existing ? false : true,
                    type: selectedDatatype[index],
                    value: selectedMetadataValue[index],
                }
                allMetadataToSubmit.push(m);
            }
        });

        if (error) 
            return;

        let allValid = true;
        let mapPromises = [];
        allMetadataToSubmit.map ((m, index) => {
            mapPromises.push(postJsonAsync("api/util/ismetadatavalid", m));
        });

        const validity = await Promise.all (mapPromises);

        const nextValidMetadata = [];
        const nextValidationMessage = [];
        validity.map ((data, index) => {
            if (data.data && data.data.data) {
                // valid
                nextValidMetadata.push (false);
                nextValidationMessage.push (null);
            } else {
                allValid = false;
                nextValidMetadata.push (true);
                nextValidationMessage.push (data.data.message);
            }
        });

        setValidMetadata (nextValidMetadata);
        setValidationMessage (nextValidationMessage);

        if (allValid) {
            setTextAlertInputMetadata({"show": false, id: ""});

            /*const updated = [...metadata, ...allMetadataToSubmit];
            setUserSelection ({"metadata": updated});
            setEnableAddMetadata(false);*/
            
            // get the canonical form
            postJson ("api/util/getallcanonicalforms", allMetadataToSubmit,
                getAuthorizationHeader()).then ((data) => {
            if (data.data && data.data.data) {
                const updated = data.data.data;
                setUserSelection ({"metadata": updated});
                setEnableAddMetadata(false);
            }
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setTextAlertInputMetadata ({"show": true, "message": error.response.data.message });
                } else {
                    axiosError(error, null, setAlertDialogInput);
                }  
            });
        }

        setShowLoading (false);
        setIsDirty(true);
    }

    const setGlycoproteomicsMandatoryMetadata = () => {
        setTextAlertInputMetadata({"show": false, message: ""});
        let added = [];
        let addedValues = [];
        let addedKeys = [];
        let multiples = [];
        //let notAdded = [];
        categories.map ((category, index) => {
            if (category.categoryId === 2) {   // GlyGen Glycoproteomics Data
                if (category.dataTypes) {
                    category.dataTypes.map ((d, index) => {
                        if (!d.multiple && userSelection.metadata) {
                            // check if it already exists
                            const existing = userSelection.metadata.filter ((meta) => 
                                meta.type.name === d.name);
                            if (!existing || existing.length == 0) {
                                var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                addedValues.splice (idx, 0, "");
                                addedKeys.splice (idx, 0, null);
                            }
                            else {
                                existing.map ((ex, i) => {
                                    var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                    added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                    addedValues.splice (idx, 0, ex.value);
                                    if (ex.type.name === "Contributor") {
                                        parseContributor (ex.value);
                                        setContributor (ex.value);
                                    }
                                    addedKeys.splice (idx, 0, ex.id);
                                })
                                
                            }
                        } else {
                            multiples.push (d);
                            if (userSelection.metadata) {
                                // check if it already exists
                                const existing = userSelection.metadata.filter ((meta) => 
                                    meta.type.name === d.name);
                                if (existing && existing.length > 0) {
                                    existing.map ((ex, i) => {
                                        var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                        added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                        addedValues.splice (idx, 0, ex.value);
                                        if (ex.type.name === "Contributor") {
                                            parseContributor (ex.value);
                                            setContributor (ex.value);
                                        }
                                        addedKeys.splice (idx, 0, ex.id);
                                    });
                                } else {
                                    var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                    added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                    addedValues.splice (idx, 0, "");
                                    addedKeys.splice (idx, 0, null);
                                }
                            } else {
                                var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                addedValues.splice (idx, 0, "");
                                addedKeys.splice (idx, 0, null);
                            }
                        }
                    });
                }
            }
        });

        //if (notAdded.length > 0)
        //    setTextAlertInputMetadata({"show" : true, message: "The following metadata are not added to the list since they already exist: " + notAdded + ". If you'd like to override, please delete them first!"})
        
        handleMetadataSelectionChange(added, addedValues, 2, addedKeys);
        setSelectedMetadataItems(added);
        setSelectedMetadataValue(addedValues);
        setAvailableMetadata(multiples);
        if (multiples.length > 0) {
            setAvailableMetadataSelected(200+ multiples[0].datatypeId);
        }
    }

    const setGlygenMandatoryMetadata = () => {
        setTextAlertInputMetadata({"show": false, message: ""});
        let added = [];
        let addedValues = [];
        let addedKeys = [];
        let multiples = [];
        //let notAdded = [];
        categories.map ((category, index) => {
            if (category.categoryId === 1) {   // GlyGen Glycomics Data
                if (category.dataTypes) {
                    category.dataTypes.map ((d, i) => {
                        if (!d.multiple && userSelection.metadata) {
                            // check if it already exists
                            const existing = userSelection.metadata.filter ((meta) => 
                                meta.type.name === d.name);
                            if (!existing || existing.length == 0) {
                                var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                addedValues.splice (idx, 0, "");
                                addedKeys.splice (idx, 0, null);
                            }
                            else {
                                existing.map ((ex, i) => {
                                    var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                    added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                    addedValues.splice (idx, 0, ex.value);
                                    if (ex.type.name === "Contributor") {
                                        parseContributor (ex.value);
                                        setContributor (ex.value);
                                    }
                                    addedKeys.splice (idx, 0, ex.metadataId);
                                    //notAdded.push (d.name);
                            });
                            }
                        } else {
                            multiples.push(d);
                            if (userSelection.metadata) {
                                // check if it already exists
                                const existing = userSelection.metadata.filter ((meta) => 
                                    meta.type.name === d.name);
                                if (existing && existing.length > 0) {
                                    existing.map ((ex, i) => {
                                        var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                        added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                        addedValues.splice (idx, 0, ex.value);
                                        if (ex.type.name === "Contributor") {
                                            parseContributor (ex.value);
                                            setContributor (ex.value);
                                        }
                                        addedKeys.splice (idx, 0, ex.metadataId);
                                    });
                                } else {
                                    var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                    added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                    addedValues.splice (idx, 0, "");
                                    addedKeys.splice (idx, 0, null);
                                }
                            } else {
                                var idx = findSortedIndex (added, category.categoryId * 100 + d.datatypeId);
                                added.splice(idx, 0, category.categoryId * 100 + d.datatypeId);
                                addedValues.splice (idx, 0, "");
                                addedKeys.splice (idx, 0, null);
                            }   
                        }
                    });
                }
            }
        });

        //if (notAdded.length > 0)
        //    setTextAlertInputMetadata({"show" : true, message: "The following metadata are not added to the list since they already exist: " + notAdded + ". If you'd like to override, please delete them first!"})
        handleMetadataSelectionChange(added, addedValues, 1, addedKeys);
        setSelectedMetadataItems(added);
        setSelectedMetadataValue(addedValues);
        setAvailableMetadata(multiples);
        if (multiples.length > 0) {
            setAvailableMetadataSelected(100+ multiples[0].datatypeId);
        }
    }

    const updateAvailableMetadata = (remaining) => {
        let categoryId = 1;
        if (selectedMetadataItems && selectedMetadataItems[0] && selectedMetadataItems[0] > 200) {
            categoryId = 2;
        } 

        let available = [];

        categories.map ((category, index) => {
            if (category.categoryId === categoryId) {   
                if (category.dataTypes) {
                    category.dataTypes.map ((d, i) => {
                        if (d.multiple) {
                            available.push(d);
                        } else {
                            const exists = remaining.find ((item) => item === category.categoryId * 100 + d.datatypeId);
                            if (!exists) {
                                available.push(d);
                            }
                        }
                    })
                }
            }
        });
        setAvailableMetadata (available);
        if (available.length > 0) {
            setAvailableMetadataSelected(categoryId * 100 + available[0].datatypeId);
        }
    }

    const compare = (first, second, firstMandatory, secondMandatory) => {
        if (firstMandatory < secondMandatory) {
            return 1;
        } 
        if (secondMandatory < firstMandatory) {
            return -1;
        }

        if (first && first.toLowerCase() > second.toLowerCase())
            return 1;
        else
            return -1;
    }

    const findSortedIndex  = (list, datatype) => {
        var first;
        var firstMandatory;
        
        if (typeof datatype === 'number') {  // datatype selected
            let itemId = datatype;
            if (itemId > 200) {
                itemId -= 200;
            } else if (itemId > 100) {
                itemId -= 100;
            }
            first = getDatatypeName(itemId);
            firstMandatory = isMandatory(itemId);
        }

        let low = 0;
        let high = list.length;
        while (low < high) {
            const mid = Math.floor ((low+high) /2);
            var d = list[mid];
            var second;
            var secondMandatory;
            if (typeof d === 'number') {  // datatype selected
                let itemId = d;
                if (itemId > 200) {
                    itemId -= 200;
                } else if (itemId > 100) {
                    itemId -= 100;
                }
                second = getDatatypeName(itemId);
                secondMandatory = isMandatory(itemId);
                const compResult = compare (first, second, firstMandatory, secondMandatory);
                if (compResult < 0) {
                    high = mid;
                } else {
                    low = mid +1;
                }
            }
        }
        return low;
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
        if (tag) url += "&tag=" + tag;
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
        <FeedbackWidget setAlertDialogInput={setTextAlertInput}/>
        <Container maxWidth="xl">
            <div className="page-container">
            <div className="scroll-to-top-save">
        {isVisible && (
            <div>
                <Button variant="contained" className="gg-btn-blue-sm" 
                    disabled={error} onClick={handleSubmit}>
                    Submit
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

            {enableAddMetadata && (
                <Dialog
                    maxWidth="xl"
                    fullWidth="true"
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    scroll="paper"
                    centered
                    open={enableAddMetadata}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setEnableAddMetadata(false)
                    }}
                >
                    <DialogTitle id="parent-modal-title">
                        <Typography id="parent-modal-title" variant="h6" component="h2">
                        Add Metadata
                        </Typography>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => setEnableAddMetadata(false)}
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
                        {addMetadataForm()}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        {getNavigationButtons()}
                        {/**activeStep < steps.length - 1 && (
                        <div style={{paddingRight: '3%', paddingLeft: '3%'}}></div>
                        )}
                        {activeStep >= steps.length - 1 && (
                        <div style={{paddingRight: '8%', paddingLeft: '8%'}}></div>
                        )**/}
                        <Button className="gg-btn-outline-reg"
                            onClick={()=> {
                                setActiveStep(0);
                                setEnableAddMetadata(false);
                            }}>Cancel</Button>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=>handleAddMetadata()}>Add</Button>
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
                    Submit
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
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> {
                            setTextAlertInputMetadata({"show": false, "message":""});
                            setMetadataItemKey([]);
                            setSelectedMetadataValue([]);
                            setSelectedMetadataItems([]);
                            setNamespace([]);
                            setSelectedDatatype([]);
                            setOptions([]);
                            setValidMetadata([]);
                            setSelectedOption([]);
                            setValidationMessage([]);
                            setActiveStep(0);
                            setGlygen(false);
                            setEnableAddMetadata(true);
                         }
                        }>
                         Add Metadata
                        </Button>
                        {collectionType &&
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> {
                            setTextAlertInputMetadata({"show": false, "message":""});
                            setOptions([]);
                            setMetadataItemKey([]);
                            setSelectedMetadataValue([]);
                            collectionType === "GLYCAN" ? setGlygenMandatoryMetadata() : setGlycoproteomicsMandatoryMetadata();
                            setGlygen(true);
                            setActiveStep(1);
                            setEnableAddMetadata(true);
                         }
                        }>
                         Add GlyGen Metadata
                        </Button> }
                        </div>
                    </Col>
                    </Row>
                
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "metadataId"
                    data = {userSelection.metadata}
                    columns={metadatacolumns}
                    enableRowActions={true}
                    delete={deleteMetadataFromTable}
                    setAlertDialogInput={setAlertDialogInput}
                    columnsettingsws="api/setting/getcolumnsettings?tablename=METADATA"
                    columnVisibility={{"description" : false}}
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