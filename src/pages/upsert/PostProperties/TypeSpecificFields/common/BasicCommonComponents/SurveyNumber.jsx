import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const SurveyNumber = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Survey Number
      </p>

      <input
        type="text"
        value={form.surveyNumber || ""}
        onChange={(e) => updateFieldValue("surveyNumber", e.target.value)}
        placeholder="e.g. 123/45A"
        className="w-full p-3 border text-sm outline-none font-weight-bold placeholder:text-[#524d4d] text-[#000000] border-[#27AD75] rounded-lg"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default SurveyNumber;
