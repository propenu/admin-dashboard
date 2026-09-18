// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/Specifications.jsx
import React, { useState } from "react";

const PRIMARY = "#27AE60";

const looksLikeHtml = (value = "") => /<\/?[a-z][\s\S]*>/i.test(String(value || ""));

const sanitizeRichText = (value = "") =>
  String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "")
    .trim();

const plainText = (value = "") =>
  String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

/** One clear post per group — ignore empty leftover items from older data. */
const visibleItems = (group) => {
  const items = Array.isArray(group?.items) ? group.items : [];
  const filled = items.filter(
    (item) =>
      Boolean(String(item?.title || "").trim()) ||
      Boolean(plainText(item?.description || "")),
  );
  // Blog-style: show a single post (first filled, else first slot)
  if (filled.length <= 1) return filled.length ? [filled[0]] : items.slice(0, 1);
  return filled;
};

export default function Specification({ specifications = [], primaryColor }) {
  const color = primaryColor || PRIMARY;
  const [activeGroup, setActiveGroup] = useState(null);

  if (!specifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}12` }}
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">
          No specifications added yet
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Use the editor to add construction details
        </p>
      </div>
    );
  }

  const sorted = [...specifications].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );
  const visible =
    activeGroup === null ? sorted : sorted.filter((_, i) => i === activeGroup);
  const showTabs = sorted.length > 1;

  return (
    <section className="min-h-full">
      {showTabs ? (
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white shadow-sm">
          <div className="flex items-center gap-1 overflow-x-auto px-5 py-3 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveGroup(null)}
              className={`flex-none whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                activeGroup === null
                  ? "text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
              style={
                activeGroup === null
                  ? {
                      backgroundColor: color,
                      boxShadow: `0 4px 12px ${color}40`,
                    }
                  : {}
              }
            >
              All
            </button>

            {sorted.map((g, i) => (
              <button
                type="button"
                key={`${g.category || "group"}-${i}`}
                onClick={() => setActiveGroup(i)}
                className={`flex-none whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 ${
                  activeGroup === i
                    ? "text-white shadow-md"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                }`}
                style={
                  activeGroup === i
                    ? {
                        backgroundColor: color,
                        boxShadow: `0 4px 12px ${color}40`,
                      }
                    : {}
                }
              >
                {g.category?.trim() || `Group ${i + 1}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-8 px-5 py-6">
        {visible.map((group, index) => (
          <GroupSection
            key={`${group.category || "group"}-${index}`}
            group={group}
            color={color}
            showCategoryHeading={showTabs || Boolean(group.category?.trim())}
          />
        ))}
      </div>
    </section>
  );
}

function GroupSection({ group, color, showCategoryHeading }) {
  const items = visibleItems(group);
  const categoryLabel = group.category?.trim();

  return (
    <article>
      {showCategoryHeading && categoryLabel ? (
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}12` }}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke={color}
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-black leading-tight text-gray-800">
              {categoryLabel}
            </h3>
            <p className="mt-0.5 text-[10px] text-gray-400">
              Specification details
            </p>
          </div>
        </div>
      ) : null}

      {/* One clear full-width post — not a multi-card grid */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <SpecPost key={i} item={item} color={color} />
        ))}
      </div>
    </article>
  );
}

function SpecPost({ item, color }) {
  const title = String(item?.title || "").trim();
  const description = item?.description || "";
  if (!title && !plainText(description)) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}33)`,
        }}
      />
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {title ? (
          <h4 className="mb-3 text-base font-bold leading-snug text-gray-900">
            {title}
          </h4>
        ) : null}

        {description && looksLikeHtml(description) ? (
          <div
            className="prose prose-sm max-w-none text-gray-600 prose-headings:text-gray-800 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-table:text-xs prose-th:bg-slate-50 prose-th:px-2 prose-th:py-1.5 prose-td:px-2 prose-td:py-1.5"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(description) }}
          />
        ) : description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
