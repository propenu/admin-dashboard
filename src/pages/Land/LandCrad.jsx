// frontend/admin-dashboard/src/pages/Land/LandCard.jsx
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveCategory } from "../../store/Ui/uiSlice";
import { actions } from "../../store/newIndex";
import { useState } from "react";
import { propertiesAnalytics } from "../../features/property/propertyService";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  MapPin,
  Bed,
  Bath,
  Move,
  Eye,
  FileCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  ChevronRight,
  AreaChart,
  LucidePanelRightDashed,
  LucidePanelLeftDashed,
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

// ✅ Indian Price Formatter
const formatPrice = (price) => {
  if (!price || isNaN(price)) return "Price on Request";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

export default function LandCard({ property }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [openLeads, setOpenLeads] = useState(false);

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["projectLeads", property?._id],

    queryFn: async () => {
      const res = await propertiesAnalytics(property?._id);
      return res.data;
    },

    enabled: !!property?._id,
  });

  const leads = Array.isArray(leadsData?.data) ? leadsData.data : [];

  const totalLeads =
    typeof leadsData?.count === "number" ? leadsData.count : leads.length;


    const downloadCSV = () => {
        const rows = leads.map((lead, index) => ({
          SNo: index + 1,
          Name: lead.name,
          Phone: lead.phone,
          Status: lead.status,
          Date: new Date(lead.createdAt).toLocaleString("en-IN"),
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(rows);
    
        const csv = XLSX.utils.sheet_to_csv(worksheet);
    
        const blob = new Blob([csv], {
          type: "text/csv;charset=utf-8;",
        });
    
        saveAs(blob, `project-leads-${property?._id}.csv`);
      };
    
      const downloadExcel = () => {
        const rows = leads.map((lead, index) => ({
          SNo: index + 1,
          Name: lead.name,
          Phone: lead.phone,
          Status: lead.status,
          Date: new Date(lead.createdAt).toLocaleString("en-IN"),
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(rows);
    
        const workbook = XLSX.utils.book_new();
    
        XLSX.utils.book_append_sheet(workbook, worksheet, "Property Leads");
    
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
    
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
    
        saveAs(blob, `project-leads-${property?._id}.xlsx`);
      };


  // Logic to determine status badge UI
  const getDocStatus = () => {
    const docs = property?.verificationDocuments || [];
    if (docs.length === 0)
      return {
        label: "No Docs",
        color: "text-slate-500 bg-slate-100",
        icon: AlertCircle,
      };
    if (docs.some((d) => d.status === "rejected"))
      return {
        label: "Rejected",
        color: "text-red-600 bg-red-50",
        icon: AlertCircle,
      };
    if (docs.some((d) => d.status === "pending"))
      return {
        label: "Pending Review",
        color: "text-amber-600 bg-amber-50",
        icon: Clock,
      };
    if (docs.every((d) => d.status === "verified"))
      return {
        label: "Verified",
        color: "text-green-600 bg-green-50",
        icon: FileCheck,
      };
    return { label: "Draft", color: "text-blue-600 bg-blue-50", icon: Clock };
  };

  const statusInfo = getDocStatus();
  const completion = property?.completion?.percent || 0;
  const isPendingReview = property?.verificationDocuments?.some(
    (d) => d.status === "pending",
  );

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#27AE60]/30 hover:shadow-xl hover:shadow-green-900/5 transition-all duration-300 flex flex-col md:flex-row p-3 gap-5">
      {/* --- Image Section --- */}
      <div className="relative w-full md:w-72 h-52 shrink-0 rounded-xl overflow-hidden bg-slate-100">
        <img
          src={property?.gallery?.[0]?.url || FALLBACK}
          alt={property?.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Status Badge Over Image */}
        <div
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm backdrop-blur-md ${statusInfo.color}`}
        >
          <statusInfo.icon className="w-3 h-3" />
          {statusInfo.label}
        </div>
        {/* Photo Count */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-lg flex items-center gap-1">
          <ImageIcon className="w-3 h-3" /> {property?.gallery?.length || 0}
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="flex-grow flex flex-col">
        {/* Top Info */}
        <div className="flex justify-between items-start mb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                {property?.status || "Unknown"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-slate-500">
                  {completion}% done
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-[#27AE60] transition-colors">
              {property?.title || "Unnamed Property"}
            </h2>
          </div>

          {/* Price Desktop */}
          <div className="hidden md:flex flex-col items-end">
            <span className="text-2xl font-black text-[#27AE60] md:text-sm text-nowrap">
              {typeof property?.price === "number"
                ? formatPrice(property.price)
                : "--"}
            </span>
            {property?.pricePerSqft && (
              <span className="text-[11px] text-slate-400 font-medium">
                ₹{property.pricePerSqft}/sqft
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-4">
          <MapPin className="w-4 h-4 text-[#27AE60]/70" />
          <span className="line-clamp-1">
            {property?.address}, {property?.city}
          </span>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-50 mb-4">
          <div className="flex flex-col items-center md:items-start border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400">
              <LucidePanelLeftDashed className="w-4 h-4" />
              <span className="text-xs">Width</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.dimensions?.width || 0}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start border-r border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400">
              <LucidePanelRightDashed className="w-4 h-4" />
              <span className="text-xs">Length</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.dimensions?.length || 0}
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-1.5 text-slate-400">
              <AreaChart className="w-4 h-4" />
              <span className="text-xs">Plot Area</span>
            </div>
            <span className="font-bold text-slate-700">
              {property?.plotArea}{" "}
              <small className="text-[10px] font-normal">sqft</small>
            </span>
          </div>
        </div>

        {/* Posted By */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-slate-600">Posted By:</span>
          <span className="text-[#27AE60] font-semibold">
            {property?.createdBy?.name
              ?.split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ") || "Unknown"}
          </span>
          {property?.createdBy?.phone && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
              {property.createdBy.phone}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> {property?.meta?.views || 0}
            </span>

            <span className="flex items-center gap-1">
              Clicks: {property?.meta?.clicks || 0}
            </span>

            <span className="flex items-center gap-1">
              Inquiries: {property?.meta?.inquiries || 0}
            </span>

            <span>
              Listed:{" "}
              {property?.createdAt
                ? new Date(property.createdAt).toLocaleDateString()
                : "Today"}
            </span>
          </div>

          <div className="flex gap-2">
            {isPendingReview ? (
              <>
                <button
                  onClick={() => setOpenLeads(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#27AE60]/20 bg-green-50 text-[#27AE60] text-sm font-bold hover:bg-green-100 transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  {/* Leads ({totalLeads}) */}
                  Leads ({leadsLoading ? "..." : totalLeads})
                </button>
                <button
                  onClick={() =>
                    navigate(`/land-property-verification/${property._id}`)
                  }
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold bg-[#27AE60] text-white shadow-lg shadow-green-200 hover:bg-[#219150] transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  Review Docs <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setOpenLeads(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#27AE60]/20 bg-green-50 text-[#27AE60] text-sm font-bold hover:bg-green-100 transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  {/* Leads ({totalLeads}) */}
                  Leads ({leadsLoading ? "..." : totalLeads})
                </button>
                <button
                  onClick={() => {
                    dispatch(setActiveCategory("land"));
                    dispatch(actions.land.hydrateForm(property));
                    localStorage.setItem("editPropertyId", property._id);
                    localStorage.setItem("editPropertyCategory", "land");
                    navigate(`/edit-property/${property._id}`);
                  }}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-sm font-bold bg-[#27AE60] text-white transition-all active:scale-95"
                >
                  Edit Details
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price Mobile Only */}
      <div className="md:hidden pt-3 border-t border-slate-100 flex justify-between items-center">
        <span className="text-xs text-slate-400 font-bold uppercase">
          Total Price
        </span>
        <span className="text-xl font-black text-[#27AE60]">
          {typeof property?.price === "number"
            ? formatPrice(property.price)
            : "Price on Request"}
        </span>
      </div>
      {/* ─────────────── LEADS POPUP ─────────────── */}
      {openLeads && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Property Leads
                </h2>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-[#27AE60] text-xs font-bold hover:bg-green-100 transition"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>

                  <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <Download className="w-4 h-4" />
                    Excel
                  </button>
                </div>

                <p className="text-sm text-slate-400 mt-1">
                  Total Leads: {totalLeads}
                </p>
              </div>

              <button
                onClick={() => setOpenLeads(false)}
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
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          #
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Lead Profile
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Contact
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Property
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Status
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Remarks
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Approval
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Created
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {leads.map((lead, index) => (
                        <tr
                          key={lead._id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-all"
                        >
                          {/* INDEX */}
                          <td className="px-4 py-5 text-sm text-slate-400">
                            {index + 1}
                          </td>

                          {/* PROFILE */}
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div>
                                <h3 className="font-bold text-nowrap text-slate-800 text-sm">
                                  {lead.name}
                                </h3>

                                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                  <User className="w-3 h-3" />
                                  Lead ID: {lead._id?.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CONTACT */}
                          <td className="px-4 py-5">
                            <div className="space-y-2">
                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-[#27AE60]"
                              >
                                <Phone className="w-4 h-4 text-[#27AE60]" />
                                {lead.phone}
                              </a>

                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
                              >
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </a>
                            </div>
                          </td>

                          {/* PROPERTY */}
                          <td className="px-4 py-5">
                            <div className="flex flex-col gap-2 min-w-[180px]">
                              {/* Property Model */}
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                  <Home className="w-4 h-4 text-[#27AE60]" />
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {lead.propertyModel || "Residential"}
                                  </p>

                                  <p className="text-[11px] text-slate-400">
                                    Property Model
                                  </p>
                                </div>
                              </div>

                              {/* Property Type */}
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold capitalize">
                                  {lead.propertyType || "N/A"}
                                </div>

                                <div className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-semibold capitalize">
                                  {lead.listingType || "sale"}
                                </div>
                              </div>
                            </div>
                          </td>
                          {/* STATUS */}
                          <td className="px-4 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold capitalize
            ${
              lead.status === "new"
                ? "bg-green-100 text-green-700"
                : lead.status === "contacted"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-600"
            }`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          {/* REMARKS */}
                          <td className="px-4 py-5 max-w-[250px]">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />

                              <p className="text-sm text-slate-600 line-clamp-2">
                                {lead.remarks || "No remarks"}
                              </p>
                            </div>
                          </td>

                          {/* APPROVAL */}
                          <td className="px-4 py-5">
                            {lead.approvedByManager ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                <BadgeCheck className="w-3 h-3" />
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                Pending
                              </span>
                            )}
                          </td>

                          {/* DATE */}
                          <td className="px-4 py-5 whitespace-nowrap">
                            <div>
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
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2">
                              {/* CALL */}
                              <a
                                href={`tel:${lead.phone}`}
                                className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center transition"
                              >
                                <Phone className="w-4 h-4 text-[#27AE60]" />
                              </a>

                              {/* WHATSAPP */}
                              <a
                                href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-xl bg-green-50 hover:bg-green-100 flex items-center justify-center transition"
                              >
                                <img
                                  src="https://cdn-icons-png.flaticon.com/512/733/733585.png"
                                  alt="whatsapp"
                                  className="w-4 h-4"
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
