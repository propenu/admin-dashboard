import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronDown,
  Info,
} from "lucide-react";
import { CATEGORIES, LANGUAGES } from "../../utils/constants";


export const InfoSection = ({ form, setField }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
      <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        1
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">Template Info</p>
        <p className="text-xs text-gray-400">
          Name, language and category — submitted to Meta
        </p>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
          Template Name <span className="text-red-400">*</span>
        </label>
        <input
          required
          className="w-full px-3 py-2.5 text-sm font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
          placeholder="e.g. property_inquiry_response_v1"
          value={form.name}
          onChange={(e) =>
            setField(
              "name",
              e.target.value
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, ""),
            )
          }
        />
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Lowercase, numbers and underscores only. Each name
          must be unique across languages.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Language
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-8"
              value={form.language}
              onChange={(e) => setField("language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-8"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
      {/* Meta error hint */}
      {/* <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          If you get <strong>"Content in this language already exists"</strong>,
          change the template name or increment the version suffix (e.g. _v2).
        </p>
      </div> */}
    </div>
  </div>
);