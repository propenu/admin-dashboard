// D:\propenu\frontend\admin-dashboard\src\pages\post-property\FeaturedPoperty\FeaturedPreviewPage.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  fetchPostFeaturedPropertyById,
  updateFeaturedProperty,
} from "../../../services/PostAPropertyService";

import HeroSection from "./FeaturedPreviewPageComponents/HeroSection";
import LeftEditor from "./FeaturedPreviewPageComponents/LeftEditor";
import AmenitiesEditor from "./FeaturedPreviewPageComponents/AmenitiesEditor";
import AmenitiesSection from "./FeaturedPreviewPageComponents/AmenitiesSection";
import BHKEditor from "./FeaturedPreviewPageComponents/BHKEditor";
import BHKSection from "./FeaturedPreviewPageComponents/BHKSection";
import LocateUs from "./FeaturedPreviewPageComponents/LocateUs";
import LocationEditor from "./FeaturedPreviewPageComponents/LocationEditor";
import GalleryEditor from "./FeaturedPreviewPageComponents/GalleryEditor";
import Gallery from "./FeaturedPreviewPageComponents/Gallery";
import YoutubeEditor from "./FeaturedPreviewPageComponents/YoutubeVideosEditor";
import YoutubeSection from "./FeaturedPreviewPageComponents/YoutubeVideos";
import SpecificationEditor from "./FeaturedPreviewPageComponents/SpecificationEditor";
import Specifications from "./FeaturedPreviewPageComponents/Specifications";
import AboutUS from "./FeaturedPreviewPageComponents/AboutUs";
import AboutUsEditor from "./FeaturedPreviewPageComponents/AboutUsEditor";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { Video } from "lucide-react";

const SECTIONS = [
  { id: "hero",           label: "Hero",           icon: "🏠" },
  { id: "bhk",            label: "BHK",            icon: "📐" },
  { id: "amenities",      label: "Amenities",      icon: "✨" },
  { id: "gallery",        label: "Gallery",        icon: "🖼️" },
  { id: "specifications", label: "Specifications", icon: "📑" },
  { id: "about",          label: "About",          icon: "📋" },
  { id: "locate",         label: "Location",       icon: "📍" },
];

