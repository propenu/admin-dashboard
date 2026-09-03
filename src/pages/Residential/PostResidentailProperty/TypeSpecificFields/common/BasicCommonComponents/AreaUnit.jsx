import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const AREA_UNITS = [
  { label: "Acres", value: "acres" },
  { label: "Square Feet", value: "sqft" },
  { label: "Gunta", value: "gunta" },
  { label: "Hectare", value: "hectare" },
  { label: "Square Meter", value: "sqm" },
];

const AreaUnit = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Area Unit"
      value={form.areaUnit || ""}
      options={AREA_UNITS}
      placeholder="Select area unit"
      error={error}
      onChange={(v) => updateFieldValue("areaUnit", v)}
    />
  );
};

export default AreaUnit;
