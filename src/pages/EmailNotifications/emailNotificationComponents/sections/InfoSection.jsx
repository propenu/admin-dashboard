import { CATEGORY_META } from "../../utils/Helpers";





export const InfoSection = ({ form, setField }) => {
  const handleNameChange = (v) => {
    setField("name", v);
    if (!form._id) {
      setField(
        "slug",
        v
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, ""),
      );
    }
  };
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          1
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">Template Info</p>
          <p className="text-xs text-gray-500">Name, slug and category</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
            Template Name <span className="text-red-400">*</span>
          </label>
          <input
            required
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
            placeholder="e.g. Diwali Property Offer"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>
        {/* <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Slug</label>
          <input
            className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-xl bg-gray-50 text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-300"
            placeholder="auto-generated"
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
          />
        </div> */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Category
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <button
                key={key}
                type="button"
                onClick={() => setField("category", key)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  form.category === key
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span
                  className={
                    form.category === key ? "text-green-600" : "text-gray-400"
                  }
                >
                  {meta.icon}
                </span>
                <span
                  className={`text-xs font-bold ${form.category === key ? "text-green-700" : "text-gray-500"}`}
                >
                  {meta.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
