// src/pages/post-property/featured-create/steps/Components/SpecificationsStep.jsx
import { forwardRef, useImperativeHandle, useState, useRef } from "react";
import { X, Plus, ListChecks } from "lucide-react";

const inp = (err) => `w-full px-3 py-2.5 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
  outline-none placeholder:text-gray-400 transition-all duration-200
  ${err ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"}`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

/** Paste clipboard as exact plain text (keeps newlines / spacing from external copy). */
function pasteExactPlainText(e, currentValue, setValue) {
  e.preventDefault();
  const pasted = e.clipboardData?.getData("text/plain") ?? "";
  const el = e.target;
  const start = typeof el.selectionStart === "number" ? el.selectionStart : currentValue.length;
  const end = typeof el.selectionEnd === "number" ? el.selectionEnd : currentValue.length;
  const next = `${String(currentValue || "").slice(0, start)}${pasted}${String(currentValue || "").slice(end)}`;
  setValue(next);
  requestAnimationFrame(() => {
    try {
      const pos = start + pasted.length;
      el.selectionStart = pos;
      el.selectionEnd = pos;
    } catch {
      /* ignore */
    }
  });
}

const SpecificationsStep = forwardRef(({ payload, update }, ref) => {
  const specs = payload.specifications || [];
  const [errors, setErrors] = useState({});
  const specRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      specs.forEach((cat, i) => {
        cat.items.forEach((item, j) => {
          if (!String(item.description || "").trim()) {
            e[`spec-${i}-item-${j}-desc`] = "Required";
          }
        });
      });
      setErrors(e);
      if (Object.keys(e).length) {
        specRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    },
  }));

  const clr = (key) =>
    setErrors((p) => {
      const c = { ...p };
      delete c[key];
      return c;
    });

  const addCategory = () =>
    update({
      specifications: [
        ...specs,
        {
          category: "",
          order: specs.length,
          items: [{ title: "", description: "" }],
        },
      ],
    });

  const remCat = (i) =>
    update({ specifications: specs.filter((_, idx) => idx !== i) });
  const addItem = (i) => {
    const n = [...specs];
    n[i].items.push({ title: "", description: "" });
    update({ specifications: n });
  };
  const updItem = (i, j, k, v) => {
    const n = [...specs];
    n[i].items[j][k] = v;
    update({ specifications: n });
    clr(`spec-${i}-item-${j}-${k === "description" ? "desc" : k}`);
  };
  const remItem = (i, j) => {
    const n = [...specs];
    n[i].items = n[i].items.filter((_, idx) => idx !== j);
    update({ specifications: n });
  };

  return (
    <div className="space-y-5" ref={specRef}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
              border: "2px solid #bbf7d0",
            }}
          >
            <ListChecks size={17} style={{ color: "#27AE60" }} />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              Interior & Materials
            </p>
            <h3 className="text-base font-black text-gray-900">
              Specifications
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={addCategory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
        >
          <Plus size={14} strokeWidth={3} /> Add Group
        </button>
      </div>

      {errors.specifications && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.specifications}
        </div>
      )}

      {specs.length === 0 && (
        <div className="flex flex-col items-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
          <ListChecks size={36} className="mb-3 opacity-30" />
          <p className="font-bold text-sm">No specifications yet</p>
          <p className="text-xs mt-1">
            Add description items (paste from Excel / docs supported)
          </p>
        </div>
      )}

      {specs.map((cat, i) => (
        <div
          key={i}
          className="border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white"
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50">
            <div
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs font-black"
              style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
            >
              {i + 1}
            </div>
            <p className="flex-1 text-sm font-bold text-gray-700">
              Spec group {i + 1}
            </p>
            <button
              type="button"
              onClick={() => remCat(i)}
              className="p-2 text-red-500 hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all"
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-3">
            {cat.items.map((item, j) => (
              <div
                key={j}
                className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                    Item {j + 1}
                  </span>
                  {cat.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remItem(i, j)}
                      className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <label className={LABEL}>Description *</label>
                  <textarea
                    rows={4}
                    className={`${inp(errors[`spec-${i}-item-${j}-desc`])} resize-y whitespace-pre-wrap`}
                    placeholder="Paste or type specification text exactly…"
                    value={item.description}
                    onChange={(e) =>
                      updItem(i, j, "description", e.target.value)
                    }
                    onPaste={(e) =>
                      pasteExactPlainText(e, item.description, (v) =>
                        updItem(i, j, "description", v),
                      )
                    }
                    spellCheck={false}
                  />
                  {errors[`spec-${i}-item-${j}-desc`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => addItem(i)}
                className="flex items-center gap-2 text-sm font-black transition-colors"
                style={{ color: "#27AE60" }}
              >
                <Plus size={14} strokeWidth={3} /> Add Item
              </button>

              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-black hover:opacity-90 transition-all shadow-md"
                style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
              >
                <Plus size={14} strokeWidth={3} /> Add Group
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

export default SpecificationsStep;
