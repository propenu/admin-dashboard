// src/pages/post-property/featured-create/steps/HeroStep.jsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Upload, ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";
import { saveImage, getFileFromKey } from "../utils/indexedDB";

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1, // 🔥 below 1MB
    maxWidthOrHeight: 1920, // optional resize
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    return file; // fallback
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const inp = (err) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
         : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";
const ERR   = "text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1";

function UploadBox({ label, id, preview, onFile, error, contain }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <label htmlFor={id}
        className={`flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed
          cursor-pointer overflow-hidden relative group transition-all duration-200
          ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"}`}
      >
        {preview ? (
          <>
            <img src={preview} alt="preview"
              className={`absolute inset-0 w-full h-full ${contain ? "object-contain p-3" : "object-cover"}`} />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all
              flex flex-col items-center justify-center">
              <Upload size={22} className="text-white mb-1" />
              <span className="text-white text-xs font-bold">Change Image</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#27AE60] transition-colors p-6 text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
              ${error ? "bg-red-100" : "bg-gray-100 group-hover:bg-[#27AE60]/10"}`}>
              <ImageIcon size={22} className={error ? "text-red-400" : ""} />
            </div>
            <div>
              <p className="text-sm font-bold">Click to upload</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
            </div>
          </div>
        )}
        <input id={id} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </label>
      {error && <p className={ERR}>⚠ {error}</p>}
    </div>
  );
}

const HeroStep = forwardRef(({ payload, update, replace }, ref) => {
  const [errors, setErrors] = useState({});
  const heroTaglineRef    = useRef(null);
  const heroSubTaglineRef = useRef(null);
  const heroDescriptionRef = useRef(null);
  const colorRef          = useRef(null);
  const heroImageRef      = useRef(null);
  const logoRef           = useRef(null);

  const [heroPreview, setHeroPreview] = useState("");
  const [logoPreview, setLogoPreview] = useState("");

  

 const getPreview = (value) => {
   if (!value) return "";

   if (typeof value === "string") {
     if (value.startsWith("data:")) return value; // base64
     if (value.startsWith("http")) return value;

     return `${import.meta.env.VITE_API_BASE_URL}/${value}`;
   }

   if (typeof value === "object" && value.url) {
     return value.url.startsWith("http")
       ? value.url
       : `${import.meta.env.VITE_API_BASE_URL}/${value.url}`;
   }

   return "";
 };


  // useImperativeHandle(ref, () => ({
  //   validate() {
  //     const e = {};
  //     if (!payload.heroTagline?.trim())    e.heroTagline    = "Hero Tagline is required";
  //     if (!payload.heroSubTagline?.trim()) e.heroSubTagline = "Hero Sub Tagline is required";
  //     if (!payload.heroDescription?.trim()) e.heroDescription = "Hero Description is required";
  //     if (!payload.color?.trim())          e.color          = "Theme Color is required";
  //     if (!payload.heroImage)              e.heroImage      = "Hero Image is required";
  //     if (!payload.logo)                   e.logo           = "Logo is required";
  //     setErrors(e);
  //     if (Object.keys(e).length) {
  //       const refMap = { heroTagline:heroTaglineRef, heroSubTagline:heroSubTaglineRef,
  //         heroDescription:heroDescriptionRef, color:colorRef, heroImage:heroImageRef, logo:logoRef };
  //       refMap[Object.keys(e)[0]]?.current?.scrollIntoView({ behavior:"smooth", block:"center" });
  //       return false;
  //     }
  //     return true;
  //   },
  // }));

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (!payload.heroTagline?.trim())
        e.heroTagline = "Hero Tagline is required";
      if (!payload.heroSubTagline?.trim())
        e.heroSubTagline = "Hero Sub Tagline is required";
      if (!payload.heroDescription?.trim())
        e.heroDescription = "Hero Description is required";
      if (!payload.color?.trim()) e.color = "Theme Color is required";
      if (!payload.heroImage) e.heroImage = "Hero Image is required";
      if (!payload.logo) e.logo = "Logo is required";

      setErrors(e);

      if (Object.keys(e).length) {
        const refMap = {
          heroTagline: heroTaglineRef,
          heroSubTagline: heroSubTaglineRef,
          heroDescription: heroDescriptionRef,
          color: colorRef,
          heroImage: heroImageRef,
          logo: logoRef,
        };

        const first = Object.keys(e)[0];
        refMap[first]?.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return false;
      }

      return true;
    },

    // ✅ ADD THIS (IMPORTANT)
    isValid() {
      return (
        payload.heroTagline?.trim() &&
        payload.heroSubTagline?.trim() &&
        payload.heroDescription?.trim() &&
        payload.color?.trim() &&
        payload.heroImage &&
        payload.logo
      );
    },
  }));

  const clr = (key) => setErrors((p) => { const c={...p}; delete c[key]; return c; });

  const onHeroFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const compressed = await compressImage(file);
    const base64 = await fileToBase64(compressed);

    //const key = await saveImage(compressed, "other");
    const key = await saveImage(compressed, "other", "logo");

    update({
      heroImage: {
        file: compressed,
        key: key,
      },
      heroImagePreview: base64,
    });

    setHeroPreview(base64);
  };

 useEffect(() => {
   const loadImages = async () => {
     // 🔹 HERO IMAGE
     const heroKey =
       typeof payload.heroImage === "string"
         ? payload.heroImage
         : payload.heroImage?.key;

     if (heroKey) {
       const file = await getFileFromKey(heroKey, "other");
       if (file) {
         setHeroPreview(URL.createObjectURL(file));
       }
     }

     // 🔹 LOGO
     const logoKey =
       typeof payload.logo === "string" ? payload.logo : payload.logo?.key;

     if (logoKey) {
       const file = await getFileFromKey(logoKey, "other");
       if (file) {
         setLogoPreview(URL.createObjectURL(file));
       }
     }
   };

   loadImages();
 }, [payload.heroImage, payload.logo]);
  
 const onLogoFile = async (e) => {
   const file = e.target.files[0];
   if (!file) return;

   const compressed = await compressImage(file);
   const base64 = await fileToBase64(compressed);

   //const key = await saveImage(compressed, "other");
   const key = await saveImage(compressed, "other", "hero");

   update({
     logo: {
       file: compressed,
       key: key,
     },
     logoPreview: base64,
   });

   setLogoPreview((prev) => {
     if (prev && prev.startsWith("blob:")) {
       URL.revokeObjectURL(prev);
     }
     return base64;
   });
 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div ref={heroTaglineRef}>
          <label className={LABEL}>Hero Tagline *</label>
          <input className={inp(errors.heroTagline)} value={payload.heroTagline}
            placeholder="Luxury Living Redefined"
            onChange={(e) => { update({ heroTagline: e.target.value }); clr("heroTagline"); }} />
          {errors.heroTagline && <p className={ERR}>⚠ {errors.heroTagline}</p>}
        </div>

        <div ref={heroSubTaglineRef}>
          <label className={LABEL}>Hero Sub Tagline *</label>
          <input className={inp(errors.heroSubTagline)} value={payload.heroSubTagline}
            placeholder="Where dreams become home"
            onChange={(e) => { update({ heroSubTagline: e.target.value }); clr("heroSubTagline"); }} />
          {errors.heroSubTagline && <p className={ERR}>⚠ {errors.heroSubTagline}</p>}
        </div>
      </div>

      <div ref={heroDescriptionRef}>
        <label className={LABEL}>Hero Description *</label>
        <textarea rows={3} className={`${inp(errors.heroDescription)} resize-none`}
          value={payload.heroDescription}
          placeholder="A short compelling intro shown on the hero section..."
          onChange={(e) => { update({ heroDescription: e.target.value }); clr("heroDescription"); }} />
        {errors.heroDescription && <p className={ERR}>⚠ {errors.heroDescription}</p>}
      </div>

      {/* Theme Color */}
      <div ref={colorRef}>
        <label className={LABEL}>Theme Color *</label>
        <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
          <input type="color"
            value={payload.color || "#27AE60"}
            onChange={(e) => { update({ color: e.target.value }); clr("color"); }}
            className="w-14 h-14 rounded-xl border-4 border-white shadow-md cursor-pointer"
            style={{ padding: 2 }} />
          <div>
            <p className="text-sm font-black text-gray-800">{payload.color || "#27AE60"}</p>
            <p className="text-xs text-gray-500 mt-0.5">Accent color used across the property page</p>
          </div>
          {payload.color && (
            <div className="ml-auto w-8 h-8 rounded-full border-4 border-white shadow-md"
              style={{ background: payload.color }} />
          )}
        </div>
        {errors.color && <p className={ERR}>⚠ {errors.color}</p>}
      </div>

      {/* Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div ref={heroImageRef}>
          <UploadBox label="Hero Image *" id="hero-img" preview={heroPreview}
            onFile={onHeroFile} error={errors.heroImage} />
        </div>
        <div ref={logoRef}>
          <UploadBox label="Logo *" id="logo-img" preview={logoPreview}
            onFile={onLogoFile} error={errors.logo} contain />
        </div>
      </div>
    </div>
  );
});

export default HeroStep;