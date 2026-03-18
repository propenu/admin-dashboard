// src/components/common/AssignManagerModal.jsx
import { useState, useEffect, useRef } from "react";
import { getUserSearch, assignManager } from "../../features/user/userService";
import { toast } from "sonner";

/* ─── Constants ─────────────────────────────────────────────── */
const PRIMARY       = "#27AE60";
const PRIMARY_DARK  = "#1d8646";
const PRIMARY_LIGHT = "#e8f7ee";
const PRIMARY_MID   = "#d1f0df";

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  .amm-overlay-anim { animation: ammOverlayIn 0.22s ease; }
  @keyframes ammOverlayIn { from{opacity:0} to{opacity:1} }

  .amm-card-anim { animation: ammCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes ammCardIn {
    from { opacity:0; transform:scale(0.93) translateY(12px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }

  .amm-success-anim { animation: ammFadeUp 0.3s ease; }
  @keyframes ammFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  .amm-pop-anim { animation: ammPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
  @keyframes ammPop {
    from { transform:scale(0); opacity:0; }
    to   { transform:scale(1); opacity:1; }
  }

  .amm-fill-anim { animation: ammFill 2.4s linear forwards; width:0%; }
  @keyframes ammFill { from{width:0%} to{width:100%} }

  .amm-spin-anim { animation: ammSpin 0.7s linear infinite; }
  @keyframes ammSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .amm-top-line::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 2px;
    background: linear-gradient(90deg, transparent, #27AE60, transparent);
    border-radius: 999px;
  }

  .amm-scroll::-webkit-scrollbar { width: 4px; }
  .amm-scroll::-webkit-scrollbar-track { background: transparent; }
  .amm-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.2); border-radius: 4px; }

  .amm-drop-scroll::-webkit-scrollbar { width: 4px; }
  .amm-drop-scroll::-webkit-scrollbar-track { background: transparent; }
  .amm-drop-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.25); border-radius: 4px; }

  .amm-item { transition: background 0.13s; cursor: pointer; }
  .amm-item:hover { background: #e8f7ee !important; }
  .amm-item:hover .amm-item-name { color: #1d8646 !important; }
  .amm-item:hover .amm-item-badge {
    background: rgba(39,174,96,0.15) !important;
    color: #1d8646 !important;
  }
`;

/* ─── SearchField ────────────────────────────────────────────── */
function SearchField({ label, roleQuery, value, onChange }) {
  const [query,    setQuery]    = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const hasFetched              = useRef(false);
  const containerRef            = useRef(null);

  /* Filtered list: all when query empty, filtered when typing */
  const filtered = query.trim()
    ? allUsers.filter((u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : allUsers;

  /* Fetch full list once on first open */
  const fetchUsers = async () => {
    if (hasFetched.current) return;
    setLoading(true);
    try {
      const res = await getUserSearch(roleQuery);
      setAllUsers(res?.data?.results || []);
      hasFetched.current = true;
    } catch {
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (!value) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const handleOpen = () => {
    fetchUsers();
    setOpen(true);
  };

  const handleSelect = (user) => {
    onChange(user);
    setQuery("");
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
  };

  const isOpen = open && !value;

  /* ─ base input style ─ */
  const baseInput = {
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    color: "#111827",
    borderRadius: 11,
    padding: "11px 38px 11px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.18s",
    display: "block",
    boxSizing: "border-box",
  };

  return (
    <div ref={containerRef} style={{ position: "relative", marginBottom: 14 }}>

      {/* Label */}
      <label style={{
        display: "block", fontSize: 10, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 6, color: "#9ca3af",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {label}
      </label>

      {/* ── If selected → show badge row ── */}
      {value ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px",
          background: PRIMARY_LIGHT,
          border: `1.5px solid ${PRIMARY}`,
          borderRadius: 11,
          boxShadow: "0 0 0 3px rgba(39,174,96,0.10)",
          fontFamily: "DM Sans, sans-serif",
        }}>
          {/* Avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 13, fontWeight: 700,
          }}>
            {value.name.charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 600, color: "#111827",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {value.name}
            </p>
            <p style={{
              margin: 0, fontSize: 11, color: "#6b7280",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {value.email}
            </p>
          </div>

          {/* Role badge */}
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "3px 8px",
            borderRadius: 999, background: "rgba(39,174,96,0.15)",
            color: PRIMARY_DARK, whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {value.role?.label || value.role?.name}
          </span>

          {/* Clear */}
          <button
            onClick={handleClear}
            title="Clear selection"
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9ca3af", fontSize: 13, lineHeight: 1,
              padding: "2px 4px", borderRadius: 4,
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >✕</button>
        </div>

      ) : (
        /* ── Search input ── */
        <div style={{ position: "relative" }}>
          <input
            style={{
              ...baseInput,
              ...(isOpen ? {
                borderColor: PRIMARY,
                background: PRIMARY_LIGHT,
                boxShadow: "0 0 0 3px rgba(39,174,96,0.10)",
              } : {}),
            }}
            placeholder={`Click to see all ${label.toLowerCase()}s or type to search...`}
            value={query}
            onChange={(e) => { setQuery(e.target.value); if (!open) handleOpen(); }}
            onFocus={handleOpen}
          />

          {/* Right icon */}
          <div style={{
            position: "absolute", right: 12, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none",
          }}>
            {loading ? (
              <div className="amm-spin-anim" style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid rgba(39,174,96,0.2)", borderTopColor: PRIMARY,
              }} />
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <circle cx="6.5" cy="6.5" r="4" stroke="#9ca3af" strokeWidth="1.5"/>
                <path d="M10.5 10.5L13 13" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* ── Dropdown list ── */}
      {isOpen && (
        <div
          className="amm-drop-scroll"
          style={{
            position: "absolute",
            top: "calc(100% + 5px)", left: 0, right: 0,
            background: "#fff",
            border: "1.5px solid rgba(39,174,96,0.20)",
            borderRadius: 13,
            boxShadow: "0 16px 48px rgba(0,0,0,0.11), 0 2px 8px rgba(39,174,96,0.08)",
            zIndex: 200, maxHeight: 224,
            overflowY: "auto", overflowX: "hidden",
          }}
        >
          {/* Loading */}
          {loading ? (
            <div style={{
              padding: "22px 0",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
            }}>
              <div className="amm-spin-anim" style={{
                width: 18, height: 18, borderRadius: "50%",
                border: "2px solid rgba(39,174,96,0.2)", borderTopColor: PRIMARY,
              }} />
              <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "DM Sans, sans-serif" }}>
                Loading {label.toLowerCase()}s...
              </span>
            </div>

          ) : filtered.length === 0 ? (
            /* Empty */
            <div style={{
              padding: "20px 16px", textAlign: "center",
              fontFamily: "DM Sans, sans-serif",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <p style={{ margin: 0, fontSize: 13, color: "#6b7280", fontWeight: 500 }}>
                {query ? `No results for "${query}"` : `No ${label.toLowerCase()}s found`}
              </p>
            </div>

          ) : (
            <>
              {/* Header row */}
              <div style={{
                padding: "8px 14px 7px",
                borderBottom: "1px solid #f3f4f6",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                fontFamily: "DM Sans, sans-serif",
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
              }}>
                <span style={{ color: "#9ca3af" }}>{label}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: "2px 7px",
                  borderRadius: 999, background: PRIMARY_LIGHT, color: PRIMARY,
                }}>
                  {filtered.length} {filtered.length === 1 ? "result" : "results"}
                </span>
              </div>

              {/* User rows */}
              {filtered.map((user, idx) => (
                <div
                  key={user._id}
                  className="amm-item"
                  onClick={() => handleSelect(user)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                    borderBottom: idx < filtered.length - 1 ? "1px solid #f9fafb" : "none",
                    fontFamily: "DM Sans, sans-serif",
                    background: "#fff",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: PRIMARY_LIGHT,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: PRIMARY_DARK, fontSize: 14, fontWeight: 700,
                  }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="amm-item-name"
                      style={{
                        margin: 0, fontSize: 13, fontWeight: 600, color: "#111827",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        transition: "color 0.13s",
                      }}
                    >
                      {user.name}
                    </p>
                    <p style={{
                      margin: 0, fontSize: 11, color: "#9ca3af",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>
                      {user.email}
                    </p>
                  </div>

                  {/* Role badge */}
                  <span
                    className="amm-item-badge"
                    style={{
                      fontSize: 10, fontWeight: 600, padding: "3px 8px",
                      borderRadius: 999, background: "#f3f4f6",
                      color: "#6b7280", whiteSpace: "nowrap", flexShrink: 0,
                      transition: "all 0.13s",
                    }}
                  >
                    {user.role?.label || user.role?.name}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────── */
export default function AssignManagerModal({ onClose }) {
  const [selectedAgent,   setSelectedAgent]   = useState(null);
  const [selectedManager, setSelectedManager] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const canSubmit = selectedAgent && selectedManager && !loading;

  const handleAssign = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await assignManager({
        salesagentId: selectedAgent._id,
        managerId:    selectedManager._id,
      });
      setSuccess(true);
      setTimeout(() => onClose?.(), 2400);
    } catch (err) {
      toast.error(err?.message || "Assignment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>

      {/* ── Overlay ── */}
      <div
        className="amm-overlay-anim"
        style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 16,
          background: "rgba(220,240,228,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        {/* ── Card ── */}
        <div
          className="amm-card-anim amm-scroll amm-top-line"
          style={{
            position: "relative",
            width: "100%", maxWidth: 460,
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto", overflowX: "hidden",
            borderRadius: 22, padding: "32px 28px 28px",
            background: "#ffffff",
            border: "1px solid rgba(39,174,96,0.18)",
            boxShadow: "0 8px 48px rgba(39,174,96,0.10), 0 2px 16px rgba(0,0,0,0.06)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {/* Glow blob */}
          <div style={{
            pointerEvents: "none", position: "absolute",
            top: -70, right: -50, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(39,174,96,0.10) 0%, transparent 70%)",
          }} />

          {/* ── Close ── */}
          <button
            style={{
              position: "sticky", top: 0, float: "right",
              width: 30, height: 30, marginBottom: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, fontSize: 12, cursor: "pointer",
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              color: "#9ca3af", transition: "all 0.18s", flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = "#fee2e2";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.color       = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "#f3f4f6";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color       = "#9ca3af";
            }}
            onClick={onClose}
            aria-label="Close"
          >✕</button>

          {/* ── Success ── */}
          {success ? (
            <div className="amm-success-anim"
              style={{ textAlign: "center", paddingTop: 18, paddingBottom: 6 }}>
              <div className="amm-pop-anim" style={{
                width: 78, height: 78, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px", fontSize: 32, color: "#fff",
                background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                boxShadow: `0 0 0 6px ${PRIMARY_MID}, 0 0 40px rgba(39,174,96,0.25)`,
              }}>✓</div>

              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 20,
                fontWeight: 800, marginBottom: 8, color: "#111827",
              }}>
                Manager Assigned!
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.8, color: "#6b7280" }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  {selectedAgent?.name}
                </span>{" "}has been assigned to{" "}
                <span style={{ fontWeight: 600, color: PRIMARY_DARK }}>
                  {selectedManager?.name}
                </span>
              </div>

              <div style={{
                height: 2, borderRadius: 999, overflow: "hidden",
                marginTop: 24, background: "#e5e7eb",
              }}>
                <div className="amm-fill-anim" style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${PRIMARY}, #2ecc71)`,
                }} />
              </div>
            </div>

          ) : (
            <>
              {/* Eyebrow */}
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                marginBottom: 6, color: PRIMARY,
              }}>
                Team Management
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 600,
                marginBottom: 20, lineHeight: 1.3, color: "#111827",
              }}>
                Assign Manager
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

              {/* Sales Agent */}
              <SearchField
                label="Sales Agent"
                roleQuery="sales_agent"
                value={selectedAgent}
                onChange={setSelectedAgent}
              />

              {/* Connector arrow */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                margin: "2px 0 14px",
              }}>
                <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: PRIMARY_LIGHT,
                  border: `1px solid rgba(39,174,96,0.25)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: PRIMARY, fontSize: 14, fontWeight: 700,
                }}>↓</div>
                <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
              </div>

              {/* Sales Manager */}
              <SearchField
                label="Sales Manager"
                roleQuery="sales_manager"
                value={selectedManager}
                onChange={setSelectedManager}
              />

              {/* Preview */}
              {selectedAgent && selectedManager && (
                <div style={{
                  marginTop: 6, padding: "12px 14px",
                  background: PRIMARY_LIGHT,
                  border: `1px solid rgba(39,174,96,0.22)`,
                  borderRadius: 12, fontFamily: "DM Sans, sans-serif",
                }}>
                  <p style={{
                    margin: "0 0 10px", fontSize: 10, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase", color: PRIMARY,
                  }}>
                    Assignment Preview
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>

                    {/* Agent */}
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", background: "#fff",
                      borderRadius: 10, border: "1px solid rgba(39,174,96,0.15)", minWidth: 0,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                        background: "#dbeafe", color: "#1d4ed8",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {selectedAgent.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#111827",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {selectedAgent.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>Sales Agent</p>
                      </div>
                    </div>

                    <span style={{ color: PRIMARY, fontSize: 16, fontWeight: 700, flexShrink: 0 }}>→</span>

                    {/* Manager */}
                    <div style={{
                      flex: 1, display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 10px", background: "#fff",
                      borderRadius: 10, border: "1px solid rgba(39,174,96,0.15)", minWidth: 0,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                        background: PRIMARY_LIGHT, color: PRIMARY_DARK,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {selectedManager.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "#111827",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {selectedManager.name}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}>Sales Manager</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assign button */}
              <button
                style={{
                  width: "100%", marginTop: 20,
                  padding: "13px 0", borderRadius: 12, border: "none",
                  color: "#fff", fontFamily: "DM Sans, sans-serif",
                  fontSize: 14, fontWeight: 600, letterSpacing: "0.04em",
                  cursor: !canSubmit ? "not-allowed" : "pointer",
                  opacity: !canSubmit ? 0.35 : 1,
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  boxShadow: "0 4px 20px rgba(39,174,96,0.28)",
                  transition: "all 0.18s",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) {
                    e.currentTarget.style.transform  = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(39,174,96,0.38)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform  = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(39,174,96,0.28)";
                }}
                onMouseDown={(e) => {
                  if (canSubmit) e.currentTarget.style.transform = "scale(0.99)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onClick={handleAssign}
                disabled={!canSubmit}
              >
                {loading ? (
                  <div className="amm-spin-anim" style={{
                    width: 15, height: 15, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderTopColor: "white",
                  }} />
                ) : (
                  <>Assign Manager →</>
                )}
              </button>

              {/* Cancel */}
              <button
                style={{
                  background: "transparent", border: "none",
                  fontSize: 13, cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center", gap: 5,
                  marginTop: 12, color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif", transition: "all 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                onClick={onClose}
              >
                ← Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
