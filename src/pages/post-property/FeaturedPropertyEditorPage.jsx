// D:\propenu\frontend\admin-dashboard\src\pages\post-property\FeaturedPropertyEditorPage.jsx


import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  
import { fetchPostFeaturedPropertyById } from "../../services/PostAPropertyService";  
// small helper to format currency
const formatINR = (value) =>
  typeof value === "number"
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value)
    : value;

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-sm text-slate-500">Loading property…</div>
    </div>
  );
}

function Error({ message }) {
  return (
    <div className="p-4 bg-red-50 text-red-700 rounded">
      <strong>Error:</strong> {message}
    </div>
  );
}

/**
 * Left editor: shows editable controls populated from backend.
 * At this stage the Save button is present but unimplemented (placeholder).
 */
function LeftEditor({ formData, setFormData, isSaving }) {
  if (!formData) return null;

  const onChange = (name) => (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <aside className="lg:col-span-4 xl:col-span-3">
      <div className="sticky top-6 space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold">Featured property — editor</h2>
          <p className="text-sm text-gray-500 mt-1">
            Data pulled from backend. Edit locally and save later.
          </p>

          <div className="mt-4 space-y-3">
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-white flex items-center justify-between">
                <div>
                  <div className="font-medium">Hero / Banner</div>
                  <div className="text-xs text-gray-500">
                    Top image, title and taglines
                  </div>
                </div>
              </div>
              <div className="p-4 border-t space-y-2">
                <input
                  name="title"
                  value={formData.title || ""}
                  onChange={onChange("title")}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="heroSubTagline"
                  value={formData.heroSubTagline || ""}
                  onChange={onChange("heroSubTagline")}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="heroDescription"
                  value={formData.heroDescription || ""}
                  onChange={onChange("heroDescription")}
                  className="w-full p-2 border rounded"
                />
                <input
                  name="heroImage"
                  value={formData.heroImage || ""}
                  onChange={onChange("heroImage")}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-white">
                <div className="font-medium">Basic details</div>
                <div className="text-xs text-gray-500">
                  Address, possession, towers, units
                </div>
              </div>
              <div className="p-4 border-t space-y-2">
                <input
                  name="address"
                  value={formData.address || ""}
                  onChange={onChange("address")}
                  className="w-full p-2 border rounded"
                  placeholder="Address"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="city"
                    value={formData.city || ""}
                    onChange={onChange("city")}
                    className="p-2 border rounded"
                    placeholder="City"
                  />
                  <input
                    name="possessionDate"
                    value={formData.possessionDate || ""}
                    onChange={onChange("possessionDate")}
                    className="p-2 border rounded"
                    placeholder="Possession"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    name="totalTowers"
                    value={formData.totalTowers ?? ""}
                    onChange={onChange("totalTowers")}
                    className="p-2 border rounded"
                    placeholder="Towers"
                  />
                  <input
                    name="totalFloors"
                    value={formData.totalFloors || ""}
                    onChange={onChange("totalFloors")}
                    className="p-2 border rounded"
                    placeholder="Floors"
                  />
                </div>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-white">
                <div className="font-medium">Amenities</div>
                <div className="text-xs text-gray-500">
                  From backend (click to remove)
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.amenities || []).map((a, i) => (
                    <div
                      key={a.key || `${a.title}-${i}`}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full text-sm border"
                    >
                      <span>{a.title || a}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((s) => ({
                            ...s,
                            amenities: s.amenities.filter(
                              (_, idx) => idx !== i
                            ),
                          }))
                        }
                        className="text-xs text-gray-500 px-1 rounded hover:bg-slate-100"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <AddAmenityInput
                  onAdd={(val) =>
                    setFormData((s) => ({
                      ...s,
                      amenities: [...(s.amenities || []), { title: val }],
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={isSaving}
                className="px-4 py-2 bg-sky-600 text-white rounded disabled:opacity-60"
                onClick={() =>
                  alert("Save API not implemented in this step. Will add next.")
                }
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 border rounded"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Tip: This page loads data from the backend. Images are remote URLs
          (S3).
        </div>
      </div>
    </aside>
  );
}

/** small controlled input to add amenity */
function AddAmenityInput({ onAdd }) {
  const [val, setVal] = useState("");
  const add = () => {
    if (!val.trim()) return;
    onAdd(val.trim());
    setVal("");
  };
  return (
    <div className="flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="flex-1 p-2 border rounded"
        placeholder="Add amenity and press Add"
      />
      <button
        onClick={add}
        className="px-3 py-2 bg-orange-500 text-white rounded"
      >
        Add
      </button>
    </div>
  );
}

/**
 * Right preview: renders a clean responsive preview of the property.
 * Uses only formData (no external state).
 */
function RightPreview({ formData }) {
  if (!formData) return null;

  const bhkLabels = (formData.bhkSummary || [])
    .map((b) => b.bhkLabel)
    .join(" / ");
  const minPrice = formData.priceFrom
    ? formatINR(formData.priceFrom)
    : formData.priceFrom;
  const maxPrice = formData.priceTo
    ? formatINR(formData.priceTo)
    : formData.priceTo;

  return (
    <main className="lg:col-span-8 xl:col-span-9">
      {/* Hero */}
      <section className="relative h-[420px] rounded-2xl overflow-hidden shadow mb-6">
        <img
          src={formData.heroImage}
          alt="hero"
          className="w-full h-full object-cover brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

        <header className="absolute left-6 top-6">
          <div className="text-white text-sm bg-white/10 px-3 py-1 rounded-full inline-block">
            {formData.heroSubTagline}
          </div>
        </header>

        <div className="absolute left-6 bottom-20 text-white max-w-2xl">
          <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight drop-shadow-md">
            {formData.title}
          </h1>
          <p className="mt-2 text-md lg:text-lg max-w-xl">
            {formData.heroDescription}
          </p>

          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-white text-black rounded-full font-semibold">
              Explore
            </button>
            <button className="px-4 py-2 bg-[#ff6600] text-white rounded-full font-semibold">
              Contact
            </button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="absolute left-6 bottom-6 right-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div>
              <div className="text-xl font-bold">
                {minPrice} - {maxPrice}
              </div>
              <div className="text-xs opacity-80">Price Range</div>
            </div>
            <div>
              <div className="text-xl font-bold">{bhkLabels || "-"}</div>
              <div className="text-xs opacity-80">Configurations</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {(formData.amenities || []).length}
              </div>
              <div className="text-xs opacity-80">Amenities</div>
            </div>
            <div>
              <div className="text-xl font-bold">
                {formData.reraNumber || "RERA"}
              </div>
              <div className="text-xs opacity-80">RERA</div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Properties / Floorplans */}
      <section className="bg-[#fffaf6] rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Available Properties</h3>
            <div className="text-sm text-gray-500">
              Building excellence in {formData.city}
            </div>
          </div>
          <div>
            <div className="inline-flex bg-white rounded-full p-1 shadow">
              {(formData.bhkSummary || []).map((b, idx) => (
                <button key={idx} className="px-3 py-2 text-sm rounded-full">
                  {b.bhkLabel}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-6 rounded">
            <div className="flex gap-4 text-sm text-gray-600 mb-4 flex-wrap">
              {(formData.bhkSummary || []).map((b, i) => (
                <div key={i} className="px-3 py-1 bg-white/30 rounded">
                  {b.units && b.units[0] ? `${b.units[0].minSqft} sqft` : "-"}
                </div>
              ))}
            </div>

            <div className="rounded overflow-hidden border">
              <img
                src={formData.floorplanImage || formData.heroImage}
                alt="floorplan"
                className="w-full object-contain"
              />
            </div>
          </div>

          <aside className="bg-white p-6 rounded">
            <div className="text-right text-xl font-semibold">
              {formData.priceFrom ? formatINR(formData.priceFrom) : "-"}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {formData.bhkSummary?.[0]?.units?.[0]
                ? `${
                    formData.bhkSummary[0].units[0].minSqft
                  } sqft • ${formatINR(
                    formData.bhkSummary[0].units[0].maxPrice
                  )}`
                : "-"}
            </div>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li>Possession: {formData.possessionDate || "-"}</li>
              <li>Total Towers: {formData.totalTowers || "-"}</li>
              <li>Total Units: {formData.totalUnits || "-"}</li>
            </ul>
            <button className="mt-6 w-full bg-[#ff6600] text-white py-2 rounded">
              Book a Consultation
            </button>
          </aside>
        </div>
      </section>

      {/* Amenities */}
      <section className="mb-6">
        <h4 className="text-xl font-semibold mb-2">Amenities</h4>
        <div className="text-sm text-gray-500 mb-4">
          Building excellence in {formData.city}
        </div>
        <div className="flex flex-wrap gap-3">
          {(formData.amenities || []).map((a, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-full border bg-white text-sm"
            >
              {a.title || a}
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section className="mb-6">
        <h4 className="text-xl font-semibold mb-2">Gallery</h4>
        <div className="text-sm text-gray-500 mb-4">
          Building excellence in {formData.city}
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 rounded overflow-hidden">
            <img
              src={
                (formData.gallerySummary && formData.gallerySummary[0]) ||
                formData.heroImage
              }
              alt="g0"
              className="w-full h-64 object-cover rounded"
            />
          </div>
          <div className="col-span-5 grid grid-rows-2 gap-3">
            <img
              src={formData.gallerySummary?.[1] || formData.heroImage}
              alt="g1"
              className="w-full h-32 object-cover rounded"
            />
            <div className="grid grid-cols-2 gap-3">
              <img
                src={formData.gallerySummary?.[2] || formData.heroImage}
                alt="g2"
                className="w-full h-32 object-cover rounded"
              />
              <img
                src={formData.gallerySummary?.[3] || formData.heroImage}
                alt="g3"
                className="w-full h-32 object-cover rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About / Footer */}
      <section className="mb-6 bg-white p-6 rounded">
        <h4 className="text-xl font-semibold mb-2">About Us</h4>
        <div className="text-sm text-gray-700">
          {formData.metaDescription ||
            "Leading developers with proven track record."}
        </div>
      </section>
    </main>
  );
}

/**
 * Page component: orchestrates fetch and state
 */
export default function FeaturedPropertyEditorPage() {
  const { id } = useParams(); // route param
  const propertyId = id  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const res = await fetchPostFeaturedPropertyById(propertyId);
        // your service returns { data: { ... } } based on provided sample
        const payload = res?.data ?? res;
        if (!mounted) return;
        // normalize/shape data for UI convenience
        setFormData({
          ...payload,
          // ensure arrays exist
          amenities: payload.amenities || [],
          bhkSummary: payload.bhkSummary || [],
          gallerySummary: payload.gallerySummary || [],
          floorplanImage: payload.floorplanImage || "",
        });
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "Failed to load property");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* top navbar (micro site) */}
      {/* <MicroSiteNavbar
        links={[
          { href: "/", title: "Home" },
          { href: "/projects", title: "Projects" },
          { href: `/post-property/${propertyId}`, title: "Editor" },
        ]}
        logoUrl={formData?.logo || "/logo.png"}
        brochureUrl={formData?.brochure}
        color={formData?.color || "#FFAC1D"}
      /> */}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        {loading ? (
          <div className="lg:col-span-12">
            <Loading />
          </div>
        ) : error ? (
          <div className="lg:col-span-12">
            <Error message={error} />
          </div>
        ) : (
          <>
            <LeftEditor
              formData={formData}
              setFormData={setFormData}
              isSaving={isSaving}
            />
            <RightPreview formData={formData} />
          </>
        )}
      </div>
    </div>
  );
}
