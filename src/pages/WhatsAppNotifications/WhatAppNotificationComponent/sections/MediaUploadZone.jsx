
import { useState, useRef, useCallback } from "react";
import {
  X,
  Loader2,
  Upload,
} from "lucide-react"; 
import { MEDIA_ACCEPT, MEDIA_ICON } from "../../utils/constants";


export const MediaUploadZone = ({ format, header, onChange }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      // Validate size
      const maxMB = format === "VIDEO" ? 16 : format === "DOCUMENT" ? 100 : 5;
      if (file.size > maxMB * 1024 * 1024) {
        toast.error(`File too large. Max ${maxMB}MB for ${format}.`);
        return;
      }

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);

      try {
        setUploading(true);

        // Temporary: use file name as placeholder handle (replace with real handle above)
        const handle = file.name;

        onChange({ ...header, mediaHandle: handle, mediaPreview: previewUrl });
        toast.success("Media ready — handle set.");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [format, header, onChange],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearMedia = () =>
    onChange({ ...header, mediaHandle: "", mediaPreview: null });

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
        {format} File
      </label>

      {/* If media already set → show preview */}
      {header.mediaPreview || header.mediaHandle ? (
        <div className="relative flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#27AE60] flex items-center justify-center text-white flex-shrink-0">
            {MEDIA_ICON[format]}
          </div>
          <div className="flex-1 min-w-0">
            {format === "IMAGE" && header.mediaPreview && (
              <img
                src={header.mediaPreview}
                alt="preview"
                className="w-full max-h-24 object-cover rounded-lg mb-1"
              />
            )}
            {format === "VIDEO" && header.mediaPreview && (
              <video
                src={header.mediaPreview}
                className="w-full max-h-24 rounded-lg mb-1"
                controls
              />
            )}
            <p className="text-xs font-semibold text-[#1A7A43] truncate">
              {header.mediaHandle || "Media ready"}
            </p>
            <p className="text-[10px] text-[#27AE60]">{format} file loaded</p>
          </div>
          <button
            type="button"
            onClick={clearMedia}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#C2EDD6] text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-[#27AE60] bg-[#E8F8EF]"
              : "border-gray-300 bg-gray-50 hover:border-[#27AE60] hover:bg-[#E8F8EF]"
          }`}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin text-[#27AE60]" />
          ) : (
            <Upload
              size={22}
              className={dragOver ? "text-[#27AE60]" : "text-gray-400"}
            />
          )}
          <div className="text-center">
            <p
              className={`text-xs font-semibold ${dragOver ? "text-[#27AE60]" : "text-gray-500"}`}
            >
              {uploading
                ? "Uploading…"
                : `Drop ${format.toLowerCase()} here or click to browse`}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {format === "IMAGE" && "JPEG, PNG, WEBP · max 5MB"}
              {format === "VIDEO" && "MP4, 3GPP · max 16MB"}
              {format === "DOCUMENT" && "PDF · max 100MB"}
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={MEDIA_ACCEPT[format]}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Manual handle input */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Or paste Meta media handle directly
        </label>
        <input
          className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300"
          placeholder="e.g. 4:abc123def456..."
          value={header.mediaHandle || ""}
          onChange={(e) => onChange({ ...header, mediaHandle: e.target.value })}
        />
      </div>
    </div>
  );
};