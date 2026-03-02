import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createAgentThunk } from "../../../store/agents/agentsThunks";
import { X, Save, Loader2, Camera, ImageIcon } from "lucide-react";
import { fetchMe } from "../../../services/UserServices/userServices";

export default function AddAgentModal({ onClose }) {
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    agencyName: "",
    licenseNumber: "",
    licenseValidTill: "",
    city: "",
    experienceYears: 0,
    dealsClosed: 0,
    areasServed: "",
    languages: "",
    verificationStatus: "pending",
    reraAgentId: "",
    isVerified: false,
    totalProperties: 0,
    publishedCount: 0,
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [previews, setPreviews] = useState({ avatar: null, cover: null });

  // 1. Fetch User Data on Mount to get the 'user' ID
  useEffect(() => {
    const getUserContext = async () => {
      try {
        const response = await fetchMe();
        // Accessing response.user._id based on your service logic
        if (response?.user?.id) {
          setCurrentUserId(response.user.id);
          console.log("👤 User Context Loaded:", response.user.id);
        }
      } catch (err) {
        console.error("❌ Failed to fetch current user context:", err);
      }
    };
    getUserContext();
  }, []);

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
      const url = URL.createObjectURL(file);
      if (name === "avatar") {
        setAvatarFile(file);
        setPreviews((p) => ({ ...p, avatar: url }));
      } else {
        setCoverFile(file);
        setPreviews((p) => ({ ...p, cover: url }));
      }
    }
  };

  const handleSave = async () => {
    if (!currentUserId) {
      alert("System still loading user context. Please try again in a second.");
      return;
    }

    setSaving(true);
    const data = new FormData();

    // --- DEBUGGING LOG ---
    console.group("🚀 Agent Creation Payload");

    // 1. Append User ID from fetchMe
    data.append("user", currentUserId);

    // 2. Append Standard Text Fields
    const textFieldKeys = [
      "name",
      "bio",
      "agencyName",
      "licenseNumber",
      "licenseValidTill",
      "city",
      "experienceYears",
      "dealsClosed",
      "verificationStatus",
    ];
    textFieldKeys.forEach((key) => {
      data.append(key, formData[key]);
    });

    // 3. Handle Arrays (Split by comma)
    ["areasServed", "languages"].forEach((key) => {
      formData[key]
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean)
        .forEach((val) => data.append(key, val));
    });

    // 4. Handle Nested Objects
    data.append("rera[reraAgentId]", formData.reraAgentId);
    data.append("rera[isVerified]", String(formData.isVerified));
    data.append("stats[totalProperties]", Number(formData.totalProperties));
    data.append("stats[publishedCount]", Number(formData.publishedCount));

    // 5. Handle Files
    if (avatarFile) data.append("avatar", avatarFile);
    if (coverFile) data.append("coverImage", coverFile);

    // LOG ALL FORMDATA ENTRIES FOR DEBUGGING
    for (let pair of data.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }
    console.groupEnd();

    try {
      const result = await dispatch(createAgentThunk(data)).unwrap();
      console.log("✅ Agent Created:", result);
      onClose();
    } catch (err) {
      console.error("❌ API Error:", err);
      alert(err || "Failed to create agent");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create New Agent
            </h2>
            {currentUserId && (
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-tight">
                Linked to User: {currentUserId}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Images Section */}
          <div className="relative h-40 w-full rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden">
            {previews.cover ? (
              <img
                src={previews.cover}
                className="w-full h-full object-cover"
                alt="Cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-xs font-medium">Upload Cover Image</span>
              </div>
            )}
            <label className="absolute inset-0 cursor-pointer hover:bg-black/10 transition-all">
              <input
                type="file"
                name="coverImage"
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </label>

            {/* Avatar */}
            <div className="absolute -bottom-1 left-8 w-24 h-24 rounded-3xl border-4 border-white shadow-2xl bg-slate-200 overflow-hidden group">
              {previews.avatar ? (
                <img
                  src={previews.avatar}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <Camera size={24} />
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <input
                  type="file"
                  name="avatar"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <Camera className="text-white w-6 h-6" />
              </label>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-6">
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Full Name
              </label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-green-500/20"
                placeholder="Agent Name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Agency
              </label>
              <input
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Location / City
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 h-20 resize-none"
              />
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Areas Served (Comma separated)
              </label>
              <input
                name="areasServed"
                value={formData.areasServed}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
                placeholder="Gachibowli, Kokapet..."
              />
            </div>

            {/* RERA */}
            <div className="col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  RERA ID
                </label>
                <input
                  name="reraAgentId"
                  value={formData.reraAgentId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                  id="verified"
                  className="w-5 h-5 accent-green-600 cursor-pointer"
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-semibold text-slate-700 cursor-pointer"
                >
                  Verify Agent
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-slate-500 font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !currentUserId}
            className="px-8 py-2.5 bg-[#27AE60] hover:bg-[#219150] text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-200 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? "Creating..." : "Create Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}
