// frontend/admin-dashboard/src/pages/Commercial/CreateCommercial.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import { ArrowLeft, ImagePlus, XCircle } from "lucide-react";

import { createCommercialPropertyService } from "../../services/CommercialServices/CreateCommercialPropertyService";
import authAxios from "../../config/authApi";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";

// ---------- Helper ----------
const toSlug = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

// ---------- MAIN COMPONENT ----------
export default function CreateCommercial() {
  const navigate = useNavigate();

  // ----------------------------------------------------------------
  // 1️⃣ AUTO FETCH LOGGED-IN USER (createdBy)
  // ----------------------------------------------------------------
  const { data: userRes, isLoading: userLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authAxios.get(USER_API_ENDPOINTS.USER_DETAILS);
      return res.data;
    },
  });

  const loggedInUserId = userRes?.user?.id || "";

  // ----------------------------------------------------------------
  // 2️⃣ FORM STATE
  // ----------------------------------------------------------------
  const [form, setForm] = useState({
    title: "",
    slug: "",
    listingType: "sale",
    listingSource: "Sales Manager", // default
    address: "",
    description: "",
    city: "",
    state: "",
    pincode: "",
    currency: "INR",

    price: "",
    pricePerSqft: "",

    // Location (lng, lat)
    location: {
      type: "Point",
      coordinates: ["", ""],
    },

    // Gallery
    galleryFiles: [], // Files
    gallery: [], // [{ caption, order }]

    // Additional details
    floorNumber: "",
    totalFloors: "",
    superBuiltUpArea: "",
    builtUpArea: "",
    carpetArea: "",
    furnishing: "",

    createdBy: "", // auto-filled later
  });

  // Setters
  const setField = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  // When user details arrive → auto-set createdBy
  useEffect(() => {
    if (loggedInUserId) {
      setForm((prev) => ({ ...prev, createdBy: loggedInUserId }));
    }
  }, [loggedInUserId]);

  // ----------------------------------------------------------------
  // 3️⃣ GALLERY HANDLERS
  // ----------------------------------------------------------------
  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);

    const previews = files.map((file, i) => ({
      caption: "",
      order: form.gallery.length + i,
      previewUrl: URL.createObjectURL(file),
    }));

    setForm((prev) => ({
      ...prev,
      galleryFiles: [...prev.galleryFiles, ...files],
      gallery: [...prev.gallery, ...previews],
    }));
  };

  const removeGalleryItem = (index) => {
    setForm((prev) => ({
      ...prev,
      galleryFiles: prev.galleryFiles.filter((_, i) => i !== index),
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // ----------------------------------------------------------------
  // 4️⃣ SUBMIT MUTATION
  // ----------------------------------------------------------------
  const mutation = useMutation({
    mutationFn: createCommercialPropertyService,
    onSuccess: (res) => {
      alert("Commercial Property Created Successfully!");
      navigate(`/commercial/${res?.data?._id || res?._id}`);
    },
    onError: (err) => {
      console.error("Create Error:", err);
      alert("Failed: " + err?.message);
    },
  });

  // ----------------------------------------------------------------
  // 5️⃣ SUBMIT FORM
  // ----------------------------------------------------------------
  const submitForm = (e) => {
    e.preventDefault();

    if (!form.title || !form.city || !form.createdBy) {
      alert("Title, City and User Authentication required.");
      return;
    }

    const finalPayload = {
      ...form,
      slug: form.slug || toSlug(form.title),

      location: {
        type: "Point",
        coordinates: [
          Number(form.location.coordinates[0]),
          Number(form.location.coordinates[1]),
        ],
      },

      gallery: form.gallery.map((g, i) => ({
        caption: g.caption || "",
        order: g.order ?? i,
      })),
    };

    mutation.mutate(finalPayload);
  };

  if (userLoading) return <p className="p-4 text-center">Loading user…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-black"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold text-slate-900">
          Create Commercial Property
        </h1>
      </div>

      <form
        onSubmit={submitForm}
        className="space-y-10 bg-white shadow-xl p-8 rounded-2xl"
      >
        {/* --------------------------- BASIC INFO ---------------------------- */}
        <Section title="Basic Information">
          <Grid cols={2}>
            <Input
              label="Title"
              value={form.title}
              onChange={(v) => setField("title", v)}
            />
            <Input
              label="Slug"
              value={form.slug}
              onChange={(v) => setField("slug", v)}
            />
            <Input
              label="City"
              value={form.city}
              onChange={(v) => setField("city", v)}
            />
            <Input
              label="State"
              value={form.state}
              onChange={(v) => setField("state", v)}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(v) => setField("address", v)}
            />
            <Input
              label="Pincode"
              value={form.pincode}
              onChange={(v) => setField("pincode", v)}
            />
          </Grid>

          <Textarea
            label="Description"
            value={form.description}
            onChange={(v) => setField("description", v)}
          />

          <p className="text-sm text-slate-500 bg-slate-100 p-2 rounded">
            Logged-in User ID (auto): <b>{loggedInUserId}</b>
          </p>
        </Section>

        {/* --------------------------- PRICE & LOCATION ---------------------------- */}
        <Section title="Price & Location">
          <Grid cols={3}>
            <Input
              label="Price"
              value={form.price}
              onChange={(v) => setField("price", v)}
            />
            <Input
              label="Price per Sqft"
              value={form.pricePerSqft}
              onChange={(v) => setField("pricePerSqft", v)}
            />
            <Input
              label="Longitude (lng)"
              value={form.location.coordinates[0]}
              onChange={(v) =>
                setField("location", {
                  ...form.location,
                  coordinates: [v, form.location.coordinates[1]],
                })
              }
            />
            <Input
              label="Latitude (lat)"
              value={form.location.coordinates[1]}
              onChange={(v) =>
                setField("location", {
                  ...form.location,
                  coordinates: [form.location.coordinates[0], v],
                })
              }
            />
          </Grid>
        </Section>

        {/* --------------------------- GALLERY ---------------------------- */}
        <Section title="Gallery Images">
          <label className="flex items-center gap-3 w-fit px-4 py-2 border rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
            <ImagePlus className="w-5 h-5" />
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleGalleryUpload}
            />
          </label>

          {form.gallery.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              {form.gallery.map((g, i) => (
                <div
                  key={i}
                  className="relative border rounded-xl overflow-hidden"
                >
                  <img
                    src={g.previewUrl}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(i)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                  >
                    <XCircle className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* --------------------------- PROPERTY DETAILS ---------------------------- */}
        <Section title="Property Details">
          <Grid cols={3}>
            <Input
              label="Floor No"
              value={form.floorNumber}
              onChange={(v) => setField("floorNumber", v)}
            />
            <Input
              label="Total Floors"
              value={form.totalFloors}
              onChange={(v) => setField("totalFloors", v)}
            />
            <Input
              label="Super Built-up Area"
              value={form.superBuiltUpArea}
              onChange={(v) => setField("superBuiltUpArea", v)}
            />
            <Input
              label="Built-up Area"
              value={form.builtUpArea}
              onChange={(v) => setField("builtUpArea", v)}
            />
            <Input
              label="Carpet Area"
              value={form.carpetArea}
              onChange={(v) => setField("carpetArea", v)}
            />
            <Input
              label="Furnishing"
              value={form.furnishing}
              onChange={(v) => setField("furnishing", v)}
            />
          </Grid>
        </Section>

        {/* --------------------------- SUBMIT ---------------------------- */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
          >
            {mutation.isLoading ? "Creating..." : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------
 REUSABLE UI COMPONENTS
------------------------------------------------------------------ */
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
      <div className="bg-slate-50 p-5 rounded-xl">{children}</div>
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

function Input({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        rows={4}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-lg px-3 py-2 w-full"
      />
    </div>
  );
}
