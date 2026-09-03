import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const RESIDENTIAL_FLOORING = [
  { label: "Vitrified", value: "vitrified" },
  { label: "Marble", value: "marble" },
  { label: "Granite", value: "granite" },
  { label: "Wooden", value: "wooden" },
  { label: "Ceramic Tiles", value: "ceramic-tiles" },
  { label: "Cement", value: "cement" },
  { label: "Mosaic", value: "mosaic" },
  { label: "Normal Tiles", value: "normal-tiles" },
  { label: "Other", value: "other" },
];

const COMMERCIAL_FLOORING = [
  { label: "Vitrified Tiles", value: "vitrified-tiles" },
  { label: "Ceramic Tiles", value: "ceramic-tiles" },
  { label: "Bare Cement", value: "bare-cement" },
  { label: "Marble", value: "marble" },
  { label: "Granite", value: "granite" },
  { label: "Carpet", value: "carpet" },
  { label: "Epoxy", value: "epoxy" },
  { label: "Wooden", value: "wooden" },
];

const FlooringType = ({ error }) => {
  const { form, updateFieldValue, activeCategory } = useActivePropertySlice();
  const options =
    activeCategory === "commercial" ? COMMERCIAL_FLOORING : RESIDENTIAL_FLOORING;

  return (
    <ColorfulSelect
      label="Flooring Type"
      value={form.flooringType || ""}
      options={options}
      placeholder="Select flooring type"
      error={error}
      onChange={(v) => updateFieldValue("flooringType", v)}
    />
  );
};

export default FlooringType;
