import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import "../components/StatisticsCard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import glycoProteinIcon from "../images/icons/glycoprotein-img.svg";
import glycanIcon from "../images/icons/glycan-icon.svg";
import { Loading } from "./Loading";
import { getJson } from "../utils/api";

const StatisticsCard = () => {
  const [statistics, setStatistics] = useState([]);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    setShowLoading(true);
    getStatistics();
  }, []);

  const getStatistics = () => {
    setShowLoading(true);
    getJson ("api/util/getstatistics").then (({ data }) => {
      if (data.data) {
          setStatistics(data.data);
      }
    }).catch(function(error) {
       console.log ("cannot retrieve statistics " + error);
    });
    setShowLoading(false);
  }

  const icons = [
    {
      name: "users",
      alt: "Users Icon",
      title: "Users",
      value: statistics.userCount ? statistics.userCount : 0,
    },
    {
      name: "table",
      alt: "Datasets Icon",
      title: "Datasets",
      value: statistics.datasetCount ? statistics.datasetCount : 0,
    },
    {
      name: "glycans",
      src: glycanIcon,
      alt: "Glycan icon",
      title: "Glycans",
      value: statistics.glycanCount ? statistics.glycanCount : 0,
    },
    {
      name: "glycans2",
      src: glycanIcon,
      alt: "Glycans Icon",
      title: "Registered Glycans",
      value: statistics.newGlycanCount ? statistics.newGlycanCount : 0,
    },
    {
      name: "glycoproteins",
      src: glycoProteinIcon,
      alt: "GlycoProtein Icon",
      title: "Glycoproteins",
      value: statistics.proteinCount ? statistics.proteinCount : 0,
    },
    
  ];

  return (
    <>
      <Card className="gg-card-hover">
        {showLoading ? <Loading pageLoading={showLoading} /> : ""}
        <Row>
          {icons.map((icon, index) => {
            return (
              <>
                <Col style={{ textAlign: "-webkit-center" }}>
                  <div className={"statcard-icon-col"}>
                    {icon.title !== "Glycoproteins" && icon.title !== "Glycans" && icon.title !== "Registered Glycans" ? (
                      <FontAwesomeIcon
                        key={index + "icon"}
                        icon={["fas", icon.name]}
                        title={icon.title}
                        alt={icon.alt}
                        className={"statcard-icon"}
                      />
                    ) : (
                      <img
                        className="statistics-icon"
                        src={icon.src}
                        alt={icon.alt}
                        title={icon.title}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <h2 id="favglyph-description-title" className={"h2-css"}>
                      {`${icon.value}`}
                    </h2>
                    <p
                    // style={{
                    //   fontSize: "16px",
                    // }}
                    >
                      {icon.title}
                    </p>
                  </div>
                </Col>
              </>
            );
          })}
        </Row>
      </Card>
    </>
  );
};

export { StatisticsCard };
