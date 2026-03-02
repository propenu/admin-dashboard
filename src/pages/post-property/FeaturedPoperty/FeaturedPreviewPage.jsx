


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
import SpecificationEditor from "./FeaturedPreviewPageComponents/SpecificationEditor";
import Specifications from "./FeaturedPreviewPageComponents/Specifications";
import AboutUS from "./FeaturedPreviewPageComponents/AboutUs";
import AboutUsEditor from "./FeaturedPreviewPageComponents/AboutUsEditor";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: "🏠" },
  { id: "bhk", label: "BHK", icon: "📐" },
  { id: "amenities", label: "Amenities", icon: "✨" },
  { id: "gallery", label: "Gallery", icon: "🖼️" },
  { id: "specifications", label: "Specifications", icon: "📑" },
  { id: "about", label: "About", icon: "📋" },
  { id: "locate", label: "Location", icon: "📍" },
];

function SectionWrapper({ id, title, subtitle, icon, LeftComponent, RightComponent, leftProps, rightProps, registerSectionRef }) {
  return (
    <div className="group" id={`${id}-section`}>
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-9 h-9 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-lg flex-shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800 leading-tight">{title}</h2>
          <p className="text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className="ml-auto h-px flex-1 bg-gradient-to-r from-[#27AE60]/20 to-transparent max-w-xs" />
      </div>

      {/* Section Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          {LeftComponent && (
            <div className="sticky top-4">
              <LeftComponent {...leftProps} />
            </div>
          )}
        </div>
        <div
          className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          ref={registerSectionRef}
          data-section-id={id}
        >
          {RightComponent && <RightComponent {...rightProps} />}
        </div>
      </div>
    </div>
  );
}

export default function FeaturedPreviewPage() {
  const { id } = useParams();
  const [formData, setFormData]  = useState(null);
  const [livePreviewData, setLivePreviewData] = useState(null);
  const [saving, setSaving]               = useState(false);
  const [selectedBhkIndex, setSelectedBhkIndex] = useState(0);
  const sectionRefs = useRef({});
  const [activeSection, setActiveSection] = useState("hero");

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
      const updated = {
        ...prev,
        amenities: prev.amenities.filter((a) => a.key !== key),
      };

      setLivePreviewData(updated); // keep preview synced
      return updated;
    });
  };

  
async function handleSave(sectionUpdate) {
  try {
    setSaving(true);

    // Always use formData as base (clean original DB data)
    const payload = {
      ...formData,
      ...sectionUpdate,
    };

    const result = await updateFeaturedProperty(id, payload);
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
    if (node) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 h-14 overflow-x-auto scrollbar-none">
            {/* Logo dot */}
            <span className="w-2.5 h-2.5 rounded-full bg-[#27AE60] flex-shrink-0 mr-3" />

            {SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${
                      isActive
                        ? "bg-[#27AE60] text-white shadow-md shadow-[#27AE60]/30"
                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  <span className="text-xs">{s.icon}</span>
                  {s.label}
                </button>
              );
            })}

            <div className="ml-auto flex-shrink-0 flex items-center gap-2 pl-4">
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
                  Saving…
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
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
          rightProps={{
            data: livePreviewData,
            onRemove: handleRemoveAmenity,
          }}
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

        {/* Footer padding */}
        <div className="h-16" />
      </div>
    </div>
  );
}