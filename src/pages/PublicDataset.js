import { useNavigate, useParams } from "react-router-dom";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import { getJson } from "../utils/api";
import { useEffect, useReducer, useState } from "react";
import stringConstants from '../data/stringConstants.json';
import { axiosError } from "../utils/axiosError";
import { GrantsOnDataset } from "../components/GrantsOnDataset";
import { PubOnDataset } from "../components/PubOnDataset";
import { Button, Card, Col, Form, Image, Row } from "react-bootstrap";
import { FormLabel, Title } from "../components/FormControls";
import { Loading } from "../components/Loading";
import { DatabasesOnDataset } from "../components/DatabasesOnDataset";

const PublicDataset = () => {
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
        if (datasetId) 
            fetchData();
    }, [datasetId]);

    const fetchData = async () => {
        setIsLoading(true);
        getJson (stringConstants.api.getpublicdataset + "/" + datasetId).then ((data) => {
            setDataset (data.data.data);
            setIsLoading(false);
            //TODO get all version list
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

    const getUserName = user => {
        return user.firstName ? user.firstName + (user.lastName ? " " + user.lastName : "") : user.username;
    }

    const getDateCreated = dateCreated => {
        const d = new Date(dateCreated);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
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


    const getData = () => {
        return (<>Data table</>)
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
            >{getUserName(submitterinfo)}</span>
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
                  <Form.Group className="pb-3">
                    <Col xs={12} lg={12}>
                      <FormLabel label={"Rendered Version"} />
                      <Form.Control
                        as="select"
                        st1yle={{color: "white"}}
                        name="renderedVersion "
                        value={selectedVersion}
                        onChange={e => setSelectedVersion(e.target.value)}
                      >
                        {listVersions && listVersions.length > 0 ? (
                          listVersions.map(ver => {
                            return <option value={ver.id}>{ver.name}</option>;
                          })
                        ) : (
                          <option value={selectedVersion}>{selectedVersion}</option>
                        )}
                      </Form.Control>
                    </Col>
                  </Form.Group>
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