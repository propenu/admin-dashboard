import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const SOIL_TYPES = [
  { label: "Red Soil", value: "red" },
  { label: "Black Soil", value: "black" },
  { label: "Alluvial Soil", value: "alluvial" },
  { label: "Sandy Soil", value: "sandy" },
  { label: "Clay Soil", value: "clay" },
  { label: "Loamy Soil", value: "loamy" },
];

const SoilType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Soil Type"
      value={form.soilType || ""}
      options={SOIL_TYPES}
      placeholder="Select soil type"
      error={error}
      onChange={(v) => updateFieldValue("soilType", v)}
    />
  );
};

export default SoilType;
