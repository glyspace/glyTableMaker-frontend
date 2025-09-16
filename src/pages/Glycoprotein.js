import { useEffect, useMemo, useReducer, useState } from "react";
import FeedbackWidget from "../components/FeedbackWidget";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import Table from "../components/Table";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { AddCircleOutline, CoPresent, SignalCellularNullOutlined } from "@mui/icons-material";
import GlycanTypeTable from "../components/GlycanTypeTable";
import { ScrollToTop } from "../components/ScrollToTop";
import typeList from '../data/glycosylationTypes.json';
import ExampleSequenceControl from "../components/ExampleSequenceControl";
import TooltipExample from "../data/examples";
import HelpTooltip from '../components/HelpTooltip';

let newId = 1000;

const examples = TooltipExample.glycoprotein;
const Glycoprotein = (props) => {
    const [searchParams] = useSearchParams();
    let glycoproteinId = searchParams.get("glycoproteinId");

    const navigate = useNavigate();
    const [validate, setValidate] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [showAddSite, setShowAddSite] = useState(false);
    const [showEditSite, setShowEditSite] = useState(false);
    const [showPosition, setShowPosition] = useState(true);
    const [showGlycanSelection, setShowGlycanSelection] = useState(false);
    const [showStartEnd, setShowStartEnd] = useState(false);
    const [showAlternatives, setShowAlternatives] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertSiteInput, setTextAlertSiteInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const glycosylationTypes = [""].concat (typeList);
    const [subtypes, setSubtypes] = useState([""].concat (typeList.map(type => type.subtype).flat()));

    const [gType, setGType] = useState(null);
    const [gsType, setGsType] = useState (null);

    const[start, setStart] = useState(null);
    const[end, setEnd] = useState(null);

    const [requiredVersion, setRequiredVersion] = useState("");

    const initialState = {
        uniprotId: "",
        sequence: "",
        sequenceVersion: "",
        proteinName: "",
        name: "",
        geneSymbol: "",
        sites : [],
    };

    const siteState = {
        siteId: null,
        type: "EXPLICIT",
        new: null,
        glycosylationSubType: "",
        glycosylationType: "",
        glycans: [],
        positions: [{"location" : -1, "aminoAcid": ""}],
    }

    const aminoacidMap = {
        "A" : "Ala",
        "R" : "Arg",
        "N" : "Asn",
        "D" : "Asp",
        "C" : "Cys",
        "Q" : "Gln",
        "E" : "Glu",
        "G" : "Gly",
        "H" : "His",
        "I" : "Ile",
        "L" : "Leu",
        "K" : "Lys",
        "M" : "Met",
        "F" : "Phe",
        "P" : "Pro",
        "S" : "Ser",
        "T" : "Thr",
        "W" : "Trp",
        "Y" : "Tyr",
        "V" : "Val",
        "B" : "Asx",
        "Z" : "Glx",
    }

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);
    const [siteSelection, setSiteSelection] = useReducer(reducer, siteState);
    const [selectedGlycans, setSelectedGlycans] = useState([]);

    useEffect(() => {
        if (glycoproteinId) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [glycoproteinId]);

    const fetchData = async () => {
            setShowLoading(true);
            getJson ("api/data/getglycoprotein/" + glycoproteinId, getAuthorizationHeader())
                .then ((json) => {
                    setUserSelection (json.data.data);
                    // set the sites properly
                    let sites = [];
                    json.data.data.sites && json.data.data.sites.forEach ((site) => {
                        sites.push ({
                            "siteId" : site.siteId,
                            "type": site.type,
                            "glycosylationType" : site.glycosylationType,
                            "glycosylationSubType" : site.glycosylationSubType,
                            "positions" : site.position ? site.position.positionList ? site.position.positionList : [] : [],
                            "glycans" : site.glycans,
                        });
                    });
                    setUserSelection ({"sites" : sites});
                    setShowLoading(false);
            }).catch (function(error) {
                if (error && error.response && error.response.data) {
                    setShowLoading(false);
                    setTextAlertInput ({"show": true, "message": error.response.data["message"]});
                } else {
                    setShowLoading(false);
                    axiosError(error, null, setAlertDialogInput);
                }
            });
        }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'type', 
            header: 'Type',
            size: 50,
          },
          {
            accessorKey: 'positions',
            header: 'Position',
            size: 100,
            Cell: ({ cell }) => (
                <>
                {cell.getValue() && cell.getValue().length === 1 &&
                    <span>{cell.getValue()[0].location}</span>}
                {cell.row.original.type === "RANGE" && 
                    cell.getValue() && cell.getValue().length > 1 &&
                    <span>{`${cell.getValue()[0].location} - ${cell.getValue()[1].location}`}</span>
                }
                {cell.row.original.type === "ALTERNATIVE" && 
                    cell.getValue() && cell.getValue().length > 1 &&
                    cell.getValue().map ((pos, index) => {
                    return <span>
                    {index !== cell.getValue().length - 1 &&
                        `${pos.location} | `
                    } 
                    {index === cell.getValue().length - 1 &&
                        `${pos.location}`
                    }
                    </span>
                })}
              </>
            ),
          },
          {
            accessorKey: 'glycans', 
            header: 'Glycan',
            Cell: ({ cell }) => (
                <>
                <ul style={{listStyleType: "none"}}>
                {cell.getValue() && cell.getValue().length > 0 &&
                    cell.getValue().map ((glycan, index) => {
                    return <li><img src={"data:image/png;base64, " + glycan.glycan.cartoon} alt="cartoon" /></li>
                    })
                }
                </ul>
                </>
            ),
          },
        ],
        [],
    );

    const glycanColumns = useMemo(
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
        window.addEventListener("scroll", toggleSaveVisibility);
    }, []);

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "uniprotId" && newValue.trim().length > 1) {
            setValidate(false);
        }

        setUserSelection({ [name]: newValue });
    };

    const funcSetInputValues = (val) => {
        setUserSelection ({ ["uniprotId"]: val});
    }

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        
        if (userSelection.uniprotId === "" || userSelection.uniprotId.trim().length < 1) {
            setValidate(true);
            return;
        }

        // re-organize the sites
        const sites = [];
        userSelection.sites.forEach ((site) => {
            const positionList = site.positions;
            sites.push ({
                "siteId" : site.new ? null : site.siteId,
                "type": site.type,
                "glycosylationType" : site.glycosylationType,
                "glycosylationSubType" : site.glycosylationSubType,
                "position" : { "positionList" : positionList},
                "glycans" : site.glycans,
            });
        })
       
        // add the glycoprotein
        const glycoprotein = {
            "id": glycoproteinId ?? null,
            "name": userSelection.name,
            "proteinName": userSelection.proteinName,
            "sequence" : userSelection.sequence,
            "sequenceVersion" : userSelection.sequenceVersion,
            "geneSymbol" : userSelection.geneSymbol,
            "uniprotId": userSelection.uniprotId,
            "sites" : sites,
        }

        setShowLoading(true);
        let apiURL = glycoproteinId ? "api/data/updateglycoprotein" : "api/data/addglycoprotein";
        postJson (apiURL, glycoprotein, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/glycoproteins");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );

        e.preventDefault();
    };

    const getProteinFromUniProt = (uniprotId) => {
        let url = "api/util/getproteinfromuniprot/" + uniprotId;
        if (requiredVersion && requiredVersion.length > 0 && Number.isInteger(Number(requiredVersion))) {
            url += "?version="+ requiredVersion;
        }
        getJson (url).then ((data) => {
            setUserSelection(data.data.data);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setTextAlertInput ({"show": true, "message": error.response.data.message });
            } else {
                axiosError(error, null, setAlertDialogInput);
            }  
        });
    }

    const deleteFromTable = (id) => {
        var sites = userSelection.sites;
        const index = sites.findIndex ((item) => item["siteId"] === id);
        var updated = [
            ...sites.slice(0, index),
            ...sites.slice(index + 1)
        ];
        setUserSelection ({"sites": updated});
        setSiteSelection ({ "siteId": null, "new": null, "type": "EXPLICIT", "glycans": [], "glycosylationType" : "", "glycosylationSubType": "",
            "positions": [{"location" : -1, "aminoAcid": ""}]});
        setStart(null);
        setEnd(null);
    }

    const deleteFromGlycanTable = (id) => {
        var glycans = siteSelection.glycans;
        const index = glycans.findIndex ((item) => item["glycanId"] === id);
        var updated = [
            ...glycans.slice(0, index),
            ...glycans.slice(index + 1)
        ];
        setSiteSelection ({"glycans": updated});
    }

    const editSite = (site) => {
        setSiteSelection(site);
        site.positions.map ((position, index) => {
            if (index == 0) {
                setStart(position.location);
            }
            if (index == 1) {
                setEnd(position.location);
            }
        });
        setShowEditSite(true);
    }

    const handleAddSite = () => {
        setTextAlertSiteInput ({"show": false, "id": "", "message": ""});
        var sites = [...userSelection.sites];

        if (!showPosition) { // glycan is required
            if (siteSelection.glycans === null || siteSelection.glycans.length === 0) {
                setTextAlertSiteInput ({"show": true, "message": "At least one glycan must be added to the site!"});
                return;
            }
        }
        if (showPosition) {
            let error = true;
            if (!showStartEnd && !showAlternatives) {
                siteSelection.positions.forEach ((pos) => {
                    if (pos.location > 0) error = false;
                });
                if (error) {
                    setTextAlertSiteInput ({"show": true, "message": "At least one position must be specified!"});
                    return;
                }
            } else {
                // at least two positions must be specified
                if (siteSelection.positions.length < 2) {
                    setTextAlertSiteInput ({"show": true, "message": "At least two positions must be specified!"});
                    return;
                }
                if (siteSelection.positions[0].location < 0 || siteSelection.positions[1].location < 0) {
                    setTextAlertSiteInput ({"show": true, "message": "At least two positions must be specified!"});
                    return;
                }
            }
        }

        if (!siteSelection.siteId) {
            // new site
            siteSelection.siteId = newId++;
            siteSelection.new = true;
            sites.push (siteSelection);   
        } else {
            // update existing
            const index = sites.findIndex ((item) => item["siteId"] === siteSelection.siteId);
            if (index !== -1) {
                sites[index].positions = siteSelection.positions;
                sites[index].new = false;
                sites[index].glycans = siteSelection.glycans;
                sites[index].glycosylationSubType = siteSelection.glycosylationSubType;
                sites[index].type = siteSelection.type;
                sites[index].glycosylationType = siteSelection.glycosylationType;
            }
        }
        setUserSelection ({"sites": sites});
        setSiteSelection ({ "siteId": null, "new": null, "type": "EXPLICIT", "glycans": [], "glycosylationType" : "", "glycosylationSubType": "",
            "positions": [{"location" : -1, "aminoAcid": ""}]});
        setStart(null);
        setEnd(null);
        setShowAddSite(false);
        setShowEditSite(false);
    }

    const handleTypeChange = e => {
        setTextAlertSiteInput ({"show": false, "id": "", "message": ""});
        const selected = e.target.options[e.target.selectedIndex].value;
        setSiteSelection ({"type" : selected});
        setShowPosition(selected !== "UNKNOWN");
        setShowStartEnd(selected === "RANGE");
        if (selected === "RANGE" || selected === "ALTERNATIVE") {
            const positions = [...siteSelection.positions];
            positions.forEach ((pos) => pos.aminoAcid = "");
            if (positions.length < 2) {
                positions.push ({
                    "location": -1,
                    "aminoAcid": "",
                });
            }
            setSiteSelection ({"positions" : positions});
        } else {
            setSiteSelection ({"positions" : [{"location" : -1, "aminoAcid": ""}]});
        }
        setShowAlternatives (selected === "ALTERNATIVE");
        setStart(null);
        setEnd(null);
    };

    const handleGlycosylationTypeChange = e => {
        setTextAlertSiteInput ({"show": false, "id": "", "message": ""});
        const name = e.target.name;
        const selected = e.target.options[e.target.selectedIndex].value;
        setSiteSelection({[name] : selected});
        if (name === "glycosylationType") {
            var types = typeList.filter(type => type.name === e.target.value).map(type => type.subtype).flat();
            types = [""].concat(types);
            setSubtypes(types);
            setGType (selected);
        } else {
            setGsType(selected);
        }
    }

    const handlePositionChange = (e, index, minValue) => {
        setTextAlertSiteInput ({"show": false, "id": "", "message": ""});
        setValidate(false);
        const val = e.target.value;
        const positions = [...siteSelection.positions];
        if (positions[index]) {
            try {
                const num = Number.parseInt(val);
                if (Number.isNaN(num)) {
                    throw new Error("Invalid number format");
                }
                if (num < 0 || num > userSelection.sequence.length)
                    throw new Error("Invalid number range");
                if (minValue && num < minValue) {
                    throw new Error("Invalid number range");
                }
                positions[index].location = num;
                positions[index].aminoAcid = getAminoAcidFromSequence(positions[index].location);
                if (index == 0) setStart(num);
                if (index == 1) setEnd(num);
            } catch (error) {
                setValidate(true);
                if (index == 0) setStart(null);
                if (index == 1) setEnd(null);
                return null;
            }
        }
       
        setSiteSelection ("positions", positions);   
    }

    const getAminoAcidFromSequence = (location) => {
        if (userSelection.sequence && userSelection.sequence.length >= location) {
            const amino = aminoacidMap [userSelection.sequence.charAt(location-1)];
            if (amino) return amino;
            else return "Invalid";
        } else {
            return "Invalid";
        }
    }

    const handleAddPosition = () => {
        const positions = [...siteSelection.positions];
        positions.push ({
            "location": -1,
            "aminoAcid": "",
        });
        setSiteSelection ({"positions" : positions});
    }

    const handleDeletePosition = (index) => {
        var positions = siteSelection.positions;
        var updated = [
            ...positions.slice(0, index),
            ...positions.slice(index + 1)
        ];
        setSiteSelection ({"positions": updated});
    }

    const findGlycosylationType = () => {
        let gType = "N-linked";
        if (siteSelection.positions) {
            siteSelection.positions.map ((pos, index) => {
                if (pos.aminoAcid && (pos.aminoAcid === "Ser" || pos.aminoAcid === "Thr")) {
                    gType = "O-linked";
                }
            })
        }
        return gType;
    }

    const handleGlycanSelectionChange = (selected) => {
        setTextAlertSiteInput ({"show": false, "id": "", "message": ""});
        // append new selections
        const previous = [...siteSelection.glycans];
        selected.forEach ((glycan) => {
            const found = siteSelection.glycans.find ((item) => item.glycan.glycanId === glycan.glycanId);
            if (!found) {
                const gType = findGlycosylationType();
                previous.push ({"glycan" : glycan, "type": "Glycan", "glycosylationType" : gType,
                    "glycosylationSubType": "",
                });
            }
        })
        setSelectedGlycans(previous);
    }

    const handleGlycanTypeChange = (data) => {
        console.log("site selection: " + siteSelection.glycans);
        console.log("selected glycans" + selectedGlycans);
       /* const glycans = [...siteSelection.glycans];
        glycans.forEach ((entry) => {
            if (entry.glycan.glycanId === glycanId) {
                entry[field] = value;
            }
        });

        setSiteSelection({"glycans": glycans});*/
    }

    const handleGlycanSelect = () => {
        console.log("selected glycans" + selectedGlycans);
        setTextAlertInput({"show": false, id: ""});
        const selected=[];
        selectedGlycans.forEach ((glycan) => {
            if (!glycan.glycan.glytoucanID || glycan.glycan.glytoucanID.length === 0) {
                // error, not allowed to select this for the collection
                setTextAlertInput ({"show": true, 
                    "message": "You are not allowed to add glycans that are not registered to GlyTouCan to the collection. You may need to wait for the registration to be completed or resolve errors if there are any! Glycan " + glycan.glycanId + " is not added."
                });
                ScrollToTop();
            } else {
                selected.push (glycan);
            }
        });

        setSiteSelection({"glycans": selected});
        setShowGlycanSelection(false);
    }

    const handleClose = (event, reason) => {
        if (reason && reason === "backdropClick")
            return;
        setTextAlertInput({"show": false, id: ""});
        setShowGlycanSelection(false);
    };

    const addSiteForm = () => {
        return (
            <>
            <TextAlert alertInput={textAlertSiteInput}/>
            <Row style={{marginBottom: "10px"}}>
                <Col xs={2} lg={2}>
                    <FormLabel label="Type" className="required-asterik"/>
                </Col>
                <Col xs={4} lg={4}>
                    <Form.Select
                    name={"siteType"}
                    value={siteSelection.type}
                    onChange={handleTypeChange}
                    >
                    <option value="EXPLICIT">Explicit</option>
                    <option value="RANGE">Range</option>
                    <option value="ALTERNATIVE">Alternative</option>
                    <option value="UNKNOWN">Unknown</option>
                    </Form.Select>
                </Col>
                <Col xs={6} lg={6}></Col>
              </Row>  
              {!showStartEnd && showPosition && 
              siteSelection.positions.map ((pos, index) => {
                return (
                    <Row style={{marginBottom: "10px"}}>
                        <Col xs={2} lg={2}>
                            <FormLabel label="Position" className="required-asterik"/>
                        </Col>
                        <Col xs={4} lg={4}>
                            <Form.Control
                            type="text"
                            name={"position"}
                            placeholder="Enter the position"
                            value={start}
                            onChange={(e)=> handlePositionChange(e, index)}
                            isInvalid={validate}
                            />
                            <Feedback message="Position should be a valid number within the range" />
                        </Col>
                        <Col xs={2} lg={2}>
                            <FormLabel label="Amino Acid"/>
                        </Col>
                        <Col xs={2} lg={2}>
                        <Form.Control
                            type="text"
                            name={"aminoacid"}
                            value={siteSelection.positions[index].aminoAcid}
                            disabled
                            >
                            </Form.Control>
                        </Col>
                        <Col xs={2} lg={2}>
                        {showAlternatives && index > 1 &&
                        <Tooltip title="Remove this position">
                        <IconButton color="error" onClick={(event) => {handleDeletePosition(index)}}>
                        <DeleteIcon />
                        </IconButton>
                         </Tooltip>}
                        {showAlternatives && index === siteSelection.positions.length-1 && 
                        <Tooltip title="Add another position">
                        <IconButton color="primary" onClick={handleAddPosition}>
                          <AddCircleOutline />
                        </IconButton></Tooltip>
                        }</Col>
                    </Row>
                );
                })
              }
              {showStartEnd && 
              <>
              <Row style={{marginBottom: "10px"}}>
              <Col xs={2} lg={2}>
                  <FormLabel label="Start Position" className="required-asterik"/>
              </Col>
              <Col xs={4} lg={4}>
                  <Form.Control
                  type="text"
                  name={"position"}
                  placeholder="Enter the position"
                  value={start}
                  onChange={(e)=>handlePositionChange(e, 0)}
                  isInvalid={validate}
                  />
                  <Feedback message="Position should be a valid number within the range" />
              </Col>
              <Col xs={4} lg={4}>
              <Form.Control
                  type="text"
                  name={"aminoacid"}
                  value={siteSelection.positions[0].aminoAcid}
                  disabled
                  >
                  </Form.Control>
              </Col>
              <Col xs={2} lg={2}></Col>
                </Row>
                <Row style={{marginBottom: "10px"}}>
                <Col xs={2} lg={2}>
                    <FormLabel label="End Position" className="required-asterik"/>
                </Col>
                <Col xs={4} lg={4}>
                    <Form.Control
                    type="text"
                    name={"position"}
                    value={end}
                    placeholder="Enter the position"
                    onChange={(e)=>handlePositionChange(e, 1, siteSelection.positions[0].location)}
                    isInvalid={validate}
                    />
                    <Feedback message="Position should be a valid number within the range" />
                </Col>
                <Col xs={4} lg={4}>
                <Form.Control
                    type="text"
                    name={"aminoacid"}
                    value={siteSelection.positions[1].aminoAcid}
                    disabled
                    >
                    </Form.Control>
                </Col>
                <Col xs={2} lg={2}></Col>
                </Row>
                </>
              } 

              <Row>
              <Col xs={2} lg={2}>
                {!showPosition &&
                <FormLabel label="Glycans" className="required-asterik"/> }
                {showPosition && 
                <FormLabel label="Glycans"/>}
                </Col>
                <Col xs={2} lg={2}>
                <FormLabel label="Glycosylation Type"/>
                </Col>
                <Col>
                <FormLabel label="Glycosylation Subtype"/>
                </Col>
                </Row>
                <Row>
                    <Col xs={2} lg={2}>
                    </Col>
                    <Col xs={2} lg={2}>
                    <Form.Select
                        name={"glycosylationType"}
                        value={siteSelection.glycosylationType}
                        onChange={handleGlycosylationTypeChange}>
                         {glycosylationTypes && glycosylationTypes.map((n , index) =>
                            <option
                            key={index}
                            value={n.name}>
                            {n.name}
                            </option>
                        )}
                    </Form.Select>
                    </Col>
                    <Col xs={2} lg={2}>
                    <Form.Select
                        name={"glycosylationSubType"}
                        value={siteSelection.glycosylationSubType}
                        onChange={handleGlycosylationTypeChange}>
                        {subtypes && subtypes.map((n , index) =>
                            <option
                            key={index}
                            value={n}>
                            {n}
                            </option>
                        )}
                    </Form.Select>
                    </Col>
                </Row>
                <div style={{"textAlign": "right", "marginTop" : "10px", "marginBottom" : "10px"}}>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    onClick={()=> setShowGlycanSelection(true)}>
                         Add Glycan(s)
                </Button>
                </div>
                <GlycanTypeTable 
                    rowId="glycanId"
                    data={siteSelection.glycans} 
                    handleGlycanTypeChange={handleGlycanTypeChange}
                    delete={deleteFromGlycanTable}
                    enableRowActions={true}
                    glycosylationType={gType}
                    glycosylationSubType={gsType}
                />
              

              {showGlycanSelection && (
                <Dialog
                    maxWidth="lg"
                    fullWidth="true"
                    open={showGlycanSelection}
                    onClose={handleClose}
                    aria-labelledby="child-modal-title"
                    aria-describedby="child-modal-description"
                    >
                    <DialogTitle>Select Glycan(s)</DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                        >
                    <CloseIcon />
                    </IconButton>
                    <TextAlert alertInput={textAlertInput}/>
                    <DialogContent dividers>{
                        <Table
                        authCheckAgent={props.authCheckAgent}
                        ws="api/data/getglycans"
                        columns={glycanColumns}
                        columnFilters={[{"id":"glytoucanID","value":"G"}]}
                        enableRowActions={false}
                        setAlertDialogInput={setAlertDialogInput}
                        initialSortColumn="dateCreated"
                        rowSelection={true}
                        rowSelectionChange={handleGlycanSelectionChange}
                        rowId="glycanId"
                    />}</DialogContent>
                    <DialogActions>
                    <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycanSelection(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                    </DialogActions>
                </Dialog>
            )}
            </>
        )
    }

    return (
        <>
        <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
        <Container maxWidth="xl">
            <div className="page-container">
            <div className="scroll-to-top-save">
        {isVisible && (
            <div>
                <Button variant="contained" className="gg-btn-blue-sm" 
                    onClick={handleSubmit}>
                    Submit
                </Button>
            </div>
        )}
        </div>
             <PageHeading title={glycoproteinId ? "Edit Glycoprotein" : "Add Glycoprotein"} subTitle="Please provide the information for the new glycoprotein." />
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
                {(showAddSite || showEditSite) && (
                <Dialog
                    maxWidth="xl"
                    fullWidth="true"
                    aria-labelledby="parent-modal-title"
                    aria-describedby="parent-modal-description"
                    scroll="paper"
                    centered
                    open={(showAddSite || showEditSite)}
                    onClose={(event, reason) => {
                        if (reason && reason === "backdropClick")
                            return;
                        setShowAddSite(false);
                        setShowEditSite(false);
                    }}
                >
                    <DialogTitle id="parent-modal-title">
                        <Typography id="parent-modal-title" variant="h6" component="h2">
                        Add Site
                        </Typography>
                    </DialogTitle>
                    <IconButton
                        aria-label="close"
                        onClick={() => {
                            setShowAddSite(false); 
                            setShowEditSite(false);
                        }}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                        >
                    <CloseIcon />
                    </IconButton>
                    <DialogContent dividers>
                        <Typography id="parent-modal-description" sx={{ mt: 2 }}>
                        {addSiteForm()}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        
                        <Button className="gg-btn-outline-reg"
                            onClick={()=> {
                                setShowAddSite(false);
                                setShowEditSite(false);
                            }}>Cancel</Button>
                        <Button className="gg-btn-blue-reg"
                            onClick={()=>handleAddSite()}>Submit</Button>
                    </DialogActions>   
                </Dialog>)}
                    <Form>
                        <Form.Group
                        as={Row}
                        controlId="uniprotId"
                        className="gg-align-center mb-3"
                        >
                        <Col xs={12} lg={9}>
                            <FormLabel label="UniProtKB Accession" className="required-asterik"/>
                            <HelpTooltip
                                title={examples.uniprotId.tooltip.title}
                                text={examples.uniprotId.tooltip.text}
                            />
                            <Form.Control
                                type="text"
                                name="uniprotId"
                                placeholder="Enter UniProtKB Accession for the protein"
                                value={userSelection.uniprotId}
                                onChange={handleChange}
                                minLength={6}
                                maxLength={15}
                                required={true}
                                isInvalid={validate}
                                disabled={glycoproteinId !== null}
                            />
                            <ExampleSequenceControl setInputValue={funcSetInputValues} inputValue={examples.uniprotId.examples} explore={true} />
                            <Feedback message="Please enter a valid UniProtKB Accession" />
                            {!glycoproteinId && 
                                <>
                                <div className="mb-1 mt-2">
                                <FormLabel label="Sequence Version"/>
                                <Form.Control
                                    type="text"
                                    name="version"
                                    placeholder="Enter the required sequence version. If not provided, the latest version will be retrieved"
                                    value={requiredVersion}
                                    onChange={(e) => {
                                        setRequiredVersion (e.target.value)
                                    }}
                                    isInvalid={requiredVersion && !Number.isInteger(Number(requiredVersion))}
                                    disabled={glycoproteinId !== null}
                                />
                                <Feedback message="Version must be a number" />
                                </div>
                                </>
                            }
                            {!glycoproteinId && userSelection.uniprotId !== "" && userSelection.uniprotId.length > 5 && (
                            <Button
                                variant="contained"
                                onClick={() => getProteinFromUniProt(userSelection.uniprotId)}
                                className="gg-btn-blue-reg btn-to-lower mt-3"
                            >
                                Retrieve Protein Information from UniProtKB
                            </Button>
                            )}
                            </Col>
                        </Form.Group>
                        <Form.Group
                            as={Row}
                            controlId="name"
                            className="gg-align-center mb-3"
                            >
                            <Col xs={12} lg={9}>
                                <FormLabel label="Name"/>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    placeholder="Enter a name for glycoprotein"
                                    value={userSelection.name}
                                    onChange={handleChange}
                                />    
                            </Col>
                        </Form.Group>
                        {userSelection.proteinName &&
                        <>
                        <Form.Group as={Row} controlId="proteinName" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Protein Name" />
                            <Form.Control type="text" name="proteinName" value={userSelection.proteinName} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="sequence" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Sequence" />
                            <Form.Control as="textarea" rows="5" name="sequence" value={userSelection.sequence} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="sequenceVersion" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Sequence Version" />
                            <Form.Control type="text" name="sequenceVersion" value={userSelection.sequenceVersion} disabled />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} controlId="gene" className="gg-align-center mb-3">
                            <Col xs={12} lg={9}>
                            <FormLabel label="Gene Symbol" />
                            <Form.Control type="text" name="gene" value={userSelection.geneSymbol} disabled />
                            
                            </Col>
                        </Form.Group>
                        </>}
                    </Form>
                    
                    <Loading show={showLoading}></Loading>
                    </div>
                    <div className="text-center mb-2">
                        <Button onClick={()=> navigate("/glycoproteins")}
                            className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycoproteins</Button>
                        {userSelection.proteinName && 
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleSubmit}>
                            Submit
                        </Button>}
                    </div>
                </Card.Body>
            </Card>
            {userSelection.proteinName && 
            <Card style={{marginTop: "15px"}}>
                <Card.Body>
                    <h5 className="gg-blue" style={{textAlign: "left"}}>
                         Sites</h5> 
                    <Row>
                        <Col md={12} style={{ textAlign: "right" }}>
                        <div className="text-right mb-3">
                            <Button variant="contained" className="gg-btn-blue mt-2" 
                                onClick={()=> {
                                    setSiteSelection ({ "siteId": null, "new": null, "type": "EXPLICIT", "glycans": [], 
                                        "glycosylationType" : "", "glycosylationSubType": "",
                                        "positions": [{"location" : -1, "aminoAcid": ""}]});
                                    setStart(null);
                                    setEnd(null);
                                    setShowStartEnd(false);
                                    setShowAlternatives(false);
                                    setShowPosition(true);
                                    setShowAddSite(true);
                                    setSelectedGlycans([]);
                                }}>
                                    Add Site
                            </Button>
                            </div>
                        </Col>
                    </Row>
                    <Table 
                        authCheckAgent={props.authCheckAgent}
                        rowId = "siteId"
                        data = {userSelection.sites}
                        columns={columns}
                        enableRowActions={true}
                        showEdit={true}
                        editInPlace={editSite}
                        delete={deleteFromTable}
                        setAlertDialogInput={setAlertDialogInput}
                    />
                </Card.Body>
            </Card>}
            </div>
        </Container>
        </>
    );
}

export default Glycoprotein;