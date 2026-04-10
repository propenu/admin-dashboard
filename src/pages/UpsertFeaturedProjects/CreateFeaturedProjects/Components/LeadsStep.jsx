// src/pages/post-property/featured-create/steps/Components/LeadsStep.jsx
import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { Plus, Trash2, User, Users } from "lucide-react";

const inp = (err) => `w-full px-3 py-2.5 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

const LeadsStep = forwardRef(({ payload, update }, ref) => {
  const leads = payload.leads || [];
  const [errors, setErrors] = useState({});
  const leadRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!leads.length) e.leads = "At least one lead is required";
      leads.forEach((l, i) => {
        if (!l.name)     e[`lead-${i}-name`]     = "Name required";
        if (!l.phone)    e[`lead-${i}-phone`]    = "Phone required";
        if (!l.location) e[`lead-${i}-location`] = "Location required";
        if (!l.message)  e[`lead-${i}-message`]  = "Message required";
      });
      setErrors(e);
      if (Object.keys(e).length) {
        leadRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
        return false;
      }
      return true;
    },
  }));

  const clr = (key) => setErrors((e) => { const c={...e}; delete c[key]; return c; });

  const updLead = (i, key, value) => {
    const n = [...leads]; n[i][key] = value; update({ leads:n }); clr(`lead-${i}-${key}`);
  };

  const addLead = () => update({
    leads: [...leads, { name:"", phone:"", location:"", message:"", createdAt: new Date().toISOString().split("T")[0] }],
  });

  const remLead = (i) => update({ leads: leads.filter((_,idx) => idx!==i) });

  return (
    <div className="space-y-5" ref={leadRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:"linear-gradient(135deg,#f0fdf6,#dcfce7)", border:"2px solid #bbf7d0" }}>
            <Users size={17} style={{ color:"#27AE60" }} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">CRM · Pre-Seed</p>
            <h3 className="text-base font-black text-gray-900">Leads</h3>
          </div>
        </div>
        <button onClick={addLead}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
          style={{ background:"linear-gradient(135deg,#27AE60,#1e8449)" }}>
          <Plus size={14} strokeWidth={3} /> Add Lead
        </button>
      </div>

      {errors.leads && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.leads}
        </div>
      )}

      {leads.length === 0 && (
        <div className="flex flex-col items-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <User size={36} className="mb-3 opacity-30" />
          <p className="font-bold text-sm">No leads added yet</p>
          <p className="text-xs mt-1">Pre-populate the CRM with sample inquiries</p>
        </div>
      )}

      {leads.map((lead, i) => (
        <div key={i} className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
          {/* Lead header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black"
              style={{ background:"linear-gradient(135deg,#27AE60,#1e8449)" }}>
              {(lead.name || "#")[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-bold text-gray-800 flex-1">{lead.name || `Lead #${i+1}`}</span>
            {lead.createdAt && <span className="text-xs text-gray-400 font-semibold">{lead.createdAt}</span>}
            <button onClick={() => remLead(i)}
              className="p-2 text-red-500 hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Name *</label>
              <input className={inp(errors[`lead-${i}-name`])} placeholder="John Doe"
                value={lead.name} onChange={(e) => updLead(i,"name",e.target.value)} />
              {errors[`lead-${i}-name`] && <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠ Required</p>}
            </div>
            <div>
              <label className={LABEL}>Phone *</label>
              <input type="number" className={inp(errors[`lead-${i}-phone`])} placeholder="9876543210"
                value={lead.phone} onChange={(e) => updLead(i,"phone",e.target.value)} />
              {errors[`lead-${i}-phone`] && <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠ Required</p>}
            </div>
            <div>
              <label className={LABEL}>Location *</label>
              <input type="text" className={inp(errors[`lead-${i}-location`])} placeholder="Hyderabad, Telangana"
                value={lead.location} onChange={(e) => updLead(i,"location",e.target.value)} />
              {errors[`lead-${i}-location`] && <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠ Required</p>}
            </div>
            <div>
              <label className={LABEL}>Message *</label>
              <textarea rows={2} className={`${inp(errors[`lead-${i}-message`])} resize-none`}
                placeholder="Interested in 2BHK..."
                value={lead.message} onChange={(e) => updLead(i,"message",e.target.value)} />
              {errors[`lead-${i}-message`] && <p className="text-xs text-red-500 mt-1.5 font-semibold">⚠ Required</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default LeadsStep;