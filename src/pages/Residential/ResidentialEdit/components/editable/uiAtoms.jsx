/* =========================================================
   FILE 2: uiAtoms.jsx
   Path: components/editable/uiAtoms.jsx
========================================================= */
export const Section = ({ title, children }) => (
  <div className="space-y-3">
    <p className="text-sm font-medium text-gray-700">{title}</p>
    <div className="flex flex-wrap gap-3">{children}</div>
  </div>
);

export const Pill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full border text-sm transition ${active ? "bg-green-50 border-green-600 text-green-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
  >
    {label}
  </button>
);

export const CardOption = ({ label, icon: Icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full border rounded-xl p-4 text-center space-y-2 transition ${active ? "bg-green-50 border-green-600 text-green-700" : "border-gray-200 hover:bg-gray-50"}`}
  >
    {Icon && <Icon className="w-6 h-6 mx-auto" />}
    <p className="text-sm font-medium">{label}</p>
  </button>
);

export const Counter = ({ label, value = 0, onChange }) => (
  <div className="border rounded-xl p-4 space-y-2">
    <p className="text-xs text-gray-500">{label}</p>
    <div className="flex justify-between items-center">
      <button onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <span className="font-semibold">{value}</span>
      <button onClick={() => onChange(value + 1)}>+</button>
    </div>
  </div>
);

export const InputBox = ({ label, children }) => (
  <div className="space-y-1">
    <p className="text-xs text-gray-500">{label}</p>
    {children}
  </div>
);

export const EditableInput = ({ prefix, value, onChange }) => (
  <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
    {prefix && <span className="text-gray-500">{prefix}</span>}
    <input
      className="w-full outline-none"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
