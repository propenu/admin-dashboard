import { applyValues } from "../../Utils/helpers";


export const PreviewPanel = ({ form, detectedVars, samplesMap }) => (
  <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3 sticky top-4 self-start max-h-screen overflow-y-auto pb-4">
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
        Live Preview
      </span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        {/* <p className="text-[10px] text-gray-400">
          From: <span className="font-semibold text-gray-600">notifications@realestatehub.com</span>
        </p> */}
        <p className="text-xs font-semibold text-gray-800 mt-0.5 break-words">
          {form.subject ? (
            applyValues(form.subject, samplesMap)
          ) : (
            <span className="text-gray-300 font-normal italic">
              Subject will appear here…
            </span>
          )}
        </p>
      </div>
      <div className="px-4 py-3 min-h-[80px]">
        {form.content ? (
          <div
            className="text-xs text-gray-600 leading-relaxed prose prose-xs max-w-none"
            dangerouslySetInnerHTML={{
              __html: applyValues(form.content, samplesMap),
            }}
          />
        ) : (
          <p className="text-[10px] text-gray-300 italic">
            Email body will appear here…
          </p>
        )}
      </div>
      {/* {detectedVars.length > 0 && (
        <div className="mx-3 mb-3 p-2.5 bg-green-50 border border-dashed border-green-200 rounded-xl">
          <p className="text-[10px] font-bold text-green-700 uppercase tracking-wide mb-1.5">Will save as</p>
          {detectedVars.map((name) => (
            <div key={name} className="flex items-center gap-1.5 mb-1 text-xs flex-wrap">
              <span className="font-mono text-green-700 font-semibold">{`{{${name}}}`}</span>
              <span className="text-gray-300">→</span>
              {samplesMap[name]?.trim() ? (
                <span className="text-gray-700 font-semibold">{samplesMap[name]}</span>
              ) : (
                <span className="text-red-400 italic">not filled yet</span>
              )}
            </div>
          ))}
        </div>
      )} */}
    </div>
    {/* <div className="border border-gray-200 rounded-2xl p-3 bg-white">
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">Summary</p>
      {[
        ["Name",      form.name || "—"],
        ["Category",  getCatMeta(form.category).label],
        ["Variables", detectedVars.length],
        ["Status",    form.status],
      ].map(([k, v]) => (
        <div key={k} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
          <span className="text-gray-400 font-semibold">{k}</span>
          <span className={`font-bold ${k === "Status" ? (v === "active" ? "text-green-600" : "text-gray-400") : "text-gray-700"}`}>
            {String(v)}
          </span>
        </div>
      ))}
    </div> */}
  </div>
);