import { AlertTriangle } from "lucide-react";



export const SubjectSection = ({ subject, onChange }) => {
  const invalidTokens = [...(subject || "").matchAll(/\{\{(\d+)\}\}/g)].map(
    (m) => m[0],
  );
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          2
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Email Subject <span className="text-red-400">*</span>
          </p>
          <p className="text-xs text-gray-500">
            Type{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {"{{variableName}}"}
            </span>{" "}
            — auto-detected, value filled in on save
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <input
          required
          className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-300 ${
            invalidTokens.length > 0
              ? "border-red-300 focus:ring-red-400"
              : "border-gray-300 focus:ring-green-500"
          }`}
          placeholder="e.g. Happy Diwali {{name}} 🎉 — Special property deals"
          value={subject}
          onChange={(e) => onChange(e.target.value)}
        />
        {invalidTokens.length > 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {invalidTokens.map((t) => (
              <span
                key={t}
                className="font-mono bg-red-50 border border-red-200 px-1 rounded mr-1"
              >
                {t}
              </span>
            ))}
            — number tokens are ignored. Use a word name like{" "}
            <span className="font-mono bg-gray-100 px-1 rounded ml-1">
              {"{{name}}"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
