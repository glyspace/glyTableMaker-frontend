import "../components/PublicationCard.css";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Table } from "react-bootstrap";
import { Tooltip } from "@mui/material";

const PublicationCard = props => {
  return (
    <>
      <Table hover className="borderless mb-0">
        <tbody>
          <tr key={props.pubIndex}>
            <td key={props.pubIndex}>
              <div>
                <h6 style={{ marginBottom: "3px" }}>
                  <strong>{props.title}</strong>
                </h6>
              </div>

              <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                <div>{props.authors}</div>
                <div>
                  {props.journal} <span>&nbsp;</span>({props.year})
                </div>
                <div>
                  <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />
                  {props.pubmedId ?
                  <> 
                  <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${props.pubmedId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.pubmedId}
                  </a></> : 
                  <>
                  <span style={{ paddingLeft: "15px" }}>DOI:&nbsp;</span>
                  <a
                    href={`https://doi.org/${props.doiId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {props.doiId}
                  </a>
                  </> }
                </div>
              </div>
            </td>
            {props.enableDelete && (
              <td className="text-right">
                <Tooltip
                    disableTouchListener
                    interactive
                    arrow
                    placement={"bottom-start"}
                    classes={{ tooltip: "gg-tooltip" }}
                    title={<>Delete publication</>}
                  >
                  <Link>
                    <FontAwesomeIcon
                      icon={["far", "trash-alt"]}
                      alt="Delete publication"
                      size="lg"
                      className="caution-color tbl-icon-btn"
                      onClick={() => props.deletePublication(props.id ? props.id : props.pubmedId, "deletePublication")}
                    />
                  </Link>
                </Tooltip>
              </td>
            )}
          </tr>
        </tbody>
      </Table>
    </>
  );
};

PublicationCard.propTypes = {
  pubmedId: PropTypes.number,
  id: PropTypes.number,
  pubIndex: PropTypes.number,
  title: PropTypes.string,
  authors: PropTypes.string,
  journal: PropTypes.string,
  year: PropTypes.number,
  number: PropTypes.string,
  volume: PropTypes.string,
  startPage: PropTypes.string,
  endPage: PropTypes.string,
  doiId: PropTypes.string,
  uri: PropTypes.string,
  enableDelete: PropTypes.bool,
  deletePublication: PropTypes.func,
};

export { PublicationCard };
