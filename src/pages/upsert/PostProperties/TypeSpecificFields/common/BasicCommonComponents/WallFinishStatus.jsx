
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const WALL_FINISH_STATUS = [
    { lable:"No-Partitions", value:"no-partitions"},
    { lable:"Brick-Walls", value:"brick-walls"},
    { lable:"Plastered-Walls", value:"plastered-walls"},
    

]

const WallFinishStatus = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Wall Finish Status
      </p>
      <div className="flex  gap-2">
        {WALL_FINISH_STATUS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFieldValue("wallFinishStatus", opt.value)}
            className={`p-3 rounded-lg border text-sm font-weight-bold transition-all ${
              form.wallFinishStatus === opt.value
                ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                : "border-[#000000] text-[#000000] hover:border-[#000000]"
            }`}
          >
            {opt.lable}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default WallFinishStatus;
