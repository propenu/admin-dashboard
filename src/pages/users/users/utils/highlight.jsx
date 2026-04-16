import { useMemo } from "react";

export const Highlight = ({ text = "", query = "" }) => {
  const parts = useMemo(() => {
    if (!query || !text) return [text];

    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.split(new RegExp(`(${safeQuery})`, "gi"));
  }, [text, query]);

  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-[#27AE60]/20 text-[#27AE60] font-bold rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
};