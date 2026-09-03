import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const IRRIGATION_TYPES = [
  { label: "Rainfed", value: "rain-fed" },
  { label: "Canal", value: "canal" },
  { label: "Borewell", value: "borewell" },
  { label: "Tube Well", value: "tube-well" },
  { label: "Open Well", value: "open-well" },
  { label: "Drip", value: "drip" },
  { label: "Sprinkler", value: "sprinkler" },
];

const IrrigationType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  // Keep label as stored value for backward compatibility with existing listings
  const current =
    IRRIGATION_TYPES.find(
      (o) =>
        o.label === form.irrigationType || o.value === form.irrigationType,
    )?.label || form.irrigationType || "";

  return (
    <ColorfulSelect
      label="Irrigation Type"
      value={current}
      options={IRRIGATION_TYPES.map((o) => o.label)}
      placeholder="Select irrigation type"
      error={error}
      onChange={(v) => updateFieldValue("irrigationType", v)}
    />
  );
};

export default IrrigationType;
