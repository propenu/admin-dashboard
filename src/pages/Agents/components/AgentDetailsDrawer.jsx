import {
  X,
  MapPin,
  Building2,
  Briefcase,
  Languages,
  Globe,
  ShieldCheck,
  Calendar,
  CheckCircle,
  Trophy,
  Activity,
} from "lucide-react";

export default function AgentDetailsDrawer({ agent, onClose }) {
  if (!agent) return null;

  // Safe date formatting
  const formattedDate = agent.licenseValidTill
    ? new Date(agent.licenseValidTill).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

return (
  <div className="fixed inset-0 z-[60] flex justify-center items-center p-5 ">
    {/* Backdrop with enhanced blur */}
    <div
      className="absolute inset-0 bg-black/30 backdrop-blur-[2px]   transition-opacity"
      onClick={onClose}
    />

    {/* Drawer Container */}
    <div className="relative w-full max-w-md bg-white h-full shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)]  overflow-y-auto  animate-in slide-in-from-right duration-300 border border-[#27AE60] rounded-2xl">
      {/* Header Section: Cover Image */}
      <div className="relative h-32 bg-slate-100">
        <img
          src={
            agent.coverImage?.url ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1000&auto=format&fit=crop"
          }
          className="w-full h-full object-cover"
          alt="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/20 transition-all"
        >
          <X size={20} />
        </button>

        {/* Verification Badge on Cover */}
        {agent.rera?.isVerified && (
          <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-[#27AE60] text-white px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider shadow-lg">
            <CheckCircle size={14} /> Verified
          </div>
        )}
      </div>

      <div className="px-6 pb-12">
        {/* Profile Identity */}
        <div className="relative -mt-14 mb-8">
          <div className="relative inline-block">
            <img
              src={
                agent.avatar?.url ||
                `https://ui-avatars.com/api/?name=${agent.name}&background=27AE60&color=fff`
              }
              className="w-28 h-28 rounded-3xl border-[6px] border-white shadow-xl object-cover bg-slate-50"
              alt={agent.name}
            />
          </div>

          <div className="mt-4 space-y-1">
            <h2 className="text-2xl text-slate-900 tracking-tight">
              {agent.name}
            </h2>
            <div className="flex items-center gap-2 text-[#27AE60]">
              <Building2 size={18} />
              <span className="text-sm uppercase tracking-wide">
                {agent.agencyName || "Independent Agent"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <MapPin size={14} />
              <span>{agent.city || "Hyderabad, India"}</span>
            </div>
          </div>
        </div>

        {/* Stats Highlight Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex flex-col p-4 rounded-2xl bg-green-50/50 border border-green-100 group hover:border-[#27AE60] transition-colors">
            <div className="flex items-center gap-2 mb-2 text-[#27AE60]">
              <Briefcase size={16} />
              <span className="text-[10px] uppercase tracking-widest">
                Experience
              </span>
            </div>
            <p className="text-xl text-slate-800">
              {agent.experienceYears}{" "}
              <span className="text-xs text-slate-500">Years</span>
            </p>
          </div>

          <div className="flex flex-col p-4 rounded-2xl bg-blue-50/50 border border-blue-100 group hover:border-blue-400 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-blue-500">
              <Trophy size={16} />
              <span className="text-[10px] uppercase tracking-widest">
                Closed Deals
              </span>
            </div>
            <p className="text-xl text-slate-800">{agent.dealsClosed || 0}</p>
          </div>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h3 className="flex items-center gap-2 text-sm text-slate-800 uppercase tracking-widest mb-4">
            <Activity size={16} className="text-[#27AE60]" />
            Professional Bio
          </h3>
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#27AE60] rounded-full opacity-20" />
            <p className="text-slate-600 text-[14px] leading-[1.6] pl-2">
              {agent.bio ||
                "This agent hasn't updated their biography yet. Please contact them for more professional details."}
            </p>
          </div>
        </div>

        {/* Information List */}
        <div className="bg-slate-50 rounded-2xl p-5 space-y-5 border border-slate-100">
          <DetailRow
            icon={<Globe size={18} />}
            label="Primary Areas Served"
            value={agent.areasServed?.join(", ")}
          />
          <hr className="border-slate-200/60" />
          <DetailRow
            icon={<Languages size={18} />}
            label="Languages Spoken"
            value={agent.languages?.join(", ")}
          />
          <hr className="border-slate-200/60" />
          <DetailRow
            icon={<ShieldCheck size={18} />}
            label="RERA Registration ID"
            value={agent.rera?.reraAgentId}
            highlight
          />
          <hr className="border-slate-200/60" />
          <DetailRow
            icon={<Calendar size={18} />}
            label="License Expiry"
            value={formattedDate}
          />
        </div>
      </div>
    </div>
  </div>
);
}

function DetailRow({ icon, label, value, highlight }) {
return (
    <div className="flex gap-4 items-start">
        <div
            className={`mt-1 p-2 rounded-lg bg-white shadow-sm ${highlight ? "text-[#27AE60]" : "text-slate-400"}`}
        >
            {icon}
        </div>
        <div>
            <p className="text-[10px] uppercase text-slate-400 tracking-widest mb-1">
                {label}
            </p>
            <p
                className={`text-sm ${highlight ? "text-[#27AE60]" : "text-slate-700"}`}
            >
                {value || "Not Disclosed"}
            </p>
        </div>
    </div>
);
}
