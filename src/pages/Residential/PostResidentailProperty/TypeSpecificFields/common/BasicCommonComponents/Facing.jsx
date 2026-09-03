import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const defaultFacing = [
  { label: "East", value: "east" },
  { label: "West", value: "west" },
  { label: "North", value: "north" },
  { label: "South", value: "south" },
  { label: "North-East", value: "north-east" },
  { label: "North-West", value: "north-west" },
  { label: "South-East", value: "south-east" },
  { label: "South-West", value: "south-west" },
];

const Facing = forwardRef(({ error, category }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const facingOptions =
    category === "land"
      ? [
          ...defaultFacing,
          { label: "Corner Plot", value: "corner-plot" },
          { label: "Plot", value: "plot" },
        ]
      : defaultFacing;

  return (
    <ColorfulSelect
      ref={ref}
      label="Facing Direction"
      value={form.facing || ""}
      options={facingOptions}
      placeholder="Select direction"
      error={error}
      onChange={(v) => updateFieldValue("facing", v)}
    />
  );
});

export default Facing;
