// // src/pages/post-property/featured-create/steps/AboutStep.jsx
// import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
// import TiptapEditor from "./Components/TiptapEditor";
// import { Upload, X, ImageIcon } from "lucide-react";

// const MAX_SIZE     = 2 * 1024 * 1024;
// const ALLOWED_TYPES = ["image/jpeg","image/png","image/webp"];

// const inp = (err) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
//   outline-none placeholder:text-gray-400 transition-all duration-200 resize-none
//   ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

// const LABEL = "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

// const isEditorEmpty = (html) => {
//   if (!html) return true;
//   return html.replace(/<p><br><\/p>/g,"").replace(/<p><\/p>/g,"").replace(/<[^>]*>/g,"").trim().length === 0;
// };

// const AboutStep = forwardRef(({ payload, update }, ref) => {
//   const summary = payload.aboutSummary?.[0] || { aboutDescription:"", rightContent:"" };
//   const [errors, setErrors]   = useState({});
//   const [preview, setPreview] = useState(null);
//   const aboutRef = useRef(null);

//   useImperativeHandle(ref, () => ({
//     validate() {
//       const e = {};
//       if (!summary.aboutDescription.trim())    e.aboutDescription = "About description is required";
//       if (isEditorEmpty(summary.rightContent)) e.rightContent     = "Right side content is required";
//       if (!payload.aboutImage)                 e.aboutImage       = "About image is required";
//       setErrors(e);
//       if (Object.keys(e).length) {
//         aboutRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
//         return false;
//       }
//       return true;
//     },
//   }));

//   const clr = (key) => setErrors((p) => { const c={...p}; delete c[key]; return c; });

//   const handleChange = (field, value) => {
//     update({ aboutSummary: [{ ...summary, [field]: value }] });
//     clr(field);
//   };

//   const handleImage = (e) => {
//     const f = e.target.files[0]; if (!f) return;

//      console.log("TYPE:", f.type, "SIZE:", f.size);
     
//     if (!ALLOWED_TYPES.includes(f.type))    { setErrors((p) => ({...p, aboutImage:"Only JPG, PNG, WEBP allowed"})); return; }
//     if (f.size > MAX_SIZE)                  { setErrors((p) => ({...p, aboutImage:"Image must be under 2MB"}));     return; }
//     update({ aboutImage: f });
//     setPreview(URL.createObjectURL(f));
//     clr("aboutImage");
//   };

//   const removeImage = () => { update({ aboutImage:null }); setPreview(null); };

//   useEffect(() => {
//     if (payload.aboutImage && typeof payload.aboutImage === "string") setPreview(payload.aboutImage);
//   }, [payload.aboutImage]);

//   return (
//     <div className="space-y-6" ref={aboutRef}>
//       {/* About Description */}
//       <div>
//         <label className={LABEL}>About Description *</label>
//         <textarea rows={4} className={inp(errors.aboutDescription)}
//           value={summary.aboutDescription} placeholder="Write a compelling overview of this property..."
//           onChange={(e) => handleChange("aboutDescription", e.target.value)} />
//         {errors.aboutDescription && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.aboutDescription}</p>}
//       </div>

//       {/* Rich Text Editor */}
//       <div>
//         <label className={LABEL}>Right Side Content *</label>
//         <div className={`rounded-2xl overflow-hidden border-2 transition-all
//           ${errors.rightContent ? "border-red-400" : "border-gray-200"}`}>
//           <TiptapEditor
//             value={summary.rightContent}
//             onChange={(v) => handleChange("rightContent", v)} />
//         </div>
//         {errors.rightContent && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.rightContent}</p>}
//       </div>

//       {/* Image Upload */}
//       <div>
//         <label className={LABEL}>About Image *</label>

//         {!preview ? (
//           <label className={`flex flex-col items-center justify-center w-full py-12 rounded-2xl border-2 border-dashed
//             cursor-pointer transition-all group
//             ${errors.aboutImage ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"}`}
//           >
//             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all
//               ${errors.aboutImage ? "bg-red-100" : "bg-white shadow-sm group-hover:bg-[#27AE60]/10"}`}>
//               <ImageIcon size={24} className={`${errors.aboutImage ? "text-red-400" : "text-gray-400 group-hover:text-[#27AE60]"} transition-colors`} />
//             </div>
//             <p className={`text-sm font-bold ${errors.aboutImage ? "text-red-600" : "text-gray-700"}`}>
//               Upload About Image
//             </p>
//             <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Max 2MB</p>
//             <input id="aboutImageInput" type="file" accept="image/*" onChange={handleImage} className="hidden" />
//           </label>
//         ) : (
//           <div className="relative inline-block">
//             <img src={preview} alt="Preview"
//               className="h-52 rounded-2xl border-2 border-gray-200 object-cover shadow-sm" />
//             <button type="button" onClick={removeImage}
//               className="absolute top-3 right-3 w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center
//                 hover:bg-red-600 transition-all shadow-lg">
//               <X size={16} className="text-white" />
//             </button>
//           </div>
//         )}