/* ─────────────────────────────────────────────
   SectionWrapper
   • Mobile  : editor stacks ABOVE preview
   • lg+     : 4/12 editor | 8/12 preview side-by-side
───────────────────────────────────────────── */
function SectionWrapper({
  id, title, subtitle, icon,
  LeftComponent, RightComponent,
  leftProps, rightProps,
  registerSectionRef,
}) {
  const [editorOpen, setEditorOpen] = useState(false); // mobile accordion

  return (
    <section id={`${id}-section`} className="group">
      {/* Section Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 px-1">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-base sm:text-lg flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-gray-800 leading-tight truncate">{title}</h2>
          <p className="text-[11px] sm:text-xs text-gray-400 truncate">{subtitle}</p>
        </div>

        {/* Mobile: toggle editor button */}
        <button
          type="button"
          onClick={() => setEditorOpen((o) => !o)}
          className="ml-auto lg:hidden flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#27AE60]/30 text-[#27AE60] text-xs font-semibold hover:bg-[#27AE60]/5 transition-colors flex-shrink-0"
        >
          {editorOpen ? "Hide" : "Edit"}
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${editorOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Desktop: decorative line */}
        <div className="hidden lg:block ml-auto h-px flex-1 bg-gradient-to-r from-[#27AE60]/20 to-transparent max-w-xs" />
      </div>

      {/* Section Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

        {/* Editor — always shown lg+, collapsible on mobile */}
        <div
          className={[
            "lg:col-span-4 lg:block",
            editorOpen ? "block" : "hidden",
          ].join(" ")}
        >
          <div className="lg:sticky lg:top-4">
            {LeftComponent && <LeftComponent {...leftProps} />}
          </div>
        </div>

        {/* Preview — always visible */}
        <div
          className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          ref={registerSectionRef}
          data-section-id={id}
        >
          {RightComponent && <RightComponent {...rightProps} />}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function FeaturedPreviewPage() {
  const { id } = useParams();
  const [formData, setFormData]               = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [saving, setSaving]                   = useState(false);
  const [selectedBhkIndex, setSelectedBhkIndex] = useState(0);
  const [mobileNavOpen, setMobileNavOpen]     = useState(false);
  const sectionRefs  = useRef({});
  const [activeSection, setActiveSection]     = useState("hero");

  /* Load */
  useEffect(() => {
    async function load() {
      try {
        const result = await fetchPostFeaturedPropertyById(id);
        const data = result?.data ?? result;
        setFormData(data);
        setLivePreviewData(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  const handleRemoveAmenity = (key) => {
    setFormData((prev) => {
      const updated = { ...prev, amenities: prev.amenities.filter((a) => a.key !== key) };
      setLivePreviewData(updated);
      return updated;
    });
  };

  async function handleSave(sectionUpdate) {
    try {
      setSaving(true);
      const payload = { ...formData, ...sectionUpdate };
      const result  = await updateFeaturedProperty(id, payload);
      const updatedData = result?.data ?? result;
      setFormData(updatedData);
      setLivePreviewData(updatedData);
      toast.success("Saved successfully!");
    } catch (err) {
      console.error("Backend Error:", err.response?.data);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const scrollTo = useCallback((sectionId) => {
    const node = sectionRefs.current[sectionId];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setMobileNavOpen(false);
    }
  }, []);

  /* IntersectionObserver for active section */
  useEffect(() => {
    if (!formData) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const sid = entry.target.getAttribute("data-section-id");
          if (entry.isIntersecting) setActiveSection(sid);
        });
      },
      { root: null, threshold: 0.25 }
    );
    Object.values(sectionRefs.current).forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [formData]);

  if (!formData) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/60">
      {/* ── TOP NAV BAR ── */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center h-13 sm:h-14 gap-2">
            {/* Brand dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-[#27AE60] flex-shrink-0" />

            {/* Desktop nav pills — scrollable row */}
            <div className="hidden sm:flex items-center gap-1 overflow-x-auto scrollbar-none flex-1 ml-2">
              {SECTIONS.map((s) => {
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={[
                      "flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0",
                      isActive
                        ? "bg-[#27AE60] text-white shadow-md shadow-[#27AE60]/30"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <span className="text-xs">{s.icon}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile: active section label + hamburger */}
            <div className="flex sm:hidden items-center gap-2 flex-1 ml-1">
              <span className="text-sm font-semibold text-gray-700 truncate">
                {SECTIONS.find((s) => s.id === activeSection)?.icon}{" "}
                {SECTIONS.find((s) => s.id === activeSection)?.label}
              </span>
              <button
                type="button"
                onClick={() => setMobileNavOpen((o) => !o)}
                className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Open section navigation"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            {/* Saving indicator */}
            <div className="flex-shrink-0 ml-2">
              {saving && (
                <span className="text-xs text-[#27AE60] font-medium animate-pulse flex items-center gap-1">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Saving…</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="sm:hidden border-t border-gray-100 bg-white px-3 py-2 grid grid-cols-3 gap-1.5">
            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#27AE60] text-white shadow-sm"
                      : "text-gray-500 bg-gray-50 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <span>{s.icon}</span>
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-5 sm:py-8 space-y-10 sm:space-y-12">
        <SectionWrapper
          id="hero"
          title="Hero Section"
          subtitle="Branding & primary visual"
          icon="🏠"
          LeftComponent={LeftEditor}
          RightComponent={HeroSection}
          leftProps={{
            formData,
            setFormData,
            setLivePreviewData,
            onSave: handleSave,
            saving,
          }}
          rightProps={{ data: livePreviewData }}
          registerSectionRef={(el) => (sectionRefs.current["hero"] = el)}
        />

        <SectionWrapper
          id="bhk"
          title="BHK Configurations"
          subtitle="Unit types & floor plans"
          icon="📐"
          LeftComponent={BHKEditor}
          RightComponent={BHKSection}
          leftProps={{
            formData,
            setFormData,
            onSaveBhk: handleSave,
            setLivePreviewData,
            saving,
            selectedBhkIndex,
            setSelectedBhkIndex,
          }}
          rightProps={{
            data: livePreviewData,
            selectedBhkIndex,
            onSelectBhk: setSelectedBhkIndex,
          }}
          registerSectionRef={(el) => (sectionRefs.current["bhk"] = el)}
        />

        <SectionWrapper
          id="amenities"
          title="Amenities"
          subtitle="Project facilities & features"
          icon="✨"
          LeftComponent={AmenitiesEditor}
          RightComponent={AmenitiesSection}
          leftProps={{ formData, setFormData }}
          rightProps={{ data: livePreviewData, onRemove: handleRemoveAmenity }}
          registerSectionRef={(el) => (sectionRefs.current["amenities"] = el)}
        />

        <SectionWrapper
          id="gallery"
          title="Media Gallery"
          subtitle="Images & videos of the project"
          icon="🖼️"
          LeftComponent={GalleryEditor}
          RightComponent={Gallery}
          leftProps={{
            formData,
            setFormData,
            saving,
            onSave: handleSave,
            setLivePreviewData,
          }}
          rightProps={{
            gallerySummary: livePreviewData.gallerySummary,
            primaryColor: livePreviewData.color,
          }}
          registerSectionRef={(el) => (sectionRefs.current["gallery"] = el)}
        />

        <SectionWrapper
          id="video"
          title="Video"
          subtitle="Project video"
          icon="🎥"
          LeftComponent={YoutubeEditor}
          RightComponent={YoutubeSection}
          leftProps={{
            formData,
            setFormData,
            saving,
            onSave: handleSave,
            setLivePreviewData,
          }}
          rightProps={{
            youtubeVideos: livePreviewData.youtubeVideos,
            primaryColor: livePreviewData.color,
          }}
          registerSectionRef={(el) => (sectionRefs.current["video"] = el)}
        />

        <SectionWrapper
          id="specifications"
          title="Specifications"
          subtitle="Construction & materials"
          icon="📑"
          LeftComponent={SpecificationEditor}
          RightComponent={Specifications}
          leftProps={{
            formData,
            setFormData,
            setLivePreviewData,
            saving,
            onSave: handleSave,
          }}
          rightProps={{
            specifications: livePreviewData.specifications,
            primaryColor: livePreviewData.color,
          }}
          registerSectionRef={(el) =>
            (sectionRefs.current["specifications"] = el)
          }
        />

        <SectionWrapper
          id="about"
          title="About the Project"
          subtitle="Story, description & highlights"
          icon="📋"
          LeftComponent={AboutUsEditor}
          RightComponent={AboutUS}
          leftProps={{
            formData,
            setFormData,
            setLivePreviewData,
            saving,
            onSave: handleSave,
          }}
          rightProps={{
            aboutSummary: livePreviewData.aboutSummary,
            primaryColor: livePreviewData.color,
          }}
          registerSectionRef={(el) => (sectionRefs.current["about"] = el)}
        />

        <SectionWrapper
          id="locate"
          title="Location & Nearby"
          subtitle="Map & points of interest"
          icon="📍"
          LeftComponent={LocationEditor}
          RightComponent={LocateUs}
          leftProps={{ formData, setFormData, saving, onSave: handleSave }}
          rightProps={{ data: livePreviewData }}
          registerSectionRef={(el) => (sectionRefs.current["locate"] = el)}
        />

        <div className="h-10 sm:h-16" />
      </div>
    </div>
  );
}