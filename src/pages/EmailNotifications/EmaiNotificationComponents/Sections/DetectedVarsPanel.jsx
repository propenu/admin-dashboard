import { Info } from "lucide-react";


export const DetectedVarsPanel = ({ detectedVars }) => {
  if (detectedVars.length === 0) return null;
  return (
    <div className="border border-dashed border-green-300 rounded-2xl overflow-hidden bg-green-50/40">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-green-200/60">
        <Info size={15} className="text-green-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-green-800">
            Auto-Detected Variables
          </p>
          <p className="text-xs text-green-600">
            Found in subject &amp; body. Fill their values in Section 1 above.
          </p>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-wrap gap-2">
        {detectedVars.map((name, i) => (
          <span
            key={name}
            className="inline-flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-lg bg-white border border-green-300 text-green-800 shadow-sm"
          >
            <span className="text-green-400 font-sans text-[10px] font-bold">
              #{i + 1}
            </span>
            {`{{${name}}}`}
          </span>
        ))}
      </div>
    </div>
  );
};