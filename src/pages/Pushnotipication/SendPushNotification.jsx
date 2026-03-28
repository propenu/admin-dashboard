

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bell,
  Users,
  Loader2,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Zap,
  Radio,
  UserCheck,
  Wifi,
  Battery,
  Signal,
} from "lucide-react";
import { adminCustomNotification } from "../../features/user/userService";
import { toast } from "sonner";

/* ─────────────────────────────────────────
   STYLES  — light theme, primary #27AE60
───────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; }

:root {
  --green:       #27AE60;
  --green-dark:  #1e8449;
  --green-light: #eafaf1;
  --green-mid:   #d5f0e2;
  --green-ring:  rgba(39,174,96,.18);
  --surface:     #ffffff;
  --surface2:    #f6fdf9;
  --surface3:    #edf7f2;
  --border:      #d4eddd;
  --border2:     #b7dfca;
  --text:        #0f2d1c;
  --text2:       #2e6b47;
  --text3:       #6aab83;
  --muted:       #9ec9ad;
  --danger:      #dc2626;
  --danger-bg:   #fef2f2;
  --danger-bdr:  #fecaca;
  --shadow-md:   0 4px 24px rgba(39,174,96,.10);
  --shadow-lg:   0 8px 40px rgba(39,174,96,.14);
}

.pn-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  min-height: 100vh;
  background: var(--surface2);
  background-image:
    radial-gradient(ellipse 55% 40% at 85% 0%,   rgba(39,174,96,.10) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 5%  95%,  rgba(39,174,96,.07) 0%, transparent 55%);
  padding: 2.5rem 1.25rem 4rem;
  color: var(--text);
}

/* header */
.pn-eyebrow {
  display: flex; align-items: center; gap: .45rem;
  font-size: .63rem; font-weight: 700; letter-spacing: .15em;
  text-transform: uppercase; color: var(--green); margin-bottom: .5rem;
}
.pn-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  animation: blink 1.4s ease-in-out infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
.pn-title {
  font-size: clamp(1.7rem,4vw,2.3rem); font-weight: 800;
  color: var(--text); letter-spacing: -.03em; line-height: 1.15; margin: 0 0 .35rem;
}
.pn-title span { color: var(--green); }
.pn-sub { font-size: .82rem; color: var(--text3); font-weight: 500; }

/* layout */
.pn-grid {
  max-width: 1060px; margin: 2.25rem auto 0;
  display: grid; grid-template-columns: 1fr; gap: 2rem;
}
@media(min-width:900px){ .pn-grid { grid-template-columns: 1fr 360px; gap: 2.5rem; } }

/* card */
.pn-card {
  background: var(--surface);
  border: 1.5px solid var(--border);
  border-radius: 20px; overflow: hidden;
  box-shadow: var(--shadow-md);
}

/* stats strip */
.pn-stats {
  display: grid; grid-template-columns: repeat(3,1fr);
  border-bottom: 1.5px solid var(--border);
}
.pn-stat {
  padding: 1.1rem 1rem; text-align: center;
  border-right: 1.5px solid var(--border);
}
.pn-stat:last-child { border-right: none; }
.pn-stat-val { font-size: 1.25rem; font-weight: 800; color: var(--green); line-height: 1; }
.pn-stat-key { font-size: .57rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; margin-top: .3rem; }

/* section label */
.pn-section-label {
  font-size: .61rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted); margin-bottom: .85rem;
  display: flex; align-items: center; gap: .45rem;
}
.pn-section-label::after { content:''; flex:1; height:1px; background: var(--border); }

