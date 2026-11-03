// src/features/users/components/FeaturedProjectsSection.jsx
import React, { useCallback, useState } from "react";
import { Star, MapPin, Calendar } from "lucide-react";
import AccordionSection from "./AccordionSection";
import { C, Badge, Skel, Empty, fmtDate } from "./shared";
import {
  useUserFeaturedProjects,
  useUserFeaturedProjectCounts,
} from "../../UserInformationCenter/useUserDetail";
import { useNavigate, useLocation } from "react-router-dom";
import { ProjectSubscriptionDrawer } from "./BuilderSubscriptionsSection";
import Pager from "./Pager";

/** The five subscription plans plus Normal; `base` is the placement used for badges and public links. */
const PROJECT_TYPES = [
  { key: "all", base: null, label: "🏗️ All projects", color: C.accent },
  { key: "prime_only", base: "prime", label: "💎 Prime", color: C.purple },
  { key: "prime_sponsored", base: "prime", label: "💎 Prime + Sponsored", color: C.purple },
  { key: "featured_only", base: "featured", label: "⭐ Top Selling", color: C.info },
  { key: "featured_sponsored", base: "featured", label: "⭐ Top Selling + Sponsored", color: C.info },
  { key: "sponsored_only", base: "sponsored", label: "📢 Sponsored", color: C.warn },
  { key: "normal", base: "normal", label: "📌 Normal", color: C.sub },
];

const baseTypeOf = (key) => PROJECT_TYPES.find((item) => item.key === key)?.base || key;

/** Plan key for one project, used on the "All projects" tab where each card has its own plan. */
const planKeyOfProject = (p) => {
  const promoType = String(p?.promotion?.type || "normal").toLowerCase();
  const sponsored = Boolean(p?.promotion?.sponsoredEnabled);
  if (promoType === "prime") return sponsored ? "prime_sponsored" : "prime_only";
  if (promoType === "featured") return sponsored ? "featured_sponsored" : "featured_only";
  if (promoType === "sponsored") return "sponsored_only";
  return "normal";
};
const labelOf = (key) => PROJECT_TYPES.find((item) => item.key === key)?.label.replace(/^\S+\s/, "") || key;

const publicProjectPath = (type, slug) => {
  if (!slug) return null;
  const route = type === "prime" ? "prime" : "project";
  return `https://propenu.com/${route}/${slug}`;
};

const DAY_MS = 1000 * 60 * 60 * 24;

/** Days left on active promotion (or plan end) for Propenu project cards. */
const remainingDaysOf = (p) => {
  const raw =
    p?.promotion?.boostExpiry ||
    p?.promotion?.expiresAt ||
    p?.promotion?.endDate ||
    p?.boostExpiry ||
    p?.expiresAt ||
    p?.lastEnd ||
    null;
  if (!raw) return null;
  const end = new Date(raw);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / DAY_MS);
};

const remainingLabel = (days) => {
  if (days == null) return null;
  if (days < 0) return "Expired";
  if (days === 0) return "Ends today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

const ProjectCard = ({ p, type, planLabel, onOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
  const [imgError, setImgError] = useState(false);
  const daysLeft = remainingDaysOf(p);
  const remainText = remainingLabel(daysLeft);
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
      role="button"
      tabIndex={0}
      title="Open subscription details"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen?.();
        }
      }}
      style={{
        borderRadius: "14px",
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        background: C.card,
        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        cursor: "pointer",
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
          <Badge status={type} label={planLabel} />
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
          onClick={(event) => {
            event.stopPropagation();
            const url = publicProjectPath(type, p.slug);
            if (url) window.open(url, "_blank", "noopener,noreferrer");
          }}
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
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/post-property/${p._id}`, {
              state: { from: location.pathname },
            });
          }}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "6px",
            marginTop: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Calendar size={9} color={C.muted} />
            <p style={{ margin: 0, fontSize: "9px", color: C.muted }}>
              {fmtDate(p.createdAt)}
            </p>
          </div>
          {remainText ? (
            <span
              style={{
                fontSize: "9px",
                fontWeight: 800,
                padding: "2px 7px",
                borderRadius: "99px",
                background:
                  daysLeft != null && daysLeft <= 7 ? "#fef2f2" : "#ecfdf5",
                color:
                  daysLeft != null && daysLeft <= 7 ? "#dc2626" : "#15803d",
              }}
              title="Time remaining"
            >
              {remainText}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const FeaturedContent = ({ userId }) => {
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [openProject, setOpenProject] = useState(null);
  const closeDrawer = useCallback(() => setOpenProject(null), []);

  const { data, isLoading, isFetching } = useUserFeaturedProjects(
    userId,
    type === "all" ? "" : type,
    page,
    12,
  );

  const projects = data?.items || [];
  const totalPages = data?.meta?.totalPages || data?.meta?.pages || 1;
  const total = Number(data?.meta?.total) || 0;
  const pageSize = Number(data?.meta?.limit) || 12;

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
            onClick={() => {
              setType(key);
              setPage(1);
            }}
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
      ) : projects.length === 0 ? (
        <Empty msg={`No ${labelOf(type)} projects`} icon="🏗️" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "10px",
          }}
        >
          {projects.map((p) => {
            const key = type === "all" ? planKeyOfProject(p) : type;
            return (
              <ProjectCard
                key={p._id}
                p={p}
                type={baseTypeOf(key)}
                planLabel={labelOf(key)}
                onOpen={() =>
                  setOpenProject({
                    projectId: String(p._id),
                    title: p.title || p.name || "Project",
                    image: p.heroImage || p.logo?.url || p.gallerySummary?.[0]?.url || null,
                    location: [p.locality, p.city].filter(Boolean).join(", ") || null,
                    latestPlan: labelOf(key),
                    lastEnd:
                      p?.promotion?.boostExpiry ||
                      p?.promotion?.expiresAt ||
                      p?.promotion?.endDate ||
                      p?.boostExpiry ||
                      p?.expiresAt ||
                      null,
                    state: "active",
                  })
                }
              />
            );
          })}
        </div>
      )}
      {openProject ? (
        <ProjectSubscriptionDrawer userId={userId} project={openProject} onClose={closeDrawer} />
      ) : null}
      {!isLoading ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Pager
            page={page}
            pages={totalPages}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            loading={isFetching}
            noun={total === 1 ? "project" : "projects"}
          />
        </div>
      ) : null}
    </>
  );
};

const FeaturedProjectsSection = ({ userId, flat }) => {
  const { data } = useUserFeaturedProjects(userId, "featured", 1, 1);

  if (flat) return <FeaturedContent userId={userId} />;

  return (
    <AccordionSection
      title="Featured Projects"
      icon={Star}
      accent={C.warn}
      // badge={filteredProjects.length || undefined}
      badge={data?.meta?.total || undefined}
    >
      <FeaturedContent userId={userId} />
    </AccordionSection>
  );
};

export default FeaturedProjectsSection;
