

// ── TenantInfo ──
import { useState } from "react";
import { Plus, Trash2, Users2, UserPlus2, IndianRupee, X } from "lucide-react";
const empty = { currentTenant:"", leaseStart:"", leaseEnd:"", rent:"" };
const iCls = "w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#27AE60]/25 focus:bg-white transition-all";
export default function TenantInfo({ data, onUpdateTenant }) {
  const tenants = Array.isArray(data?.tenantInfo) ? data.tenantInfo : [];
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(empty);
  const add = () => { if (!draft.currentTenant.trim()) return; onUpdateTenant([...tenants, { ...draft, currentTenant: draft.currentTenant.trim(), rent: draft.rent ? Number(draft.rent) : 0 }]); setDraft(empty); setShow(false); };
  const rm = (i) => onUpdateTenant(tenants.filter((_,idx) => idx!==i));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]"><Users2 className="w-4 h-4" /></div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy History</h4>
        </div>
        <button type="button" onClick={() => setShow(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e9e52)", boxShadow: "0 4px 14px #27AE6030" }}>
          <Plus className="w-3.5 h-3.5" /> Add Tenant
        </button>
      </div>
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2"><UserPlus2 className="w-5 h-5 text-slate-200" /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">No active lease records</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tenants.map((t, i) => (
            <div key={i} className="group flex items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#27AE60]/20 transition-all">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Tenant</p><p className="font-black text-slate-700 text-sm truncate">{t.currentTenant}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Rent</p><p className="font-black text-[#27AE60] text-sm flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{Number(t.rent).toLocaleString("en-IN")}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Start</p><p className="font-bold text-slate-500 text-sm">{t.leaseStart||"—"}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Expiry</p><p className="font-bold text-slate-500 text-sm">{t.leaseEnd||"—"}</p></div>
              </div>
              <button type="button" onClick={() => rm(i)} className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShow(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.25)" }}>
            <div className="px-7 pt-7 pb-4 flex items-center justify-between">
              <div><h3 className="text-lg font-black text-slate-800">Add New Tenant</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Registry Entry</p></div>
              <button onClick={() => setShow(false)} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-7 pb-7 space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name / Entity</label><input type="text" placeholder="e.g. Acme Corp or John Doe" value={draft.currentTenant} onChange={(e) => setDraft({...draft,currentTenant:e.target.value})} className={iCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lease Start</label><input type="date" value={draft.leaseStart} onChange={(e) => setDraft({...draft,leaseStart:e.target.value})} className={iCls} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lease End</label><input type="date" value={draft.leaseEnd} onChange={(e) => setDraft({...draft,leaseEnd:e.target.value})} className={iCls} /></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rent (₹)</label>
                <div className="relative"><IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27AE60]" /><input type="number" placeholder="0" value={draft.rent} onChange={(e) => setDraft({...draft,rent:e.target.value})} className={`${iCls} pl-11`} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShow(false)} className="flex-1 py-3.5 rounded-xl text-sm font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">Cancel</button>
                <button onClick={add} className="flex-1 py-3.5 rounded-xl text-white text-sm font-black transition-all uppercase tracking-widest active:scale-95"
                  style={{ background: "linear-gradient(135deg,#27AE60,#1e9e52)", boxShadow: "0 6px 20px #27AE6030" }}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}