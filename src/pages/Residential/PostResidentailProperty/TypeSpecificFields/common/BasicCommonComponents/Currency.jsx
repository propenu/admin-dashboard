import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const CURRENCY = [
  { label: "INR — ₹", value: "INR" },
  { label: "USD — $", value: "USD" },
  { label: "EUR — €", value: "EUR" },
];

const Currency = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <ColorfulSelect
      ref={ref}
      label="Currency"
      value={form.currency || ""}
      options={CURRENCY}
      placeholder="Select currency"
      error={error}
      onChange={(v) => updateFieldValue("currency", v)}
    />
  );
});

export default Currency;
