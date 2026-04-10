import { Loader2, MessageSquare, Plus, RefreshCw } from "lucide-react"




export const Topbar = ({ loading, templates, setShowCreate, fetchAll }) => {
    return (
      <div className="bg-green-50 border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              WhatsApp Templates
            </p>
            <p className="text-xs text-gray-400">
              Meta Business API · {templates.length} templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#27AE60] hover:border-[#C2EDD6] transition-colors"
            title="Refresh"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors"
            style={{ boxShadow: "0 4px 12px rgba(39,174,96,.3)" }}
          >
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>
    )
}