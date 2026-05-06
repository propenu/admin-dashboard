// src/features/users/components/UserProfileCard.jsx
import React from "react";
import { Mail, Phone, MapPin, Shield, Calendar, Hash } from "lucide-react";
import { C, Badge, Skel, fmtDate } from "./shared";

const InfoItem = ({ icon: Icon, label, value, color, mono }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      padding: "8px 10px",
      background: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #eef2f7",
    }}
  >
    <div
      style={{
        width: "26px",
        height: "26px",
        borderRadius: "7px",
        background: (color || C.accent) + "16",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: "1px",
      }}
    >
      <Icon size={12} color={color || C.accent} strokeWidth={2.2} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p
        style={{
          margin: 0,
          fontSize: "9px",
          fontWeight: "700",
          color: C.muted,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: "11px",
          fontWeight: "600",
          color: color || C.text,
          wordBreak: "break-all",
          fontFamily: mono ? "'JetBrains Mono', monospace" : "inherit",
        }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const UserProfileCard = ({ user, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          background: C.card,
          borderRadius: "18px",
          border: `1px solid ${C.border}`,
          padding: "20px",
          marginBottom: "14px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <Skel w="64px" h="64px" radius="16px" />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <Skel w="55%" h="20px" />
            <Skel w="35%" h="13px" />
            <div style={{ display: "flex", gap: "6px" }}>
              <Skel w="70px" h="22px" radius="99px" />
              <Skel w="80px" h="22px" radius="99px" />
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skel key={i} h="46px" radius="10px" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const kycColor =
    user.kyc?.status === "verified"
      ? C.accent
      : user.kyc?.status === "not_started"
        ? C.muted
        : C.warn;

  // const accountStatusKey =
  //   user.accountStatus === "active"
  //     ? "active"
  //     : user.accountStatus === "kyc_pending"
  //       ? "kyc_pending"
  //       : user.accountStatus === "location_pending"
  //         ? "location_pending"
  //         : "inactive";

  const accountStatusKey =
    user.accountStatus === "active"
      ? "active"
      : user.accountStatus === "kyc_pending"
        ? "kyc_pending"
        : user.accountStatus === "location_pending"
          ? "location_pending"
          : user.accountStatus === "pending"
            ? "pending"
            : "inactive"; // fallback

  return (
    <div
      style={{
        background: C.card,
        borderRadius: "18px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        marginBottom: "14px",
        animation: "fadeUp 0.3s ease forwards",
      }}
    >
      {/* Gradient strip */}
      <div
        style={{
          height: "4px",
          background: `linear-gradient(90deg, ${C.accent} 0%, #34d399 50%, #06b6d4 100%)`,
        }}
      />

      <div style={{ padding: "18px" }}>
        {/* Avatar row */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "16px",
              background: `linear-gradient(145deg, ${C.accent}, ${C.accentDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "22px",
              fontWeight: "900",
              flexShrink: 0,
              letterSpacing: "-1px",
              boxShadow: `0 4px 14px ${C.accent}44`,
            }}
          >
            {initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "800",
                color: C.text,
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
              }}
            >
              {user.name}
            </h2>
            <p
              style={{
                margin: "3px 0 8px",
                fontSize: "10px",
                color: C.muted,
                fontWeight: "600",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {user.userCode || user._id?.slice(0, 16) + "…"}
            </p>
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
              {/* <Badge status={accountStatusKey} /> */}
              {user.accountStatus && <Badge status={user.accountStatus} />}
              <span
                style={{
                  padding: "3px 9px",
                  borderRadius: "99px",
                  fontSize: "10px",
                  fontWeight: "700",
                  background: C.purpleLight,
                  color: C.purple,
                  letterSpacing: "0.03em",
                }}
              >
                {user.roleName?.replace(/_/g, " ").toUpperCase()}
              </span>
              {user.phoneVerified && (
                <span
                  style={{
                    padding: "3px 9px",
                    borderRadius: "99px",
                    fontSize: "10px",
                    fontWeight: "700",
                    background: "#dcfce7",
                    color: "#15803d",
                  }}
                >
                  ✓ Phone
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px",
          }}
        >
          <InfoItem icon={Mail} label="Email" value={user.email} />
          <InfoItem icon={Phone} label="Phone" value={user.phone} />
          <InfoItem
            icon={MapPin}
            label="Location"
            value={[user.city, user.state].filter(Boolean).join(", ")}
          />
          <InfoItem
            icon={Shield}
            label="KYC Status"
            value={user.kyc?.status?.replace(/_/g, " ")}
            color={kycColor}
          />
          {user.locality && (
            <InfoItem
              icon={MapPin}
              label="Locality / PIN"
              value={`${user.locality}, ${user.pincode || ""}`}
            />
          )}
          <InfoItem
            icon={Calendar}
            label="Joined"
            value={fmtDate(user.createdAt)}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
