// src/pages/Agents/Agents.jsx
import {  useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAgentsThunk, deleteAgentThunk } from "../../store/agents/agentsThunks";

import { Loader2 } from "lucide-react";
import { Plus } from "lucide-react";




// Sub-components
import AgentCard from "./components/AgentCard";
import EditAgentModal from "./components/EditAgentModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import AddAgentModal from "./components/AddAgentModal";
import AgentDetailsDrawer from "./components/AgentDetailsDrawer";

export default function Agents() {
  const dispatch = useDispatch();

  const { items: agents, meta, loading, error } = useSelector((state) => state.agents);

  const [editingAgent, setEditingAgent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    dispatch(fetchAgentsThunk());
  }, [dispatch]);


  

  const displayTotal = useMemo(
    () => meta.total || agents.length,
    [meta.total, agents.length]
  );

  const handleEdit = (agent) => setEditingAgent(agent);
  const handleDelete = (agentId) => setShowDeleteConfirm(agentId);

  const confirmDelete = async (agentId) => {
    await dispatch(deleteAgentThunk(agentId));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#27AE60]">Agents</h1>
          <p className=" text-[#000000] text-sm mt-1">
            Manage verified agents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingAgent(true)}
            className="flex items-center gap-2 bg-[#27AE60] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#219150] transition-all shadow-lg shadow-green-100"
          >
            <Plus className="w-4 h-4" /> Add New Agent
          </button>
          <div className="px-3 py-1 rounded-full bg-slate-50 border-2 border-[#27AE60] text-sm">
            Total:{" "}
            <span className="font-bold text-[#27AE60]">{displayTotal}</span>
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Loading agents...</span>
          </div>
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          <strong className="font-medium">Error:</strong> {error}
        </div>
      )}

      {!loading && !error && agents.length === 0 && (
        <div className="border border-dashed border-slate-300 rounded-xl py-12 text-center bg-slate-50">
          <p className="text-slate-600 text-sm">No agents found.</p>
        </div>
      )}

      {!loading && !error && agents.length > 0 && (
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={(agent) => setSelectedAgent(agent)}
            />
          ))}
        </div>
      )}

      {editingAgent && (
        <EditAgentModal
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
        />
      )}

      {showDeleteConfirm && (
        <DeleteConfirmModal
          onConfirm={() => confirmDelete(showDeleteConfirm)}
          onCancel={() => setShowDeleteConfirm(null)}
        />
      )}

      {isAddingAgent && (
        <AddAgentModal onClose={() => setIsAddingAgent(false)} />
      )}

      {selectedAgent && (
        <AgentDetailsDrawer
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
}