/* audience chips */
.pn-audience-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.pn-chip {
  display: flex; align-items: center; gap: .75rem;
  padding: .9rem 1rem; border-radius: 14px;
  border: 1.5px solid var(--border); background: var(--surface2);
  cursor: pointer; text-align: left;
  transition: border-color .18s, background .18s, box-shadow .18s;
}
.pn-chip:hover { border-color: var(--border2); background: var(--surface3); }
.pn-chip.active {
  border-color: var(--green); background: var(--green-light);
  box-shadow: 0 0 0 3px var(--green-ring);
}
.pn-chip-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); color: var(--muted);
  border: 1px solid var(--border);
  transition: background .18s, color .18s, border-color .18s;
}
.pn-chip.active .pn-chip-icon { background: var(--green); color: #fff; border-color: var(--green); }
.pn-chip-label { font-size: .82rem; font-weight: 700; color: var(--text2); line-height: 1.2; }
.pn-chip.active .pn-chip-label { color: var(--green-dark); }
.pn-chip-sub { font-size: .67rem; color: var(--muted); font-weight: 600; margin-top: 1px; }

/* inputs */
.pn-field { margin-bottom: 1.15rem; }
.pn-label {
  display: block; font-size: .69rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase;
  color: var(--text2); margin-bottom: .5rem;
}
.pn-input, .pn-textarea {
  width: 100%; padding: .85rem 1rem;
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: 12px; color: var(--text);
  font-family: inherit; font-size: .875rem; font-weight: 500;
  outline: none; resize: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.pn-input::placeholder, .pn-textarea::placeholder { color: var(--muted); }
.pn-input:focus, .pn-textarea:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px var(--green-ring);
  background: #fff;
}
.pn-char-counter {
  font-family: 'Fira Code', monospace;
  font-size: .68rem; color: var(--muted); text-align: right; margin-top: .3rem;
}
.pn-char-counter.warn { color: #d97706; }

/* footer */
.pn-footer {
  padding: 1rem 1.5rem; border-top: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2);
}
.pn-warning { display: flex; align-items: center; gap: .4rem; font-size: .68rem; color: var(--muted); font-weight: 600; }
.pn-btn {
  display: flex; align-items: center; gap: .55rem;
  padding: .75rem 1.6rem; border-radius: 12px;
  background: var(--green); color: #fff;
  font-family: inherit; font-weight: 700; font-size: .85rem;
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(39,174,96,.35);
  transition: background .18s, transform .15s, box-shadow .18s;
}
.pn-btn:hover:not(:disabled) {
  background: var(--green-dark); transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(39,174,96,.4);
}
.pn-btn:active:not(:disabled) { transform: translateY(0); }
.pn-btn:disabled { opacity: .5; cursor: not-allowed; }

/* alert */
.pn-alert {
  display: flex; align-items: center; gap: .75rem;
  padding: .9rem 1.1rem; border-radius: 14px;
  font-size: .82rem; font-weight: 600; margin-bottom: 1.25rem;
  border: 1.5px solid;
}
.pn-alert.success { background: var(--green-light); border-color: var(--border2); color: var(--green-dark); }
.pn-alert.error   { background: var(--danger-bg);   border-color: var(--danger-bdr); color: var(--danger); }

/* form body */
.pn-form-body { padding: 1.5rem; }

/* phone */
.pn-phone-wrap { display: flex; flex-direction: column; align-items: center; }
.pn-preview-label {
  display: flex; align-items: center; gap: .45rem;
  font-size: .63rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; color: var(--muted); margin-bottom: 1.25rem;
}
.pn-phone {
  width: 230px;
  background: #f0f6f2;
  border-radius: 40px;
  border: 7px solid #dce9e1;
  box-shadow:
    0 0 0 1px #c8dece,
    0 28px 60px rgba(39,174,96,.13),
    0 6px 20px rgba(0,0,0,.07);
  overflow: hidden;
}
.pn-phone-inner { padding-bottom: 1.5rem; }
.pn-notch {
  width: 88px; height: 22px; background: #dce9e1;
  border-radius: 0 0 14px 14px; margin: 0 auto .4rem;
}
.pn-statusbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: .5rem 1.1rem .35rem;
}
.pn-time { font-size: .72rem; font-weight: 700; color: var(--text); }
.pn-icons { display: flex; align-items: center; gap: .3rem; color: var(--text2); }
.pn-wallpaper {
  margin: 0 .7rem; border-radius: 18px;
  background: linear-gradient(160deg, #e4f5ec 0%, #cde8d9 100%);
  padding: .65rem; min-height: 190px; border: 1px solid var(--border2);
}
.pn-notif-card {
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,.95);
  border-radius: 14px; padding: .75rem;
  box-shadow: 0 2px 12px rgba(39,174,96,.09);
}
.pn-notif-top { display: flex; align-items: center; gap: .4rem; margin-bottom: .35rem; }
.pn-notif-app-icon {
  width: 18px; height: 18px; border-radius: 5px; background: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.pn-notif-app { font-size: .57rem; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: .06em; }
.pn-notif-time { font-size: .57rem; color: var(--muted); margin-left: auto; }
.pn-notif-title { font-size: .77rem; font-weight: 700; color: var(--text); margin-bottom: .18rem; line-height: 1.3; }
.pn-notif-body { font-size: .69rem; color: var(--text2); line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pn-empty-title { color: var(--muted); font-style: italic; }
.pn-empty-body  { color: #b7d9c4; font-style: italic; }
.pn-live-badge {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .3rem .75rem; border-radius: 99px;
  background: var(--green-light); border: 1px solid var(--border2);
  font-size: .62rem; font-weight: 700; color: var(--green-dark);
  letter-spacing: .06em; text-transform: uppercase; margin-top: 1rem;
}
.pn-live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: blink 1s infinite; }

@media(max-width:500px){
  .pn-audience-grid { grid-template-columns: 1fr; }
  .pn-stats { grid-template-columns: 1fr 1fr; }
}
`;


const ROLES = [
  {
    value: "all",
    label: "All Users",
    icon: <Users size={16} />,
    desc: "Global broadcast",
  },
  {
    value: "agent",
    label: "Agent",
    icon: <UserCheck size={16} />,
    desc: "Field agents",
  },
];
const BODY_MAX = 180;

const SendPushNotification = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    target: "all",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [sent, setSent] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "body" && value.length > BODY_MAX) return;
    setFormData((p) => ({ ...p, [name]: value }));
    setStatus({ type: "", message: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await adminCustomNotification(formData);
      setStatus({
        type: "success",
        message: "Notification dispatched successfully!",
      });
      toast.success("Push notification dispatched!");
      setSent((n) => n + 1);
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

  const bodyLen = formData.body.length;
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <style>{STYLES}</style>
      <div className="pn-root">
        {/* Header */}
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div className="pn-eyebrow">
            <div className="pn-dot" /> Campaign Manager
          </div>
          <h1 className="pn-title">
            Push <span>Notifications</span>
          </h1>
          <p className="pn-sub">Real-time broadcast to your entire user base</p>
        </div>

        <div className="pn-grid">
          {/* ── FORM ── */}
          <div>
            <AnimatePresence>
              {status.message && (
                <motion.div
                  key="alert"
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`pn-alert ${status.type}`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertCircle size={17} />
                  )}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pn-card">
              {/* Stats */}
              <div className="pn-stats">
                <div className="pn-stat">
                  <div className="pn-stat-val">{sent}</div>
                  <div className="pn-stat-key">Sent</div>
                </div>
                <div className="pn-stat">
                  <div className="pn-stat-val">{ROLES.length}</div>
                  <div className="pn-stat-key">Audiences</div>
                </div>
                <div className="pn-stat">
                  <div className="pn-stat-val">●</div>
                  <div className="pn-stat-key">Live</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="pn-form-body">
                  {/* Audience */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <div className="pn-section-label">
                      <Radio size={11} /> Target Audience
                    </div>
                    <div className="pn-audience-grid">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          className={`pn-chip ${formData.target === r.value ? "active" : ""}`}
                          onClick={() =>
                            setFormData((p) => ({ ...p, target: r.value }))
                          }
                        >
                          <div className="pn-chip-icon">{r.icon}</div>
                          <div>
                            <div className="pn-chip-label">{r.label}</div>
                            <div className="pn-chip-sub">{r.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pn-section-label">
                    <Zap size={11} /> Notification Content
                  </div>

                  <div className="pn-field">
                    <label className="pn-label">Title</label>
                    <input
                      className="pn-input"
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. New property listings available!"
                      autoComplete="off"
                    />
                  </div>

                  <div className="pn-field">
                    <label className="pn-label">Message</label>
                    <textarea
                      className="pn-textarea"
                      name="body"
                      required
                      rows={4}
                      value={formData.body}
                      onChange={handleChange}
                      placeholder="Write your message here…"
                    />
                    <div
                      className={`pn-char-counter ${bodyLen > BODY_MAX * 0.85 ? "warn" : ""}`}
                    >
                      {bodyLen} / {BODY_MAX}
                    </div>
                  </div>
                </div>

                <div className="pn-footer">
                  <div className="pn-warning">
                    <AlertCircle size={13} /> Irreversible once dispatched
                  </div>
                  <button className="pn-btn" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={15} /> Dispatch
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── PHONE PREVIEW ── */}
          <div className="pn-phone-wrap">
            <div className="pn-preview-label">
              <Smartphone size={13} /> Live Preview
            </div>

            <div className="pn-phone">
              <div className="pn-phone-inner">
                <div className="pn-notch" />
                <div className="pn-statusbar">
                  <span className="pn-time">{now}</span>
                  <div className="pn-icons">
                    <Signal size={11} />
                    <Wifi size={11} />
                    <Battery size={11} />
                  </div>
                </div>
                <div style={{ padding: "0 .7rem" }}>
                  <div className="pn-wallpaper">
                    <motion.div
                      key={formData.title + formData.body}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className="pn-notif-card"
                    >
                      <div className="pn-notif-top">
                        <div className="pn-notif-app-icon">
                          <Bell size={10} color="#fff" />
                        </div>
                        <span className="pn-notif-app">App</span>
                        <span className="pn-notif-time">now</span>
                      </div>
                      <div
                        className={`pn-notif-title ${!formData.title ? "pn-empty-title" : ""}`}
                      >
                        {formData.title || "Your Title Here"}
                      </div>
                      <div
                        className={`pn-notif-body ${!formData.body ? "pn-empty-body" : ""}`}
                      >
                        {formData.body ||
                          "Your message will appear here as you type…"}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pn-live-badge">
              <div className="pn-live-dot" /> Updates live
            </div>
           
          </div>
        </div>
      </div>
    </>
  );
};

export default SendPushNotification;