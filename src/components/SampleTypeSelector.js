import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function SampleTypeSelector({
  datasetType,
  value,
  onChange,
}) {
  const handleChange = (event) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <FormControl fullWidth>
      <FormLabel sx={{ mb: 2 }}>
        What option best describes the analyzed sample?
      </FormLabel>

      <RadioGroup value={value || ""} onChange={handleChange}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>
              Sample directly derived from a biological organism
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <FormControlLabel
              value="biological_sample"
              control={<Radio />}
              label="Biological sample"
            />

            <FormControlLabel
              value="biological_sample_background_alteration"
              control={<Radio />}
              label="Biological sample with background alteration"
            />

            {datasetType === "GLYCOPROTEIN" && (
              <>
                <FormControlLabel
                  value="protein_mutation"
                  control={<Radio />}
                  label="Biological sample with protein mutation"
                />

                <FormControlLabel
                  value="protein_mutation_background_alteration"
                  control={<Radio />}
                  label="Biological sample with protein mutation and background alteration"
                />
              </>
            )}
          </AccordionDetails>
        </Accordion>

        {datasetType === "GLYCOPROTEIN" && (
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>
                Sample protein expressed in different organism
              </Typography>
            </AccordionSummary>

            <AccordionDetails>
              <FormControlLabel
                value="expressed_protein"
                control={<Radio />}
                label="Expressed protein"
              />

              <FormControlLabel
                value="expressed_protein_altered_system"
                control={<Radio />}
                label="Expressed protein in altered expression system"
              />
            </AccordionDetails>
          </Accordion>
        )}

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Other Samples</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <FormControlLabel
              value="synthetic"
              control={<Radio />}
              label="Synthetic"
            />
          </AccordionDetails>
        </Accordion>
      </RadioGroup>
    </FormControl>
  );
}