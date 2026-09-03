import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

const Status = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="Status"
      value={form.status || ""}
      options={statusOptions}
      placeholder="Select status"
      error={error}
      onChange={(v) => updateFieldValue("status", v)}
    />
  );
};

export default Status;
