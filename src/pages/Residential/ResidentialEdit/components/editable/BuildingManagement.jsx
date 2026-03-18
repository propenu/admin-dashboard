// ── BuildingManagement ──
import { Shield, Building2, Phone } from "lucide-react";
export default function BuildingManagement({ data, onChange, errors = {} }) {
  const bm = data.buildingManagement || {
    security: false,
    managedBy: "",
    contact: "",
  };
  const upd = (k, v) => onChange("buildingManagement", { ...bm, [k]: v });
  const fCls =
    "w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#27AE60]/25 focus:bg-white focus:ring-4 focus:ring-[#27AE60]/8 transition-all";
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-slate-400" />
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Building Management
        </h4>
      </div>
      <div
        className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all"
        style={{
          borderColor: bm.security ? "#27AE6025" : "transparent",
          background: bm.security ? "#f0fdf4" : "#f8fafc",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: bm.security ? "#27AE60" : "#fff",
              color: bm.security ? "#fff" : "#cbd5e1",
            }}
          >
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">
              Managed Security
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
              24/7 On-site Personnel
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => upd("security", !bm.security)}
          className="relative w-11 h-6 rounded-full transition-colors"
          style={{ background: bm.security ? "#27AE60" : "#cbd5e1" }}
        >
          <span
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all"
            style={{ left: bm.security ? "calc(100% - 20px)" : "4px" }}
          />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Management Entity
          </label>
          <input
            type="text"
            value={bm.managedBy || ""}
            onChange={(e) => upd("managedBy", e.target.value)}
            placeholder="e.g. Knight Frank Management"
            className={fCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Contact Number
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
              type="text"
              value={bm.contact || ""}
              onChange={(e) => upd("contact", e.target.value)}
              placeholder="+91 00000 00000"
              className={`${fCls} pl-11`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
