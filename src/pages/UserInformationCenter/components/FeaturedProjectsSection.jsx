// src/features/users/components/FeaturedProjectsSection.jsx
import React, { useState } from "react";
import { Star, MapPin } from "lucide-react";
import AccordionSection from "./AccordionSection";
import { C, Badge, Skel, Empty, fmtDate } from "./shared";
import {
  useUserFeaturedProjects,
  useUserFeaturedProjectCounts,
} from "../../UserInformationCenter/useUserDetail";
import { useNavigate } from "react-router-dom";

const PROJECT_TYPES = [
  { key: "featured", label: "⭐ Featured", color: C.info },
  { key: "prime", label: "💎 Prime", color: C.purple },
  { key: "normal", label: "📌 Normal", color: C.sub },
  { key: "sponsored", label: "📢 Sponsored", color: C.warn },
];

const ProjectCard = ({ p, type }) => {
    const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
//   const thumb =
//     !imgError &&
//     (p.gallery?.[0]?.url || p.images?.[0]?.url || p.thumbnail || p.coverImage);
const thumb =
  !imgError &&
  (p.heroImage || // ✅ main banner
    p.logo?.url || // ✅ fallback logo
    p.gallerySummary?.[0]?.url); // ✅ gallery image

  return (
    <div
      style={{
        borderRadius: "14px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        background: C.card,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "130px",
          background: thumb
            ? "transparent"
            : `linear-gradient(135deg, ${C.accent}22, ${C.accent}44)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "32px", opacity: 0.35 }}>🏗️</span>
        )}
        <div style={{ position: "absolute", top: "8px", left: "8px" }}>
          <Badge status={type} />
        </div>
        {p.rank !== undefined && p.rank !== null && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              borderRadius: "7px",
              padding: "3px 8px",
              fontSize: "10px",
              fontWeight: "700",
              color: "#fff",
            }}
          >
            #{p.rank}
          </div>
        )}
        {p.status === "active" && (
          <div
          style={{
            position: "absolute",
            top: "100px",
            right: "100px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            borderRadius: "7px",
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "700",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() => window.open(`https://propenu.com/prime/${p.slug}`, "_blank")}
        >
          View
        </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "100px",
            right: "8px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            borderRadius: "7px",
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "700",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/post-property/${p._id}`)}
        >
          Edit
        </div>
      </div>
      <div style={{ padding: "12px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "12px",
            fontWeight: "800",
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {p.title || p.name || "Untitled Project"}
        </p>
        {(p.city || p.location?.city) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              marginTop: "4px",
            }}
          >
            <MapPin size={10} color={C.muted} />
            <p style={{ margin: 0, fontSize: "10px", color: C.muted }}>
              {p.city || p.location?.city}
              {(p.state || p.location?.state) &&
                `, ${p.state || p.location?.state}`}
            </p>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "5px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          {p.propertyType && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 7px",
                borderRadius: "99px",
                background: C.infoLight,
                color: C.info,
              }}
            >
              {p.propertyType}
            </span>
          )}
          {p.status && <Badge status={p.status} />}
        </div>
        {p._id && (
          <div
            style={{
              marginTop: "8px",
              paddingTop: "8px",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "9px",
                color: C.muted,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {p._id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturedContent = ({ userId }) => {
  const [type, setType] = useState("featured");
  const { data, isLoading } = useUserFeaturedProjects(userId, type);
  const projects = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.projects)
        ? data.projects
        : Array.isArray(data?.items)
          ? data.items
          : [];

          
    const filteredProperties = projects.filter(
      (p) => String(p.createdBy) === String(userId),
    );

    const counts = useUserFeaturedProjectCounts(userId);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        {PROJECT_TYPES.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setType(key)}
            style={{
              padding: "6px 13px",
              borderRadius: "99px",
              border: `1.5px solid ${type === key ? color : C.border}`,
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              background: type === key ? color + "18" : "#fff",
              color: type === key ? color : C.sub,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {label}
            <span
              style={{
                marginLeft: "6px",
                fontSize: "10px",
                fontWeight: "700",
                opacity: 0.7,
              }}
            >
              ({counts[key] || 0})
            </span>
          </button>
        ))}
      </div>
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "10px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skel key={i} h="200px" radius="14px" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <Empty msg={`No ${type} projects`} icon="🏗️" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "10px",
          }}
        >
          {filteredProperties.map((p) => (
            <ProjectCard key={p._id} p={p} type={type} />
          ))}
        </div>
      )}
    </>
  );
};

const FeaturedProjectsSection = ({ userId, flat }) => {
  const { data, isLoading } = useUserFeaturedProjects(userId, "featured");
  const projects = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

      const filteredProjects = projects.filter(
        (p) => String(p.createdBy) === String(userId),
      );

  if (flat) return <FeaturedContent userId={userId} />;

  return (
    <AccordionSection
      title="Featured Projects"
      icon={Star}
      accent={C.warn}
      badge={filteredProjects.length || undefined}
    >
      <FeaturedContent userId={userId} />
    </AccordionSection>
  );
};

export default FeaturedProjectsSection;
