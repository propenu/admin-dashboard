import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const FACING_OPTIONS = [
  "Corner",
  "Road Facing",
  "Two Side Open",
  "Three Side Open",
];

const LandFacing = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Facing"
      value={form.facing || ""}
      options={FACING_OPTIONS}
      placeholder="Select facing direction"
      error={error}
      onChange={(v) => updateFieldValue("facing", v)}
    />
  );
};

export default LandFacing;
