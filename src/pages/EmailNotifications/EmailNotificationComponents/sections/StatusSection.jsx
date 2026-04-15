

export const StatusSection = ({ status, onChange }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center gap-3 px-4 py-1 border-b border-gray-100 bg-gray-50">
      <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        5
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">Status</p>
        <p className="text-xs text-gray-500">Enable or disable this template</p>
      </div>
    </div>
    <div className="flex items-center justify-between px-4 py-1">
      <div>
        <p className="text-sm font-semibold text-gray-700">
          {status === "active" ? "Active" : "Inactive"}
        </p>
        <p className="text-xs text-gray-400">
          {status === "active"
            ? "Template will be used in campaigns"
            : "Template is disabled"}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(status === "active" ? "inactive" : "active")}
        className={`relative  w-12 h-6 rounded-full transition-colors flex-shrink-0 ${status === "active" ? "bg-green-500" : "bg-gray-300"}`}
      >
        <span
          className={`absolute right-7 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${status === "active" ? "translate-x-6" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  </div>
);