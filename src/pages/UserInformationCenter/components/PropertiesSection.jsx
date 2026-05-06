// src/features/users/components/PropertiesSection.jsx
import React, { useState } from "react";
import { Home, Building, Landmark, Leaf, MapPin, Calendar } from "lucide-react";
import AccordionSection from "./AccordionSection";
import { C, Badge, Skel, Empty, fmtDate } from "./shared";
import { useUserProperties, useUserPropertyCounts } from "../../UserInformationCenter/useUserDetail";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { key: "residential", label: "🏠 Residential", color: C.accent },
  { key: "commercial", label: "🏢 Commercial", color: C.info },
  { key: "land", label: "🌍 Land", color: C.warn },
  { key: "agricultural", label: "🌾 Agricultural", color: "#16a34a" },
];
const formatPriceINR = (price) => {
  if (!price) return "";

  const num = Number(price);

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }

  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }

  return `₹${num.toLocaleString("en-IN")}`;
};
const PropertyCard = ({ p, catColor, category }) => {
    const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);
  const thumb =
    !imgErr &&
    (p.gallery?.[0]?.url ||
      p.images?.[0]?.url ||
      p.gallery?.[0] ||
      p.coverImage ||
      p.thumbnail);
  const title =
    p.title ||
    p.basicDetails?.title ||
    p.basicDetails?.projectName ||
    "Untitled";
  const city = p.city || p.locationDetails?.city || p.location?.city;
  const state = p.state || p.locationDetails?.state || p.location?.state;
  const locality =
    p.locality || p.locationDetails?.locality || p.location?.locality;
  const price =
    p.price || p.basicDetails?.expectedPrice || p.basicDetails?.price;

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
          height: "120px",
          background: thumb
            ? "transparent"
            : `linear-gradient(135deg, ${catColor}22, ${catColor}44)`,
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
            alt={title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: "28px", opacity: 0.35 }}>🏠</span>
        )}
        <div style={{ position: "absolute", top: "7px", left: "7px" }}>
          <Badge status={p.status || "normal"} />
        </div>
        {price && (
          <div
            style={{
              position: "absolute",
              bottom: "7px",
              right: "7px",
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              borderRadius: "7px",
              padding: "3px 8px",
              fontSize: "10px",
              fontWeight: "800",
              color: "#fff",
            }}
          >
            {formatPriceINR(price)}
          </div>
        )}
        {/* <div
          style={{
            position: "absolute",
            bottom: "7px",
            right: "110px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            borderRadius: "7px",
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "800",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() =>
            window.open(`http://propenu.com/${category}/${p.slug}`, "_blank")
          }
        >
          View
        </div> */}
        {p.status === "active" && (
          <div
            style={{
              position: "absolute",
              bottom: "7px",
              right: "110px",
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
              borderRadius: "7px",
              padding: "3px 8px",
              fontSize: "10px",
              fontWeight: "800",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() =>
              window.open(
                `https://propenu.com/properties/${category}/${p.slug}`,
                "_blank",
              )
            }
          >
            View
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "7px",
            right: "70px",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            borderRadius: "7px",
            padding: "3px 8px",
            fontSize: "10px",
            fontWeight: "800",
            color: "#fff",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/edit-property/${p._id}`)}
        >
          Edit
        </div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            fontWeight: "800",
            color: C.text,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </p>
        {(locality || city) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              marginTop: "3px",
            }}
          >
            <MapPin size={9} color={C.muted} />
            <p
              style={{
                margin: 0,
                fontSize: "10px",
                color: C.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {[locality, city, state].filter(Boolean).join(", ")}
            </p>
          </div>
        )}
        <div
          style={{
            display: "flex",
            gap: "4px",
            flexWrap: "wrap",
            marginTop: "6px",
          }}
        >
          {p.basicDetails?.bhk && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "99px",
                background: C.purpleLight,
                color: C.purple,
              }}
            >
              {p.basicDetails.bhk} BHK
            </span>
          )}
          {p.basicDetails?.propertyType && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "99px",
                background: C.infoLight,
                color: C.info,
              }}
            >
              {p.basicDetails.propertyType}
            </span>
          )}
          {p.listingType && (
            <span
              style={{
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "99px",
                background: "#f1f5f9",
                color: C.sub,
              }}
            >
              {p.listingType}
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginTop: "8px",
            paddingTop: "6px",
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <Calendar size={9} color={C.muted} />
          <p style={{ margin: 0, fontSize: "9px", color: C.muted }}>
            {fmtDate(p.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

const PropertiesContent = ({ userId }) => {
  const [cat, setCat] = useState("residential");
  const catObj = CATEGORIES.find((c) => c.key === cat);
  const { data, isLoading } = useUserProperties(userId, cat);
  const properties = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : [];

        const filteredProperties = properties.filter(
          (p) => String(p.createdBy?._id) === String(userId),
        );

        console.log("USER ID =>", userId);

        console.log("FILTERED PROPERTIES =>", filteredProperties);

        console.log(
          "ALL PROPERTY CREATED BY IDS =>",
          properties.map((p) => ({
            propertyId: p._id,
            createdBy: p.createdBy?._id,
          })),
        );

        const counts = useUserPropertyCounts(userId);

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
        {CATEGORIES.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setCat(key)}
            style={{
              padding: "6px 13px",
              borderRadius: "99px",
              border: `1.5px solid ${cat === key ? color : C.border}`,
              fontSize: "11px",
              fontWeight: "700",
              cursor: "pointer",
              background: cat === key ? color + "18" : "#fff",
              color: cat === key ? color : C.sub,
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {label}
            <span
              style={{
                marginLeft: "6px",
                fontSize: "9px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "999px",
                background: "#f1f5f9",
              }}
            >
              {counts[key] || 0}
            </span>
          </button>
        ))}
      </div>
      {isLoading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <Skel key={i} h="190px" radius="14px" />
          ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        <Empty msg={`No ${cat} properties`} icon="🏠" />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          {filteredProperties.map((p) => (
            <PropertyCard
              key={p._id}
              p={p}
              catColor={catObj?.color || C.accent}
              category={cat}
            />
          ))}
        </div>
      )}
    </>
  );
};

const PropertiesSection = ({ userId, flat }) => {
  const { data } = useUserProperties(userId, "residential");
  const count = Array.isArray(data)
    ? data.length
    : Array.isArray(data?.items)
      ? data.items.length
      : 0; 

      const properties = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
            ? data.data
            : [];

      const filteredProperties = properties.filter(
        (p) => String(p.createdBy?._id) === String(userId),
      );

      console.log("USER ID =>", userId);

      console.log("FILTERED PROPERTIES =>", filteredProperties);

      console.log(
        "ALL PROPERTY CREATED BY IDS =>",
        properties.map((p) => ({
          propertyId: p._id,
          createdBy: p.createdBy?._id,
        })),
      );


      const counts = useUserPropertyCounts(userId);

  if (flat) return <PropertiesContent userId={userId} />;

  return (
    <AccordionSection
      title="Properties"
      icon={Home}
      accent={C.purple}
      badge={count || undefined}
    >
      <PropertiesContent userId={userId} />
    </AccordionSection>
  );
};

export default PropertiesSection;