//         {errors.aboutImage && <p className="text-xs text-red-500 font-semibold mt-1.5">⚠ {errors.aboutImage}</p>}
//       </div>
//     </div>
//   );
// });

// export default AboutStep;


import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import TiptapEditor from "./Components/TiptapEditor";
import { X, ImageIcon } from "lucide-react";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

const inp = (
  err,
) => `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200 resize-none
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL =
  "block text-xs font-black uppercase tracking-widest text-gray-500 mb-2";

const isEditorEmpty = (html) => {
  if (!html) return true;
  return (
    html
      .replace(/<p><br><\/p>/g, "")
      .replace(/<p><\/p>/g, "")
      .replace(/<[^>]*>/g, "")
      .trim().length === 0
  );
};

const AboutStep = forwardRef(({ payload, update }, ref) => {
  const summary = payload.aboutSummary?.[0] || {
    aboutDescription: "",
    rightContent: "",
  };
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const aboutRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (!summary.aboutDescription.trim())
        e.aboutDescription = "About description is required";
      if (isEditorEmpty(summary.rightContent))
        e.rightContent = "Right side content is required";
      if (!payload.aboutImage) e.aboutImage = "About image is required";
      setErrors(e);
      if (Object.keys(e).length) {
        aboutRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return false;
      }
      return true;
    },
  }));

  const clr = (key) =>
    setErrors((p) => {
      const c = { ...p };
      delete c[key];
      return c;
    });

  const handleChange = (field, value) => {
    update({ aboutSummary: [{ ...summary, [field]: value }] });
    clr(field);
  };

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    console.log("TYPE:", f.type, "SIZE:", f.size);

    // only size check
    if (f.size > MAX_SIZE) {
      setErrors((p) => ({ ...p, aboutImage: "Image must be under 2MB" }));
      return;
    }

    update({ aboutImage: f });
    setPreview(URL.createObjectURL(f));
    clr("aboutImage");
  };

  const removeImage = () => {
    update({ aboutImage: null });
    setPreview(null);
  };

  useEffect(() => {
    if (payload.aboutImage && typeof payload.aboutImage === "string") {
      setPreview(payload.aboutImage);
    }
  }, [payload.aboutImage]);

  return (
    <div className="space-y-6" ref={aboutRef}>
      {/* About Description */}
      <div>
        <label className={LABEL}>About Description *</label>
        <textarea
          rows={4}
          className={inp(errors.aboutDescription)}
          value={summary.aboutDescription}
          placeholder="Write a compelling overview of this property..."
          onChange={(e) => handleChange("aboutDescription", e.target.value)}
        />
        {errors.aboutDescription && (
          <p className="text-xs text-red-500 font-semibold mt-1.5">
            ⚠ {errors.aboutDescription}
          </p>
        )}
      </div>

      {/* Right Side Content */}
      <div>
        <label className={LABEL}>Right Side Content *</label>
        <div
          className={`rounded-2xl overflow-hidden border-2 transition-all ${
            errors.rightContent ? "border-red-400" : "border-gray-200"
          }`}
        >
          <TiptapEditor
            value={summary.rightContent}
            onChange={(v) => handleChange("rightContent", v)}
          />
        </div>
        {errors.rightContent && (
          <p className="text-xs text-red-500 font-semibold mt-1.5">
            ⚠ {errors.rightContent}
          </p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className={LABEL}>About Image *</label>

        {!preview ? (
          <label
            className={`flex flex-col items-center justify-center w-full py-12 rounded-2xl border-2 border-dashed
            cursor-pointer transition-all group ${
              errors.aboutImage
                ? "border-red-400 bg-red-50"
                : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all ${
                errors.aboutImage
                  ? "bg-red-100"
                  : "bg-white shadow-sm group-hover:bg-[#27AE60]/10"
              }`}
            >
              <ImageIcon
                size={24}
                className={`${
                  errors.aboutImage
                    ? "text-red-400"
                    : "text-gray-400 group-hover:text-[#27AE60]"
                } transition-colors`}
              />
            </div>
            <p
              className={`text-sm font-bold ${
                errors.aboutImage ? "text-red-600" : "text-gray-700"
              }`}
            >
              Upload About Image
            </p>
            {/* updated helper text */}
            <p className="text-xs text-gray-400 mt-1">
              Any image type — Max 2MB
            </p>
            <input
              id="aboutImageInput"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="h-52 rounded-2xl border-2 border-gray-200 object-cover shadow-sm"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center
                hover:bg-red-600 transition-all shadow-lg"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        )}

        {errors.aboutImage && (
          <p className="text-xs text-red-500 font-semibold mt-1.5">
            ⚠ {errors.aboutImage}
          </p>
        )}
      </div>
    </div>
  );
});

export default AboutStep;
