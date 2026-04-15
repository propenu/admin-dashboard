import { AlertTriangle } from "lucide-react";
import TiptapEditor from "../../../UpsertFeaturedProjects/CreateFeaturedProjects/Components/TiptapEditor";



export const BodySection = ({ content, onChange }) => {
  const stripped = (content || "").replace(/<[^>]*>/g, " ");
  const invalidTokens = [...stripped.matchAll(/\{\{(\d+)\}\}/g)].map(
    (m) => m[0],
  );
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          4
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Email Body</p>
          <p className="text-xs text-gray-500">
            Type{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">
              {"{{variableName}}"}
            </span>{" "}
            — value filled in on save
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <TiptapEditor value={content} onChange={onChange} />
        </div>
        {invalidTokens.length > 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            {invalidTokens.map((t) => (
              <span
                key={t}
                className="font-mono bg-red-50 border border-red-200 px-1 rounded mr-1"
              >
                {t}
              </span>
            ))}
            — number tokens are ignored. Use a word name like{" "}
            <span className="font-mono bg-gray-100 px-1 rounded ml-1">
              {"{{discount}}"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};