
import {
  FileText,
  Image as ImageIcon,
  Video,
  FileType,
} from "lucide-react";
import { Toggle } from "../../common/Toggle";
import { HEADER_FORMATS } from "../../utils/constants";
import { MediaUploadZone } from "./MediaUploadZone";





export const HeaderSection = ({ header, onChange }) => (


  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          2
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Header{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional
            </span>
          </p>
          <p className="text-xs text-gray-400">Top section of the template</p>
        </div>
      </div>
      <Toggle
        on={header.enabled}
        onToggle={() => onChange({ ...header, enabled: !header.enabled })}
      />
    </div>

    {header.enabled && (
      <div className="p-4 flex flex-col gap-3">
        {/* Format selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {HEADER_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() =>
                  onChange({
                    ...header,
                    format: f,
                    text: "",
                    mediaHandle: "",
                    mediaPreview: null,
                  })
                }
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  header.format === f
                    ? "border-[#27AE60] bg-[#E8F8EF] text-[#1A7A43]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {f === "TEXT" && <FileText size={14} />}
                {f === "IMAGE" && <ImageIcon size={14} />}
                {f === "VIDEO" && <Video size={14} />}
                {f === "DOCUMENT" && <FileType size={14} />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* TEXT */}
        {header.format === "TEXT" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Header Text
            </label>
            <input
              maxLength={60}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
              placeholder="e.g. Inquiry Submitted"
              value={header.text}
              onChange={(e) => onChange({ ...header, text: e.target.value })}
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {header.text.length}/60
            </p>
          </div>
        )}

        {/* IMAGE / VIDEO / DOCUMENT */}
        {["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) && (
          <MediaUploadZone
            format={header.format}
            header={header}
            onChange={onChange}
          />
        )}
      </div>
    )}
  </div>
);