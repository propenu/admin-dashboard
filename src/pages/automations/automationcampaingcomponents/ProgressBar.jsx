

export const ProgressBar = ({ progress, completed, failed, total }) => {
  const failedPct = total > 0 ? Math.round((failed / total) * 100) : 0;
  const successPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-gray-400 font-medium">Progress</span>
        <span className="text-[11px] font-bold text-[#27AE60]">{progress}</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-[#27AE60] transition-all duration-700"
          style={{ width: `${successPct}%` }}
        />
        <div
          className="h-full bg-red-400 transition-all duration-700"
          style={{ width: `${failedPct}%` }}
        />
      </div>
      <div className="flex gap-3 mt-1">
        <span className="text-[10px] text-[#27AE60] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] inline-block" />
          Success
        </span>
        <span className="text-[10px] text-red-500 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
          Failed
        </span>
      </div>
    </div>
  );
};
