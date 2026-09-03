import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const RESTRICTION_OPTIONS = ["Applicable", "Not Applicable"];

const StatePurchaseRestrictions = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      label="State Purchase Restrictions"
      value={form.statePurchaseRestrictions || ""}
      options={RESTRICTION_OPTIONS}
      placeholder="Select Applicable / Not Applicable"
      error={error}
      onChange={(v) => updateFieldValue("statePurchaseRestrictions", v)}
    />
  );
};

export default StatePurchaseRestrictions;
