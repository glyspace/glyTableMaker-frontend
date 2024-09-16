import { Container, Grid } from "@mui/material";
import MainFeaturedCard from "../components/MainFeaturedCard";
import mainImg from "../images/main-featured-img.svg";
import { Card, Row } from "react-bootstrap";
import { useReducer } from "react";
import DialogAlert from "../components/DialogAlert";
import FeedbackWidget from "../components/FeedbackWidget";
import VersionCard from "../components/VersionCard";
import { StatisticsCard } from "../components/StatisticsCard";

const Home = () => {
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );
    const mainFeaturedCard = {
        title: "GlyTableMaker",
        description:
          "GlyTableMaker is a tool to deposit glycans/glycoproteins, assign metadata for them, and generate Excel/csv tables. It is also a public repository for sharing of glycan and/or glycoprotein data for the deposition to GlyGen. The repository contains both, published and unpublished, datasets. All data is provided under the chosen license by the providers.",
        image: mainImg,
        linkText: "Learn More…",
        to: ""
      };
return (
    <>
     <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
    <div style={{ marginTop: "-8px" }}>
        <MainFeaturedCard post={mainFeaturedCard} />
        <Container maxWidth="xl" className="gg-container" style={{ width: "97%" }}>
        <DialogAlert
                    alertInput={alertDialogInput}
                    setOpen={input => {
                        setAlertDialogInput({ show: input });
                    }}
              />
          <Row className="show-grid">
            <Grid container spacing={4}>
              <Grid item xs={12} md={8} lg={9}>
                <Grid
                  container
                  spacing={4}
                  style={{
                    justifyContent: "center"
                  }}
                >
                  <Grid item xs={12} sm={12}>
                    <StatisticsCard />
                  </Grid>
                </Grid>

                <Grid container style={{ marginTop: "32px" }}>
                  <Grid item xs={12} sm={12} style={{ backgroundColor: "white" }}>
                    <Card>
                      {/** published datasets in a table */}
                    </Card>
                  </Grid>
                </Grid>
              </Grid>

              
            </Grid>
          </Row>
        </Container>
</div>
</>
);
}

export default Home;