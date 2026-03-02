


// src/pages/Agents/components/EditAgentModal.jsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateAgentThunk } from "../../../store/agents/agentsThunks";
import { X, Save, Loader2, Camera, Image as ImageIcon } from "lucide-react";

export default function EditAgentModal({ agent, onClose }) {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);

  // 1. Initial State Setup
  const [formData, setFormData] = useState({
    name: agent.name || "",
    bio: agent.bio || "",
    agencyName: agent.agencyName || "",
    licenseNumber: agent.licenseNumber || "",
    licenseValidTill: agent.licenseValidTill ? agent.licenseValidTill.split("T")[0] : "",
    city: agent.city || "",
    experienceYears: agent.experienceYears || 0,
    dealsClosed: agent.dealsClosed || 0,
    areasServed: Array.isArray(agent.areasServed) ? agent.areasServed.join(", ") : "",
    languages: Array.isArray(agent.languages) ? agent.languages.join(", ") : "",
    verificationStatus: agent.verificationStatus || "pending",
    reraAgentId: agent.rera?.reraAgentId || "",
    isVerified: agent.rera?.isVerified || false,
    totalProperties: agent.stats?.totalProperties || 0,
    publishedCount: agent.stats?.publishedCount || 0,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previews, setPreviews] = useState({
    avatar: agent.avatar?.url || "",
    cover: agent.coverImage?.url || "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (name === "avatar") {
        setAvatarFile(file);
        setPreviews((prev) => ({ ...prev, avatar: URL.createObjectURL(file) }));
      } else if (name === "coverImage") { // Match the input name
        setCoverFile(file);
        setPreviews((prev) => ({ ...prev, cover: URL.createObjectURL(file) }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Initialize a fresh FormData object
      const data = new FormData();

      // 2. Append Text & Number Fields (Numbers must be converted to strings)
      data.append("name", formData.name);
      data.append("bio", formData.bio || "");
      data.append("agencyName", formData.agencyName || "");
      data.append("licenseNumber", formData.licenseNumber || "");
      data.append("city", formData.city || "");
      data.append("verificationStatus", formData.verificationStatus);
      data.append("experienceYears", String(formData.experienceYears));
      data.append("dealsClosed", String(formData.dealsClosed));

      if (formData.licenseValidTill) {
        data.append("licenseValidTill", formData.licenseValidTill);
      }

      // 3. FIX ARRAYS (Prevents the nested [[""]] error)
      // We split the string, trim it, and append each item individually
      const areas = formData.areasServed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean); // Removes empty strings

      const langs = formData.languages
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      areas.forEach((area) => data.append("areasServed", area));
      langs.forEach((lang) => data.append("languages", lang));

      // 4. NESTED OBJECTS (Using the bracket notation for backend parsers)
      data.append("rera[reraAgentId]", formData.reraAgentId || "");
      data.append("rera[isVerified]", String(formData.isVerified));
      data.append("stats[totalProperties]", String(formData.totalProperties));
      data.append("stats[publishedCount]", String(formData.publishedCount));

      // 5. IMAGE FIX (The most critical part)
      // We only append if a NEW file was actually selected (instanceof File)
      if (avatarFile && avatarFile instanceof File) {
        console.log("Adding Avatar File:", avatarFile.name);
        data.append("avatar", avatarFile);
      }

      if (coverFile && coverFile instanceof File) {
        console.log("Adding Cover Image File:", coverFile.name);
        data.append("coverImage", coverFile);
      }

      // 6. TRUE DEBUG LOG (FormData does not show content in regular console.log)
      console.log("--- FINAL PAYLOAD CHECK ---");
      for (let [key, value] of data.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`${key}:`, value);
        }
      }

      // 7. DISPATCH
      await dispatch(updateAgentThunk({ id: agent._id, data })).unwrap();
      onClose();
    } catch (error) {
      console.error("SUBMISSION ERROR:", error);
      const serverMessage = error.response?.data?.message || "Update failed.";
      alert(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Edit Full Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* MEDIA SECTION */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Profile & Cover Images</label>
            <div className="relative">
              <div className="h-32 w-full rounded-xl bg-slate-100 overflow-hidden relative border-2 border-dashed border-slate-300">
                <img src={previews.cover} className="w-full h-full object-cover" alt="Cover" />
                <label className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                  <input
                    type="file"
                    name="coverImage" // Changed from 'cover'
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="bg-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                    <ImageIcon className="w-4 h-4" /> Change Cover
                  </div>
                </label>
              </div>
              <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-2xl border-4 border-white shadow-xl bg-slate-200 overflow-hidden group">
                <img src={previews.avatar} className="w-full h-full object-cover" alt="Avatar" />
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <input
                    type="file"
                    name="avatar"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <Camera className="w-6 h-6 text-white" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BASIC INFO */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500">Full Name</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500">Agency Name</label>
                  <input name="agencyName" value={formData.agencyName} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* RERA */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">RERA & Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500">RERA Agent ID</label>
                  <input name="reraAgentId" value={formData.reraAgentId} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Verification</label>
                  <select name="verificationStatus" value={formData.verificationStatus} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isVerified" checked={formData.isVerified} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-semibold text-slate-700">RERA Verified</span>
                  </label>
                </div>
              </div>
            </div>

            {/* STATS */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">Exp (Yrs)</label>
                  <input type="number" name="experienceYears" value={formData.experienceYears} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Deals</label>
                  <input type="number" name="dealsClosed" value={formData.dealsClosed} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Total Props</label>
                  <input type="number" name="totalProperties" value={formData.totalProperties} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Published</label>
                  <input type="number" name="publishedCount" value={formData.publishedCount} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
              </div>
            </div>

            {/* LOCATION */}
            <div className="md:col-span-2 space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">City</label>
                  <input name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">Valid Till</label>
                  <input type="date" name="licenseValidTill" value={formData.licenseValidTill} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Areas Served (Comma separated)</label>
                <input name="areasServed" value={formData.areasServed} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Languages (Comma separated)</label>
                <input name="languages" value={formData.languages} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-end gap-3">
          <button onClick={onClose} disabled={saving} className="px-5 py-2 text-slate-600 font-semibold hover:text-slate-800">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Processing..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}