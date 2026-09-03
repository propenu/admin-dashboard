import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const ROAD_TYPES = ["Mud Road", "BT Road", "CC Road"];

const AccessRoadType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Access Road Type"
      value={form.accessRoadType || ""}
      options={ROAD_TYPES}
      placeholder="Select access road type"
      error={error}
      onChange={(v) => updateFieldValue("accessRoadType", v)}
    />
  );
};

export default AccessRoadType;
