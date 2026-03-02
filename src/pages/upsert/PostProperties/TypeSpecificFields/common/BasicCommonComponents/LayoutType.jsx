import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LayoutType = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Layout Type
      </p>

      <input
        type="text"
        value={form.layoutType || ""}
        onChange={(e) => updateFieldValue("layoutType", e.target.value)}
        placeholder="DTCP / HMDA / Local"
        className="w-full p-3 border placeholder:text-[#524d4d] text-[#000000] font-weight-bold text-sm outline-none border-[#27AD75] rounded-lg"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default LayoutType;
