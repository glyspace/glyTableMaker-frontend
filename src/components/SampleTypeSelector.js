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
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function SampleTypeSelector({
  datasetType,
  value,
  titleChange,
  onChange,
}) {
  const handleChange = (event) => {
    if (titleChange) {
      titleChange("GlyTableMaker Metadata - " + getLabel(event.target.value) );
    }
    if (onChange) {
      onChange(event.target.value);
    }
  };

  const getLabel = (id) => {
    if (id === "biological_sample") {
      return "Biological Sample";
    } else if (id === "biological_sample_background_alteration") {
      return "Biological sample with background alteration";
    } else if (id === "protein_mutation") {
      return "Biological sample with protein mutation";
    } else if (id === "protein_mutation_background_alteration") {
      return "Biological sample with protein mutation and background alteration";
    } else if (id === "expressed_protein") {
      return "Expressed protein";
    } else if (id === "expressed_protein_altered_system") {
      return "Expressed protein in altered expression system";
    } else if (id === "synthetic") {
      return "Synthetic";
    } else return "";
  }

  return (


<FormControl fullWidth>
  <FormLabel sx={{ mb: 2 }}>
    What option best describes the analyzed sample?
  </FormLabel>

  <RadioGroup
    value={value || ""}
    onChange={handleChange}
    sx={{ display: "flex", gap: 2 }}
  >
    <div>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Sample directly derived from a biological organism
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
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
      </Box>

      {datasetType === "GLYCOPROTEIN" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
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
        </Box>
      )}
    </div>

    {datasetType === "GLYCOPROTEIN" && (
      <div>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Sample protein expressed in different organism
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column" }}>
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
        </Box>
      </div>
    )}

    <div>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Other Samples
      </Typography>

      <FormControlLabel
        value="synthetic"
        control={<Radio />}
        label="Synthetic"
      />
    </div>
  </RadioGroup>
</FormControl>


    /**<FormControl fullWidth>
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
    </FormControl>**/
  );
}