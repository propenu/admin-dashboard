import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const WATER_SOURCES = [
  { label: "Bore Well", value: "bore-well" },
  { label: "Open Well", value: "open-well" },
  { label: "Tube Well", value: "tube-well" },
  { label: "Canal", value: "canal" },
  { label: "River", value: "river" },
  { label: "Tank", value: "tank" },
  { label: "Pond", value: "pond" },
];

const WaterSource = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Water Source"
      value={form.waterSource || ""}
      options={WATER_SOURCES}
      placeholder="Select water source"
      error={error}
      onChange={(v) => updateFieldValue("waterSource", v)}
    />
  );
};

export default WaterSource;
