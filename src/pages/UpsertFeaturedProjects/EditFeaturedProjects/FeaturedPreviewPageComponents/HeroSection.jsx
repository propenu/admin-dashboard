// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/HeroSection.jsx
import React, { useState, useMemo } from "react";

function HeroSectionBase({ data }) {
  if (!data) return null;

 

  const hero = useMemo(
    () => ({
      heroImage:
        typeof data.heroImage === "string"
          ? data.heroImage
          : data.heroImage instanceof File
            ? URL.createObjectURL(data.heroImage)
            : data.heroImage?.url || data.heroImage?.location,

      logo:
        typeof data.logo === "string"
          ? data.logo
          : data.logo instanceof File
            ? URL.createObjectURL(data.logo)
            : data.logo?.url || data.logo?.location,

      tagline: data.heroTagline,
      subTagline: data.heroSubTagline,
      description: data.heroDescription,
      color: data.color || "#27AE60",
    }),
    [data],
  );

  
  const stats = useMemo(() => {
    
    const fmt = (v) => v ? `₹${(v / 10000000).toFixed(1)} Cr` : "";
    const items = [
      { label: "Starting Price", value: fmt(data.priceFrom) },
      {
        label: "Configurations",
        value: (data.bhkSummary?.map((b) => b.bhkLabel.charAt(0)).join("/")+" BHK")|| "—",
      },
      { label: "Amenities", value: `${data.amenities?.length || 0}+` },
    ];
    if (data.reraNumber) items.push({ label: "Approved", value: "RERA ✓" });
    return items;
  }, [data]);

  const [form, setForm]       = useState({ name: "", phone: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  function handleInput(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setForm({ name: "", phone: "", email: "", message: "" });
    setSent(true);
    setLoading(false);
  }


  

  return (
    <section className="relative overflow-hidden min-h-full rounded-2xl">
      {/* BG image */}
      {hero.heroImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
          style={{ backgroundImage: `url(${hero.heroImage})` }}
        />
      )}
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />

      {/* Logo */}
      {hero.logo && (
        <div className="absolute top-5 left-5 z-10">
          <img
            src={hero.logo}
            alt="Logo"
            className="h-12 w-auto object-contain bg-white/10 backdrop-blur-sm rounded-xl p-1.5 border border-white/20"
          />
        </div>
      )}

      {/* RERA badge */}
      {data.reraNumber && (
        <div className="absolute top-5 right-5 z-10">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border text-white"
            style={{ borderColor: hero.color, backgroundColor: `${hero.color}33` }}
          >
            RERA Approved
          </span>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end min-h-[520px]">

        {/* Left — text + stats */}
        <div className="lg:col-span-7 flex flex-col justify-end gap-6 pb-2">
          <div>
            {hero.tagline && (
              <p className="text-white/70 text-sm font-medium mb-1 tracking-wide">
                {hero.tagline}
              </p>
            )}
            {hero.subTagline && (
              <p className="text-white/70 text-sm font-medium mb-1 tracking-wide">
                {hero.subTagline}
              </p>
            )}
            {hero.description && (
              <h1
                className="text-2xl lg:text-sm font-black leading-tight text-white  "
                style={{ textShadow: `0 2px 20px ${hero.color}60` }}
              >
                {hero.description}
              </h1>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-4">
            {stats.map((st, i) => (
              <div key={i} className="flex flex-col">
                <span
                  className="text-sm font-extrabold"
                  style={{ color: hero.color }}
                >
                  {st.value || "—"}
                </span>
                <span className="text-[10px] text-white/50 mt-0.5 uppercase tracking-wider">
                  {st.label}
                </span>
              </div>
            ))}
          </div>

          <button
            className="w-fit flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
            style={{ backgroundColor: hero.color }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3v18l15-9L5 3z" />
            </svg>
            Explore Project
          </button>
        </div>

        {/* Right — enquiry form */}
        <div className="lg:col-span-5">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <span
                className="w-1 h-4 rounded-full"
                style={{ backgroundColor: hero.color }}
              />
              Quick Enquiry
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {["name", "phone", "email"].map((f) => (
                <input
                  key={f}
                  name={f}
                  type={f === "email" ? "email" : "text"}
                  value={form[f]}
                  onChange={handleInput}
                  placeholder={f === "phone" ? "Mobile Number" : f.charAt(0).toUpperCase() + f.slice(1)}
                  required={f !== "email"}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ "--tw-ring-color": hero.color }}
                />
              ))}
              <textarea
                name="message"
                value={form.message}
                onChange={handleInput}
                rows={2}
                placeholder="Your message (optional)"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 transition resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white font-bold py-2.5 rounded-xl transition-all hover:brightness-110 active:scale-95 text-sm disabled:opacity-60"
                style={{ backgroundColor: hero.color }}
              >
                {loading ? "Sending…" : "Submit Enquiry"}
              </button>
              {sent && (
                <p className="text-xs text-center font-medium" style={{ color: hero.color }}>
                  ✓ Enquiry submitted successfully!
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(HeroSectionBase);