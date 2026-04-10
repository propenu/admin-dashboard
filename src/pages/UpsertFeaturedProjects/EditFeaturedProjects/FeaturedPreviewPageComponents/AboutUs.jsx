// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/AboutUs.jsx
import React, { useMemo } from "react";

export default function AboutUS(props) {
  const { aboutSummary: raw, primaryColor } = props;
  const color = primaryColor || "#27AE60";

  const data = useMemo(() => {
    const items = Array.isArray(raw) ? raw : raw?.aboutSummary || [];
    return items.length ? items[0] : null;
  }, [raw]);

  const imageUrl = data?.url || data?.imagePreview;

  return (
    <section className="p-6 lg:p-8">
      {/* Main description */}
      <div className="mb-8">

        <div className="text-gray-600 text-sm leading-7 space-y-3">
          {data?.aboutDescription ? (
            data.aboutDescription
              .split("\n")
              .filter((l) => l.trim())
              .map((line, i) => (
                <p key={i} className="text-gray-600 leading-relaxed">
                  {line.trim()}
                </p>
              ))
          ) : (
            <p className="text-gray-300 italic">No description available.</p>
          )}
        </div>
      </div>

      {/* Image + Highlights grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Image */}
        <div className="lg:col-span-5">
          <div className="relative   rounded-2xl overflow-hidden shadow-lg group">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt="Property"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full min-h-[280px] bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs">No image uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* Highlights panel */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <svg className="w-3 h-3" fill="none" stroke={color} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-gray-400">Key Highlights</h3>
            </div>

            {data?.rightContent ? (
              <div
                className={`
                  text-gray-700 text-sm leading-7
                  [&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_ul]:space-y-2.5
                  [&_ol]:pl-5 [&_ol]:space-y-2.5
                  [&_li]:relative [&_li]:pl-6 [&_li]:text-sm
                  [&_ul_li::before]:content-['›']
                  [&_ul_li::before]:absolute [&_ul_li::before]:left-0
                  [&_ul_li::before]:font-black [&_ul_li::before]:text-base
                  [&_strong]:text-gray-900 [&_strong]:font-bold
                  [&_h1]:text-xl [&_h1]:font-black [&_h1]:mb-3
                  [&_h2]:text-lg [&_h2]:font-bold [&_h2]:mb-2
                  [&_p]:mb-3
                `}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: data.rightContent }}
                  style={{ color: "#374151" }}
                />
              </div>
            ) : (
              <p className="text-gray-300 italic text-sm">No highlights added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic bullet color */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .lg\\:col-span-7 ul li::before { color: ${color} !important; }
          .lg\\:col-span-7 ol li::marker { color: ${color} !important; font-weight: 800; }
        `,
      }} />
    </section>
  );
}