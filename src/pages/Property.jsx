//frontend/admin-dashboard/src/pages/Property.jsx

import React, { useState } from "react";

import { useEffect } from "react";
import { fetchPropertyById } from "../services/propertyservice";

import {
  Search,
  Menu,
  User,
  ChevronDown,
  Bed,
  Bath,
  Ruler,
  MapPin,
  Calendar,
  Heart,
  Dumbbell,
  Waves,
  Gift,
  Building2,
  ShoppingCart,
  Gauge,
  Package,
  Shield,
  Flower,
  Wind,
  Check,
  Navigation,
  ChevronRight,
  Play,
  Square,
  BadgeCheck,
  Home,
  Coffee,
} from "lucide-react";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Leaflet icon
const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

/* ============================================================= */
/* =====================  COMPONENTS  =========================== */
/* ============================================================= */

// HEADER ---------------------------------------------------------


function Header({ isMobileMenuOpen }) {
  return (
    <header className="bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/src/assets/propenulogo.svg" alt="logo" className="w-8 h-8" />
          <span className="text-green-700 font-semibold text-base sm:text-lg">
            Propenu
          </span>

          <div className="hidden md:flex items-center gap-2 px-2 py-1 border rounded-lg text-sm">
            <MapPin className="w-4 h-4 text-green-600" />
            <span>Hyderabad</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <nav className="hidden mr-10 md:flex items-center gap-6 text-sm">
          {[
            "Available Properties",
            "Amenities",
            "Map View",
            "Gallery",
            "About Us",
            "Brochure",
          ].map((t) => (
            <button key={t} className="text-gray-700 hover:text-green-600">
              {t}
            </button>
          ))}
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden py-3 border-t">
          <div className="flex flex-col gap-2">
            {[
              "Available Properties",
              "Amenities",
              "Map View",
              "Gallery",
              "About Us",
              "Brochure",
            ].map((item) => (
              <button
                key={item}
                className="text-left w-full px-2 py-2 text-gray-700"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// HERO ---------------------------------------------------------

function Hero({ project }) {
  if (!project) {
    return (
      <div className="text-center text-gray-500 py-10">Loading project...</div>
    );
  }

  const {
    heroSubTagline,
    heroDescription,
    priceFrom,
    priceTo,
    bhkSummary = [],
    amenities = [],
    reraNumber,
    heroImage,
    color
  } = project;

  const toCr = (n) => (n / 10000000).toFixed(1) + " Cr";

  // BHK Range
  const bhkList = bhkSummary?.map((b) => b.bhk);
  const minBHK = Math.min(...bhkList);
  const maxBHK = Math.max(...bhkList);

  return (
    <section className="relative w-full">
      <div className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroImage?.trim() || "/src/assets/bg.webp"}
            className="w-full h-[420px] sm:h-[520px] md:h-[620px] object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 py-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left text */}
              <div className="text-white pt-6 md:pt-12">
                <h1 className="font-extrabold text-[clamp(26px,6vw,48px)] leading-tight">
                  {heroSubTagline}
                  <br />
                  <span style={{ color: color?.trim() }}>
                    {heroDescription}
                  </span>
                </h1>

                <p className="text-gray-300 mt-4 max-w-lg">
                  Discover premium lifestyle homes designed with precision.
                </p>

                <div className="mt-8 flex flex-wrap gap-6 text-sm">
                  {/* Price Range */}
                  <div className="min-w-[110px]">
                    <div className="font-bold text-lg">
                      {toCr(priceFrom)} - {toCr(priceTo)}
                    </div>
                    <div className="text-xs border-b-2 border-yellow-400 pb-1">
                      Price Range
                    </div>
                  </div>

                  {/* BHK Range */}
                  <div className="min-w-[110px]">
                    <div className="font-bold text-lg">
                      {minBHK}-{maxBHK} BHK
                    </div>
                    <div className="text-xs border-b-2 border-yellow-400 pb-1">
                      Configurations
                    </div>
                  </div>

                  {/* Amenities Count */}
                  <div className="min-w-[110px]">
                    <div className="font-bold text-lg">{amenities.length}+</div>
                    <div className="text-xs border-b-2 border-yellow-400 pb-1">
                      Amenities
                    </div>
                  </div>

                  {/* RERA — show only if available */}
                  {reraNumber && (
                    <div className="min-w-[110px]">
                      <div className="font-bold text-lg">RERA</div>
                      <div className="text-xs border-b-2 border-yellow-400 pb-1">
                        Approved
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form stays same */}
              <div className="w-full">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl max-w-md ml-auto">
                  <h3 className="text-white text-xl font-bold mb-3">
                    Enquiry Now
                  </h3>

                  <form className="space-y-3">
                    <input
                      className="w-full px-3 py-2 rounded-md bg-white/90"
                      placeholder="First Name"
                    />
                    <input
                      className="w-full px-3 py-2 rounded-md bg-white/90"
                      placeholder="Email"
                    />
                    <input
                      className="w-full px-3 py-2 rounded-md bg-white/90"
                      placeholder="Phone"
                    />
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-md bg-white/90"
                      placeholder="Message"
                    />
                    <button className="w-full bg-yellow-400 py-2 rounded-md font-semibold">
                      Submit
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// AMENITIES ---------------------------------------------------------

 

function Amenities({ amenities = [] }) {
  // Key → Icon mapping
  const iconMap = {
    fitness: Dumbbell,
    garden: Flower,
    pool: Waves,
    security: Shield,
  };

  // Color palette
  const colors = [
    "bg-[#FFE9C8] text-[#FF9A00]",
    "bg-[#E7FCD9] text-[#34A853]",
    "bg-[#DDF1FF] text-[#0F83FF]",
    "bg-[#FFF0D9] text-[#B47B26]",
    "bg-[#FFF4C7] text-[#FFC800]",
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-14 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Amenities</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3">
        {amenities.length === 0 ? (
          <p className="text-gray-500 text-sm">No Amenities Available</p>
        ) : (
          amenities.map((item, idx) => {
            const Icon = iconMap[item.key] || Shield; // default fallback icon

            return (
              <div
                key={item.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium shadow-sm ${
                  colors[idx % colors.length]
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.title}</span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}



// AVAILABLE PROPERTIES --------------------------------------------
function AvailableProperties() {
  const [tab, setTab] = useState(0);

  const sqftList = [
    "1032 sqft",
    "1120 sqft",
    "1265 sqft",
    "1378 sqft",
    "1481 sqft",
    "1534 sqft",
    "1765 sqft",
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-14 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Available Properties</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-4">
        {["1 BHK", "2 BHK", "3 BHK"].map((t, idx) => (
          <button
            key={t}
            onClick={() => setTab(idx)}
            className={`px-4 py-2 rounded-md text-sm font-semibold min-w-fit border ${
              tab === idx
                ? "bg-gray-100 border-gray-300"
                : "text-gray-500"
            }`}
          >
            {t} FLAT
          </button>
        ))}
      </div>

      <div className="bg-[#FFFBF3] rounded-2xl p-5 shadow">
        {/* SQFT */}
        <div className="flex gap-4 overflow-x-auto text-sm font-semibold mb-4">
          {sqftList.map((s) => (
            <div key={s} className="whitespace-nowrap px-2 py-1">
              {s}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="rounded-xl overflow-hidden">
            <img
              src="src/assets/designplat.png"
              alt="floorplan"
              className="w-full object-cover max-h-[420px] rounded-xl"
            />
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-[clamp(18px,4vw,28px)] font-semibold text-gray-900">
                1,23 Cr
              </h3>
              <p className="text-gray-700 mt-2">1 BHK Flat, 1585 sqft</p>

              <div className="space-y-3 mt-6 text-gray-700 text-sm">
                <div className="flex items-center gap-3">
                  <Bath className="w-5 h-5" /> 2 Bathrooms
                </div>
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5" /> 1 Balcony
                </div>
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5" /> Parking
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" /> Possession: Dec. 2025
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button className="bg-[#FFA526] text-white px-5 py-3 rounded-lg font-semibold w-full md:w-auto">
                Book a Consultation
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// LOCATION MAP -----------------------------------------------------
function LocationMap() {
  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-14 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Locate Us</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {[
          "HITEC CITY: 15 Mins",
          "Gachibowli: 10 Mins",
          "Wipro Circle: 10 Mins",
          "Jubilee Hills: 20 Mins",
          "Airport: 25 Mins",
        ].map((b) => (
          <div key={b} className="flex items-center gap-2 text-sm text-gray-800">
            <MapPin className="w-4 h-4 text-yellow-500" /> <span>{b}</span>
          </div>
        ))}
      </div>

      <div className="relative">
        <MapContainer
          center={[17.4505, 78.3915]}
          zoom={13}
          className="w-full h-[300px] sm:h-[420px] rounded-2xl overflow-hidden"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[17.4474, 78.3762]} icon={markerIcon}>
            <Popup>Project Location</Popup>
          </Marker>
        </MapContainer>

        <div className="absolute top-6 right-4 bg-white px-4 py-2 rounded-xl shadow font-semibold">
          $2.5 M
        </div>
      </div>
    </section>
  );
}

// GALLERY EXTRACTED --------------------------------------------
function Gallery() {
  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-14 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Gallery</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2 h-[240px] sm:h-[320px] rounded-2xl overflow-hidden relative">
          <img
            src="src/assets/allphotos.png"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25"></div>
          <p className="absolute bottom-4 left-4 text-white font-semibold">
            All Photos & Videos
          </p>
          <div className="absolute bottom-4 right-4 bg-white/20 p-1 rounded-md">
            <Square />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="h-[140px] rounded-2xl overflow-hidden relative">
            <img
              src="src/assets/videophoto.png"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <p className="absolute bottom-3 left-4 text-white">Videos</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/40 rounded-full p-3">
                <Play />
              </div>
            </div>
          </div>

          <div className="h-[140px] rounded-2xl overflow-hidden relative">
            <img
              src="src/assets/outdoors.png"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <p className="absolute bottom-3 left-4 text-white">Outdoors</p>
          </div>
        </div>

        <div className="h-[240px] sm:h-[320px] rounded-2xl overflow-hidden relative">
          <img
            src="src/assets/interiors.png"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/25"></div>
          <p className="absolute bottom-4 left-4 text-white font-semibold">
            Interiors
          </p>
        </div>
      </div>
    </section>
  );
}

// ABOUT US ---------------------------------------------------------
function AboutUs() {
  const features = [
    "20+ years of experience",
    "End-to-End for All Your Commercial construction Needs",
    "50+ residential and commercial projects in Hyderabad",
    "Assurance of high-quality materials",
    "Quality Check Mechanism",
    "On time Delivery",
    "100% transparency",
  ];

  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-14 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">About Us</h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      <p className="text-gray-700 mb-6">
        Your home is a reflection of your personality and style. We take great
        pride in helping homeowners like you create the homes of their dreams...
      </p>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <img
          src="src/assets/aboutus.png"
          className="w-full h-[220px] sm:h-[340px] object-cover rounded-2xl"
        />

        <div className="space-y-4">
          {features.map((f) => (
            <div key={f} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <p className="text-gray-800">{f}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// PROJECTS ---------------------------------------------------------
function Projects() {
  return (
    <section className="py-8 sm:py-12">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-1 h-12 bg-yellow-500 rounded-full" />
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">
            Projects by Hallmark Skyrena
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm">
            Building excellence in Hyderabad
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto">
        {["Ongoing", "Upcoming", "Delivered"].map((t, i) => (
          <button
            key={t}
            className={`px-4 py-2 rounded-full min-w-fit text-sm font-semibold ${
              i === 0 ? "bg-yellow-400 text-white" : "bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {new Array(4).fill(0).map((_, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-xl overflow-hidden shadow-sm"
          >
            <div className="px-4 pt-4 flex justify-between">
              <p className="text-sm font-semibold">Hallmark Skyrena</p>
              <p className="text-sm font-semibold">₹ 9.35 – 11.6 Cr</p>
            </div>

            <div className="relative px-4 mt-3">
              <img
                src="src/assets/hallmark.png"
                className="w-full h-[160px] object-cover rounded-lg"
              />
              <div className="absolute top-3 left-6 bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> RERA
              </div>

              <div className="absolute top-3 right-6 bg-white p-1 rounded-full shadow">
                <Heart className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            <div className="px-4 pb-4 mt-3">
              <p className="text-gray-700 text-sm">
                3,4 BHK Apartment in sector 44, Hyderabad
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Possession from Sep 2029
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================= */
/* ===================== MAIN PAGE ============================== */
/* ============================================================= */

export default function PropertyPage() {
  const [isMobileMenuOpen] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const id = "69254d6791594a2823b6ecf4"; // <--- your project ID
        const res = await fetchPropertyById(id);

        if (res?.data) {
          setProject(res.data);
        }
      } catch (err) {
        console.error("Error loading project:", err);
      }
    }

    loadData();
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-transparent">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <Header isMobileMenuOpen={isMobileMenuOpen} />
        <Hero project={project} />
        <Amenities amenities={project?.amenities || []} />
        <AvailableProperties />
        <LocationMap />
        <Gallery />
        <AboutUs />
        <Projects />
      </div>
    </div>
  );
}
