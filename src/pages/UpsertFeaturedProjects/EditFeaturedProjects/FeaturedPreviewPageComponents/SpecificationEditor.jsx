// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/SpecificationEditor.jsx
import React from "react";
import { toast } from "react-hot-toast";
import { pasteRichAsPlainText } from "../../../../utils/pasteRichPlainText";

export default function SpecificationEditor({
  formData,
  setFormData,
  setLivePreviewData,
  saving,
  onSave,
}) {
  const specs = formData.specifications || [];

  function sync(updated) {
    const next = { ...formData, specifications: updated };
    setFormData(next);
    setLivePreviewData(next);
  }

  // Keep a single editable group — no "+ Add Group" button
  React.useEffect(() => {
    if ((formData.specifications || []).length === 0) {
      sync([
        {
          category: "",
          order: 0,
          items: [{ title: "", description: "" }],
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.specifications?.length]);

  function updateItem(gIndex, iIndex, field, value) {
    const updated = specs.map((g, gi) => {
      if (gi !== gIndex) return g;
      const current = g.items?.[iIndex] || { title: "", description: "" };
      return {
        ...g,
        items: [{ ...current, [field]: value }],
      };
    });
    sync(updated);
  }

  function removeCategory(gIndex) {
    const next = specs
      .filter((_, i) => i !== gIndex)
      .map((g, i) => ({ ...g, order: i }));
    sync(
      next.length
        ? next
        : [
            {
              category: "",
              order: 0,
              items: [{ title: "", description: "" }],
            },
          ],
    );
  }

  async function saveSpecifications() {
    try {
      await onSave({ specifications: specs });
      toast.success("Specifications saved!");
    } catch {
      toast.error("Save failed");
    }
  }

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      style={{ maxHeight: "82vh" }}
    >
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                Specifications Editor
              </h3>
              <p className="text-[10px] text-gray-400">
                {specs.length} {specs.length === 1 ? "group" : "groups"} ·
                description only
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">
        {specs.map((group, gIndex) => (
          <div
            key={gIndex}
            className="rounded-xl border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#27AE60]/5 to-transparent px-4 py-3 border-b border-gray-100">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                style={{ backgroundColor: "#27AE60" }}
              >
                {gIndex + 1}
              </div>
              <p className="flex-1 text-sm font-bold text-gray-800">
                Spec group {gIndex + 1}
              </p>
              {specs.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeCategory(gIndex)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Remove group"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              ) : null}
            </div>

            <div className="p-3 space-y-2 bg-gray-50/40">
              {(group.items?.length
                ? group.items.slice(0, 1)
                : [{ title: "", description: "" }]
              ).map((item, iIndex) => (
                <div
                  key={iIndex}
                  className="bg-white rounded-xl border border-gray-100 p-3 hover:border-[#27AE60]/30 hover:shadow-sm transition-all"
                >
                  <p className="mb-1.5 text-[10px] font-black uppercase tracking-wide text-[#27AE60]">
                    Description
                  </p>
                  <textarea
                    className="w-full min-h-[280px] text-sm text-gray-700 outline-none placeholder-gray-300 resize-y bg-transparent leading-relaxed focus:text-gray-900 transition-colors whitespace-pre-wrap"
                    placeholder="Paste or type specification text exactly…"
                    value={item.description}
                    rows={18}
                    spellCheck={false}
                    onChange={(e) =>
                      updateItem(gIndex, iIndex, "description", e.target.value)
                    }
                    onPaste={(e) =>
                      pasteRichAsPlainText(e, item.description, (v) =>
                        updateItem(gIndex, iIndex, "description", v),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          type="button"
          onClick={saveSpecifications}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? "Saving…" : "Save Specifications"}
        </button>
      </div>
    </div>
  );
}
