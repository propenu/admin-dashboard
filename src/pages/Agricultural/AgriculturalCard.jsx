// frontend/admin-dashboard/src/pages/Land/LandCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveCategory } from "../../store/Ui/uiSlice";
import { propertiesAnalytics } from "../../features/property/propertyService";
import { getUserDetails } from "../../features/user/userService";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { actions } from "../../store/newIndex";

import {
  MapPin,
  Eye,
  FileCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  AreaChart,
  MapIcon,
  Leaf,
  Download,
  Home,
  X,
  Phone,
  User,
  BarChart3,
  Mail,
  BadgeCheck,
  MessageSquare,
  CalendarDays,
} from "lucide-react";

import FALLBACK from "../../assets/fallback.svg";

const formatPrice = (price) => {
  if (!price || isNaN(price)) return "Price on Request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

export default function AgriculturalCard({ property, userRole }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openLeads, setOpenLeads] = useState(false);


  

  const UserRoleName = userRole

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["projectLeads", property?._id],
    queryFn: async () => {
      const res = await propertiesAnalytics(property?._id);
      return res.data;
    },
    enabled: !!property?._id,
  });

   

  const leads = Array.isArray(leadsData?.data) ? leadsData.data : [];
  const totalLeads = typeof leadsData?.count === "number" ? leadsData.count : leads.length;


  
  

  const downloadCSV = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1, Name: lead.name, Phone: lead.phone,
      Status: lead.status, Date: new Date(lead.createdAt).toLocaleString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    saveAs(new Blob([XLSX.utils.sheet_to_csv(ws)], { type: "text/csv;charset=utf-8;" }), `project-leads-${property?._id}.csv`);
  };

  const downloadExcel = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1, Name: lead.name, Phone: lead.phone,
      Status: lead.status, Date: new Date(lead.createdAt).toLocaleString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Property Leads");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }),
      `project-leads-${property?._id}.xlsx`
    );
  };

  // const getDocStatus = () => {
  //   const docs = property?.verificationDocuments || [];
  //   if (docs.length === 0) return { label: "No Docs", color: "text-slate-500 bg-slate-100", icon: AlertCircle };
  //   if (docs.some((d) => d.status === "rejected")) return { label: "Rejected", color: "text-red-600 bg-red-50", icon: AlertCircle };
  //   if (docs.some((d) => d.status === "pending")) return { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock };
  //   if (docs.every((d) => d.status === "verified")) return { label: "Verified", color: "text-green-600 bg-green-50", icon: FileCheck };
  //   return { label: "Draft", color: "text-blue-600 bg-blue-50", icon: Clock };
  // };

  // const statusInfo = getDocStatus();
  // const completion = property?.completion?.percent || 0;
  // const isPendingReview = property?.verificationDocuments?.some((d) => d.status === "pending");

  const getDocStatus = () => {
    switch (property?.status) {
      case "active":
        return {
          label: "Verified",
          color: "text-green-600 bg-green-50",
          icon: FileCheck,
        };

      case "pending":
        return {
          label: "Pending",
          color: "text-amber-600 bg-amber-50",
          icon: Clock,
        };

      case "draft":
      default:
        return {
          label: "Draft",
          color: "text-slate-600 bg-slate-100",
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getDocStatus();
  const completion = property?.completion?.percent || 0;
  const isCompleted = property?.completion?.percent;

  const isPendingReview = property?.status === "pending";

  return (
    <div
      onClick={() => navigate(`/property/agricultural/${property?._id}`)}
      className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-[#27AE60]/30 hover:shadow-md transition-all duration-300 cursor-pointer"
    >
      {/* ── HORIZONTAL FLEX ─────────────────────────────────────────────── */}
      <div className="flex flex-row">
        {/* ── LEFT: IMAGE ─────────────────────────────────────────────── */}
        <div className="relative w-28 max-h-[140px] flex-shrink-0 overflow-hidden bg-slate-100">
          <img
            src={property?.gallery?.[0]?.url || FALLBACK}
            alt={property?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ minHeight: "120px" }}
          />

          {/* Agent badge */}
          {isCompleted === 70 && (
            <div
              className="
      absolute -left-5 bottom-3 rotate-45
      bg-white
      border-2 border-[#27AE60]
      px-5 py-0.5
      rounded-sm
      shadow-[0_0_20px_rgba(255,255,255,1),0_0_12px_rgba(39,174,96,0.9)]
    "
            >
              <span
                className="
        block text-center
        text-[#27AE60]
        text-[7px]
        font-black
        uppercase
        tracking-[2px]
      "
              >
                AGENT
              </span>
            </div>
          )}

          {/* Doc status badge */}
          <div
            className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase flex items-center gap-0.5 ${statusInfo.color}`}
          >
            <statusInfo.icon className="w-2 h-2" />
            {statusInfo.label}
          </div>

          {/* Photo count */}
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/50 text-white text-[8px] rounded-md flex items-center gap-0.5">
            <ImageIcon className="w-2 h-2" />
            {property?.gallery?.length || 0}
          </div>
        </div>

        {/* ── RIGHT: CONTENT ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-between">
          {/* Top: title + status + progress + price */}
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                  {property?.status || "Unknown"}
                </span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-slate-400">
                    {completion}%
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-xs leading-tight line-clamp-1 group-hover:text-[#27AE60] transition-colors">
                {property?.title || "Unnamed Property"}
              </h3>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right">
              <span className="text-[11px] font-black text-[#27AE60]">
                {typeof property?.price === "number"
                  ? formatPrice(property.price)
                  : "--"}
              </span>
              {property?.pricePerSqft && (
                <p className="text-[8px] text-slate-400">
                  ₹{property.pricePerSqft}/sqft
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-slate-500 text-[9px] mb-1.5">
            <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-[#27AE60]" />
            <span className="truncate">
              {property?.address}, {property?.city}
            </span>
          </div>

          {/* Features: total area / road width / property type */}
          <div className="flex items-center gap-2 text-[9px] text-slate-600 mb-1.5">
            <span className="flex items-center gap-0.5">
              <AreaChart className="w-2.5 h-2.5 text-slate-400" />
              <span className="font-semibold">
                {property?.totalArea?.value || 0}
              </span>
              <span className="text-[8px]"> area</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-0.5">
              <MapIcon className="w-2.5 h-2.5 text-slate-400" />
              <span className="font-semibold">
                {property?.roadWidth?.value || 0}
              </span>
              <span className="text-[8px]"> road width</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-0.5">
              <Leaf className="w-2.5 h-2.5 text-slate-400" />
              <span className="font-semibold truncate max-w-[60px]">
                {property?.propertyType
                  ?.split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ") || "N/A"}
              </span>
            </span>
          </div>

          {/* Posted by */}
          <div className="flex items-center gap-1 text-[9px] text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-600">By:</span>
            <span className="text-[#27AE60] font-semibold truncate">
              {property?.createdBy?.name
                ?.split(" ")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ") || "Unknown"}
            </span>
            {property?.createdBy?.phone && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 truncate">
                {property.createdBy.phone}
              </span>
            )}
          </div>

          {/* Footer: meta + action buttons */}
          <div className="flex items-center justify-between gap-1 flex-wrap">
            {/* Meta */}
            <div className="flex items-center gap-2 text-[8px] text-slate-400">
              <span className="flex items-center gap-0.5">
                <Eye className="w-2 h-2" /> {property?.meta?.views || 0}
              </span>
              <span>Clicks: {property?.meta?.clicks || 0}</span>
              <span>Inq: {property?.meta?.inquiries || 0}</span>
            </div>

            {/* Action buttons */}
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Leads */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLeads(true);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-[#27AE60]/20 bg-green-50 text-[#27AE60] text-[8px] font-bold hover:bg-green-100 transition"
              >
                <BarChart3 className="w-2.5 h-2.5" />
                {leadsLoading ? "..." : totalLeads}
              </button>

              {isPendingReview &&
              UserRoleName === "super_admin" &&
              isCompleted === 80 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/agricultural-property-verification/${property._id}`,
                    );
                  }}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[8px] font-bold bg-[#27AE60] text-white transition active:scale-95"
                >
                  Review <ChevronRight className="w-2.5 h-2.5" />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setActiveCategory("agricultural"));
                    dispatch(actions.agricultural.hydrateForm(property));
                    localStorage.setItem("editPropertyId", property._id);
                    localStorage.setItem(
                      "editPropertyCategory",
                      "agricultural",
                    );
                    navigate(`/edit-property/${property._id}`);
                  }}
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[8px] font-bold bg-[#27AE60] text-white transition active:scale-95"
                >
                  Edit <ChevronRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── LEADS MODAL ─────────────────────────────────────────────────── */}
      {openLeads && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Property Leads
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Total Leads: {totalLeads}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadCSV();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-[#27AE60] text-xs font-bold hover:bg-green-100 transition"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadExcel();
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLeads(false);
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {leadsLoading ? (
                <div className="py-10 text-center text-slate-400">
                  Loading leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  No leads found
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          "#",
                          "Lead Profile",
                          "Contact",
                          "Property",
                          "Status",
                          "Remarks",
                          "Approval",
                          "Created",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr
                          key={lead._id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-all"
                        >
                          <td className="px-4 py-4 text-sm text-slate-400">
                            {index + 1}
                          </td>
                          <td className="px-4 py-4">
                            <h3 className="font-bold text-slate-800 text-sm">
                              {lead.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                              <User className="w-3 h-3" /> ID:{" "}
                              {lead._id?.slice(-6)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={`tel:${lead.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#27AE60]"
                            >
                              <Phone className="w-4 h-4 text-[#27AE60]" />{" "}
                              {lead.phone}
                            </a>
                            <a
                              href={`mailto:${lead.email}`}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-2 text-xs text-blue-600 hover:underline mt-1"
                            >
                              <Mail className="w-3 h-3" /> {lead.email}
                            </a>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                                <Home className="w-3.5 h-3.5 text-[#27AE60]" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800">
                                  {lead.propertyModel || "Agricultural"}
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Property Model
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold capitalize">
                                {lead.propertyType || "N/A"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold capitalize">
                                {lead.listingType || "sale"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${lead.status === "new" ? "bg-green-100 text-green-700" : lead.status === "contacted" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 max-w-[180px]">
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {lead.remarks || "No remarks"}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {lead.approvedByManager ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                <BadgeCheck className="w-3 h-3" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <p className="text-sm font-semibold text-slate-700">
                              {new Date(lead.createdAt).toLocaleDateString(
                                "en-IN",
                              )}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                              <CalendarDays className="w-3 h-3" />
                              {new Date(lead.createdAt).toLocaleTimeString(
                                "en-IN",
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${lead.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center transition"
                              >
                                <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                              </a>
                              <a
                                href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="w-8 h-8 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center transition"
                              >
                                <img
                                  src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                                  alt="wa"
                                  className="w-3.5 h-3.5"
                                />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}