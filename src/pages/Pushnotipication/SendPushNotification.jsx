import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bell,
  Users,
  Info,
  Loader2,
  Smartphone,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { adminCustomNotification } from "../../features/user/userService";

const ROLES = [
  {
    value: "all",
    label: "All Users",
    icon: <Users size={18} />,
    desc: "Global broadcast",
  },
  // {
  //   value: "customer_care",
  //   label: "Customer Care",
  //   icon: "★",
  //   desc: "Support team",
  // },
  // { value: "admin", label: "Admin", icon: "⬡", desc: "System admins" },
  // {
  //   value: "sales_manager",
  //   label: "Sales Manager",
  //   icon: "◎",
  //   desc: "Management",
  // },
  // {
  //   value: "sales_agent",
  //   label: "Sales Agent",
  //   icon: "◈",
  //   desc: "Field agents",
  // },
  { value: "agent", label: "Agent", icon: "⊛", desc: "Operations" },
  // { value: "user", label: "User", icon: "○", desc: "End customers" },
  // { value: "accounts", label: "Accounts", icon: "⊙", desc: "Finance dept" },
];

const SendPushNotification = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target: "all",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await adminCustomNotification(formData);
      setStatus({
        type: "success",
        message: "Push notification dispatched successfully!",
      });
      setFormData({ title: "", body: "", target: "all" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err.message || "Failed to reach the server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-500 rounded-xl shadow-lg shadow-emerald-200">
                <Bell className="text-white" size={22} />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Push Center
              </h1>
            </div>
            <p className="text-slate-500 text-sm">
              Campaign manager for real-time user engagement
            </p>
          </header>

          <AnimatePresence>
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                  status.type === "success"
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <p className="text-sm font-medium">{status.message}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-6 md:p-8 space-y-8">
              {/* Audience Section */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Target Audience
                  </label>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                    REQUIRED
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {ROLES.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, target: role.value }))
                      }
                      className={`group relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                        formData.target === role.value
                          ? "border-emerald-500 bg-emerald-50/30 ring-4 ring-emerald-500/5"
                          : "border-slate-100 hover:border-slate-200 bg-slate-50/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg transition-colors ${
                            formData.target === role.value
                              ? "bg-emerald-500 text-white"
                              : "bg-white text-slate-400 border border-slate-200"
                          }`}
                        >
                          {role.icon}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-bold ${formData.target === role.value ? "text-emerald-700" : "text-slate-700"}`}
                          >
                            {role.label}
                          </p>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {role.desc}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Content Section */}
              <section className="space-y-5">
                <div className="relative">
                  <label className="text-xs  text-[#000000] uppercase  block mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Capture attention (e.g., Weekend Flash Sale!)"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Message Content
                  </label>
                  <textarea
                    name="body"
                    required
                    rows="4"
                    value={formData.body}
                    onChange={handleChange}
                    placeholder="What would you like to say?"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm resize-none"
                  />
                </div>
              </section>
            </div>

            <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Info size={14} />
                <span className="text-[10px] font-bold">
                  This action cannot be undone
                </span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-200 hover:shadow-emerald-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send
                    size={18}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                )}
                {loading ? "Broadcasting..." : "Dispatch Now"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Mobile Preview */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start lg:pt-20">
          <div className="sticky top-10 w-full max-w-[300px]">
            <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
              <Smartphone size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Real-time Preview
              </span>
            </div>

            {/* Phone Mockup */}
            <div className="relative mx-auto w-full aspect-[9/19] bg-slate-900 rounded-[3rem] border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-slate-700">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-xl z-20" />

              {/* Wallpaper Overlay */}
              <div className="absolute inset-0 bg-[#27AE60] " />

              <div className="relative z-10 p-4 pt-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-500 p-1.5 rounded-lg shadow-sm">
                      <Bell className="text-white" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          System
                        </span>
                        <span className="text-[10px] text-slate-400">now</span>
                      </div>
                      <h4 className="text-[13px] font-bold text-slate-900 truncate">
                        {formData.title || "Your Title Here"}
                      </h4>
                      <p className="text-[12px] text-slate-600 mt-0.5 leading-snug line-clamp-3">
                        {formData.body ||
                          "Your message will appear exactly as typed here for your users."}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Visual Hint for App Name */}
                <div className="mt-4 flex justify-center">
                  <div className="w-8 h-1 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-400 font-medium px-6">
              Preview displays how the notification will look on an iOS/Android
              lockscreen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendPushNotification;