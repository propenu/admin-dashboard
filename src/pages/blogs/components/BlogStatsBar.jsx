// src/features/blogs/components/BlogStatsBar.jsx
import React from "react";
import { FileText, Globe, FileEdit, Star } from "lucide-react";

const BlogStatsBar = ({ blogs = [] }) => {
  const total = blogs.length;
  const published = blogs.filter((b) => b?.published).length;
  const drafts = blogs.filter((b) => !b?.published).length;
  const featured = blogs.filter((b) => b?.featured).length;

  const stats = [
    {
      label: "Total Blogs",
      value: total,
      icon: <FileText size={16} />,
      color: "text-gray-600 bg-gray-50 border-gray-200",
    },
    {
      label: "Published",
      value: published,
      icon: <Globe size={16} />,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Drafts",
      value: drafts,
      icon: <FileEdit size={16} />,
      color: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Featured",
      value: featured,
      icon: <Star size={16} />,
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.color}`}
        >
          <div className="flex-shrink-0">{s.icon}</div>
          <div>
            <p className="text-lg font-bold leading-none">{s.value}</p>
            <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlogStatsBar;
