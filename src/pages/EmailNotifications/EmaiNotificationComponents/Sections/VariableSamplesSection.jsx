import { AlertTriangle } from "lucide-react";


export const VariableSamplesSection = ({
  detectedVars,
  samplesMap,
  onSampleChange,
  showErrors,
}) => {
  const isDisabled = detectedVars.length === 0;
  const emptySamples = detectedVars.filter((n) => !samplesMap[n]?.trim());

  return (
    <div
      className={`border rounded-2xl overflow-hidden bg-white transition-colors ${
        !isDisabled && showErrors && emptySamples.length > 0
          ? "border-red-300"
          : isDisabled
            ? "border-gray-100"
            : "border-gray-200"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${
          isDisabled
            ? "border-gray-100 bg-gray-50/50"
            : "border-gray-100 bg-gray-50"
        }`}
      >
        <span
          className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 ${
            isDisabled ? "bg-gray-300" : "bg-green-600"
          }`}
        >
          3
        </span>
        <div className="flex-1">
          <p
            className={`text-sm font-semibold ${isDisabled ? "text-gray-400" : "text-gray-800"}`}
          >
            Variable Values
          </p>
          <p className="text-xs text-gray-400">
            These values{" "}
            <span className="font-semibold text-gray-600">replace</span> the{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {"{{token}}"}
            </span>{" "}
            in subject &amp; body when saved.
            <span className="text-red-500 font-semibold">
              {" "}
              All are required.
            </span>
          </p>
        </div>
        {!isDisabled && showErrors && emptySamples.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-red-500 font-semibold flex-shrink-0">
            <AlertTriangle size={13} /> {emptySamples.length} empty
          </span>
        )}
      </div>

      <div className="p-4">
        {isDisabled ? (
          <p className="text-xs text-gray-400 italic">
            Use{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {"{{variableName}}"}
            </span>{" "}
            in Subject or Body — value fields appear here automatically.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-1 mb-1">
              <div className="w-36 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Token
              </div>
              <div className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Value{" "}
                <span className="text-red-400 normal-case font-normal">
                  (saved into subject &amp; body)
                </span>
              </div>
            </div>

            {detectedVars.map((name) => {
              const isEmpty = showErrors && !samplesMap[name]?.trim();
              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-36 h-9 flex items-center px-2.5 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs font-semibold text-gray-700 flex-shrink-0 truncate select-none">
                    {`{{${name}}}`}
                  </div>
                  <input
                    className={`flex-1 h-9 px-3 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-300 transition-colors ${
                      isEmpty
                        ? "border-red-300 focus:ring-red-400 bg-red-50/30"
                        : "border-gray-300 focus:ring-green-500"
                    }`}
                    placeholder={`Value for {{${name}}} — required *`}
                    value={samplesMap[name] ?? ""}
                    onChange={(e) => onSampleChange(name, e.target.value)}
                  />
                </div>
              );
            })}

            {showErrors && emptySamples.length > 0 && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 p-2.5 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle size={13} className="flex-shrink-0" />
                <span>
                  Please fill values for:{" "}
                  {emptySamples.map((n) => (
                    <span
                      key={n}
                      className="font-mono font-semibold mr-1"
                    >{`{{${n}}}`}</span>
                  ))}
                  — these will be substituted into the saved subject &amp; body.
                </span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};