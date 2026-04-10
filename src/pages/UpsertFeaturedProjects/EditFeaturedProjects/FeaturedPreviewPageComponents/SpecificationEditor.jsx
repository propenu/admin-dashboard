// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/SpecificationEditor.jsx
import React from "react";
import { toast } from "react-hot-toast";

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

  function updateCategory(index, value) {
    const updated = [...specs];
    updated[index] = { ...updated[index], category: value };
    sync(updated);
  }

  function updateItem(gIndex, iIndex, field, value) {
    const updated = specs.map((g, gi) =>
      gi !== gIndex
        ? g
        : {
            ...g,
            items: g.items.map((item, ii) =>
              ii !== iIndex ? item : { ...item, [field]: value },
            ),
          },
    );
    sync(updated);
  }

  function addCategory() {
    sync([
      ...specs,
      {
        category: "New Category",
        order: specs.length,
        items: [{ title: "", description: "" }],
      },
    ]);
  }

  function removeCategory(gIndex) {
    sync(
      specs.filter((_, i) => i !== gIndex).map((g, i) => ({ ...g, order: i })),
    );
  }

  function addItem(gIndex) {
    const updated = specs.map((g, gi) =>
      gi !== gIndex
        ? g
        : { ...g, items: [...g.items, { title: "", description: "" }] },
    );
    sync(updated);
  }

  function removeItem(gIndex, iIndex) {
    const updated = specs.map((g, gi) =>
      gi !== gIndex
        ? g
        : { ...g, items: g.items.filter((_, ii) => ii !== iIndex) },
    );
    sync(updated);
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
      {/* ── Header ── */}
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
                {specs.length} {specs.length === 1 ? "category" : "categories"} · Live preview synced
              </p>
            </div>
          </div>
          {specs.length > 0 && (
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ backgroundColor: "#27AE6018", color: "#27AE60" }}
            >
              {specs.reduce((acc, g) => acc + (g.items?.length || 0), 0)} specs
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">

        {/* Empty state */}
        {specs.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-100 py-12 text-center">
            <div className="w-12 h-12 bg-[#27AE60]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-[#27AE60]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-semibold">No categories yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Click "+ Add Category" to get started
            </p>
          </div>
        )}

        {/* ── Category groups ── */}
        {specs.map((group, gIndex) => (
          <div
            key={gIndex}
            className="rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Category header row */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#27AE60]/5 to-transparent px-4 py-3 border-b border-gray-100">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black flex-shrink-0"
                style={{ backgroundColor: "#27AE60" }}
              >
                {gIndex + 1}
              </div>
              <input
                className="flex-1 bg-transparent text-sm font-bold text-gray-800 outline-none placeholder-gray-300 focus:text-[#27AE60] transition-colors"
                value={group.category}
                onChange={(e) => updateCategory(gIndex, e.target.value)}
                placeholder="Category Name"
              />
              <span className="text-[10px] text-gray-300 font-semibold flex-shrink-0 mr-1">
                {group.items?.length || 0} items
              </span>
              <button
                onClick={() => removeCategory(gIndex)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                title="Remove category"
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
            </div>

            {/* Items list */}
            <div className="p-3 space-y-2 bg-gray-50/40">
              {group.items.map((item, iIndex) => (
                <div
                  key={iIndex}
                  className="group relative bg-white rounded-xl border border-gray-100 p-3 hover:border-[#27AE60]/30 hover:shadow-sm transition-all"
                >
                  {/* Remove item button */}
                  <button
                    onClick={() => removeItem(gIndex, iIndex)}
                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md flex items-center justify-center text-gray-200 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove item"
                  >
                    <svg
                      className="w-3 h-3"
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

                  {/* Title input */}
                  <input
                    className="w-full pr-6 text-xs font-bold text-gray-700 outline-none placeholder-gray-300 mb-1.5 bg-transparent focus:text-[#27AE60] transition-colors"
                    placeholder="Spec title (e.g. Flooring)"
                    value={item.title}
                    onChange={(e) =>
                      updateItem(gIndex, iIndex, "title", e.target.value)
                    }
                  />

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-100 mb-1.5" />

                  {/* Description textarea */}
                  <textarea
                    className="w-full text-xs text-gray-500 outline-none placeholder-gray-300 resize-none bg-transparent leading-relaxed focus:text-gray-700 transition-colors"
                    placeholder="Value or description (e.g. Vitrified Tiles)"
                    value={item.description}
                    rows={2}
                    onChange={(e) =>
                      updateItem(gIndex, iIndex, "description", e.target.value)
                    }
                  />
                </div>
              ))}

              {/* Add item button */}
              <button
                onClick={() => addItem(gIndex)}
                className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#27AE60]/20 text-[#27AE60] text-xs font-bold hover:border-[#27AE60] hover:bg-[#27AE60]/5 transition-all"
              >
                + Add Item
              </button>
            </div>
          </div>
        ))}

        {/* ── Add category button ── */}
        <button
          onClick={addCategory}
          className="w-full py-3 border-2 border-dashed border-[#27AE60]/30 text-[#27AE60] rounded-xl text-sm font-bold hover:border-[#27AE60] hover:bg-[#27AE60]/5 transition-all flex items-center justify-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Category
        </button>
      </div>

      {/* ── Save button (pinned footer) ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={saveSpecifications}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Specifications
            </>
          )}
        </button>
      </div>
    </div>
  );
}
