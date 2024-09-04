import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import { Card } from "react-bootstrap";
import "../components/VersionCard.css";
import { Loading } from "./Loading";


export default function VersionCard(props) {
  const [versionData, setVersionData] = useState({});
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setShowLoading(true);
    getVersion();
  }, []);

  const getVersion = () => {

  }

  return (
    <>
      <Grid item xs={12} sm={6} md={12}>
        <Card className="gg-card-hover">
          {showLoading ? <Loading pageLoading={showLoading} /> : ""}
          <div sx={{flex: 1}}>
            <CardContent>
              <h4 sx={{
                textAlign: "center",
              }}>Version</h4>
              <span>
                <strong>Portal: &nbsp;</strong>
              </span>
              {versionData.Portal &&
                versionData.Portal.version +
                  " (" +
              versionData.Portal.releaseDate +
                  ")"}
              <br />
              <span>
                <strong>Api: &nbsp;</strong>
              </span>
              {versionData.API &&
                versionData.API.version + " (" + versionData.API.releaseDate + ")"}
            </CardContent>
          </div>
        </Card>
      </Grid>
    </>
  );
}

VersionCard.propTypes = {
  data: PropTypes.object,
  pageLoading: PropTypes.bool,
};
