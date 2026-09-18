// src/pages/post-property/featured-create/steps/Components/SpecificationsStep.jsx
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from "react";
import { X, ListChecks } from "lucide-react";
import TiptapEditor from "./TiptapEditor";

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5";

const emptyGroup = (order = 0) => ({
  category: "",
  order,
  items: [{ title: "", description: "" }],
});

const plainTextFromHtml = (value = "") =>
  String(value || "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const SpecificationsStep = forwardRef(({ payload, update }, ref) => {
  const specs = payload.specifications || [];
  const [errors, setErrors] = useState({});
  const specRef = useRef(null);

  // Single group only — no "+ Add Group" button
  useEffect(() => {
    if (!specs.length) {
      update({ specifications: [emptyGroup(0)] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specs.length]);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      specs.forEach((cat, i) => {
        const desc = plainTextFromHtml(cat.items?.[0]?.description || "");
        if (!desc) {
          e[`spec-${i}-item-0-desc`] = "Required";
        }
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

  const remCat = (i) => {
    const next = specs.filter((_, idx) => idx !== i);
    update({ specifications: next.length ? next : [emptyGroup(0)] });
  };

  const updItem = (i, j, k, v) => {
    const n = [...specs];
    const current = n[i].items?.[j] || { title: "", description: "" };
    n[i] = {
      ...n[i],
      items: [{ ...current, [k]: v }],
    };
    update({ specifications: n });
    clr(`spec-${i}-item-${j}-${k === "description" ? "desc" : k}`);
  };

  return (
    <div className="space-y-5" ref={specRef}>
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

      {errors.specifications && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.specifications}
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
            {specs.length > 1 ? (
              <button
                type="button"
                onClick={() => remCat(i)}
                className="p-2 text-red-500 hover:bg-red-50 border-2 border-red-100 rounded-xl transition-all"
              >
                <X size={15} />
              </button>
            ) : null}
          </div>

          <div className="p-5 space-y-3">
            {(cat.items?.length ? cat.items.slice(0, 1) : [{ title: "", description: "" }]).map(
              (item, j) => (
              <div
                key={j}
                className="bg-gray-50 border-2 border-gray-100 rounded-xl p-4 space-y-3"
              >
                <div>
                  <label className={LABEL}>Description *</label>
                  <p className="mb-2 text-[11px] text-slate-500">
                    Blog-style editor — paste from Word/Docs, bold, lists, tables, links.
                  </p>
                  <div
                    className={`rounded-xl border-2 overflow-hidden bg-white ${
                      errors[`spec-${i}-item-${j}-desc`]
                        ? "border-red-400"
                        : "border-gray-200 focus-within:border-[#27AE60]"
                    }`}
                  >
                    <TiptapEditor
                      value={item.description || ""}
                      onChange={(html) => updItem(i, j, "description", html)}
                      placeholder="Write or paste specification details…"
                    />
                  </div>
                  {errors[`spec-${i}-item-${j}-desc`] && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠ Required
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default SpecificationsStep;
