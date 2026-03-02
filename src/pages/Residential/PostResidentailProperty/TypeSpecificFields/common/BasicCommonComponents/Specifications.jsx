import { useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const Specifications = ({error}) => {
  const { form, updateFieldValue, toggleArrayValue } = useActivePropertySlice();

  const [specCategory, setSpecCategory] = useState("");
  const [specTitle, setSpecTitle] = useState("");
  const [specDescription, setSpecDescription] = useState("");

  const [specErrors, setSpecErrors] = useState({});

  
  

  return (
    <div className="space-y-4">
      <p className="text-[13px] font-weight-bold uppercase text-[#000000] font-poppins">
        Specifications
      </p>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* CATEGORY + TITLE (ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CATEGORY */}
        <div className="space-y-2">
          <label className="text-sm font-weight-bold text-[#000000]">
            Category
          </label>
          <input
            type="text"
            placeholder="e.g. Interior"
            value={specCategory}
            onChange={(e) => {
              setSpecCategory(e.target.value);
              setSpecErrors((prev) => {
                if (!prev.specCategory) return prev;
                const updated = { ...prev };
                delete updated.specCategory;
                return updated;
              });
            }}
            className="w-full p-3 border border-[#27AE60] rounded-lg text-sm text-[#000000] placeholder:text-[#524d4d] outline-none"
          />
          {specErrors.specCategory && (
            <p className="text-red-500 text-xs">{specErrors.specCategory}</p>
          )}
        </div>

        {/* TITLE */}
        <div className="space-y-2">
          <label className="text-sm font-weight-bold text-[#000000]">
            Title
          </label>
          <input
            type="text"
            placeholder="e.g. Flooring"
            value={specTitle}
            onChange={(e) => {
              setSpecTitle(e.target.value);
              setSpecErrors((prev) => {
                if (!prev.specTitle) return prev;
                const updated = { ...prev };
                delete updated.specTitle;
                return updated;
              });
            }}
            className="w-full p-3 border border-[#27AE60] rounded-lg text-sm text-[#000000] placeholder:text-[#524d4d] outline-none"
          />
          {specErrors.specTitle && (
            <p className="text-red-500 text-xs">{specErrors.specTitle}</p>
          )}
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label className="text-sm font-weight-bold text-[#000000]">
          Description
        </label>
        <textarea
          placeholder="e.g. Vitrified tiles in all rooms"
          value={specDescription}
          onChange={(e) => {
            setSpecDescription(e.target.value);
            setSpecErrors((prev) => {
              if (!prev.specDescription) return prev;
              const updated = { ...prev };
              delete updated.specDescription;
              return updated;
            });
          }}
          className="w-full p-3 border border-[#27AE60] placeholder:text-[#524d4d] rounded-lg text-sm outline-none resize-none"
          rows={3}
        />
        {specErrors.specDescription && (
          <p className="text-red-500 text-xs">{specErrors.specDescription}</p>
        )}
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        onClick={() => {
          const newErrors = {};
          if (!specCategory.trim()) newErrors.specCategory = "Enter Category";
          if (!specTitle.trim()) newErrors.specTitle = "Enter Title";
          if (!specDescription.trim())
            newErrors.specDescription = "Enter Description";

          if (Object.keys(newErrors).length > 0) {
            setSpecErrors(newErrors);
            return;
          }

           if (!specCategory || !specTitle) return;
          const nextOrder = (form.specifications?.length || 0) + 1;
          const newSpec = {
            category: specCategory,
            order: nextOrder,
            items: [
              {
                title: specTitle,
                description: specDescription || "",
              },
            ],
          };
          updateFieldValue("specifications", [
            ...(form.specifications || []),
            newSpec,
          ]);

          // 5️⃣ reset inputs
          setSpecCategory("");
          setSpecTitle("");
          setSpecDescription("");
        }}
        className="px-5 py-2 rounded-lg bg-[#27AE60] text-white text-sm font-semibold"
      >
        Add Specification
      </button>
    </div>
  );
};

export default Specifications;
