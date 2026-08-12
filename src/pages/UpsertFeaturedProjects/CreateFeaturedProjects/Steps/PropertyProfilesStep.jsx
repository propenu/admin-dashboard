// src/pages/post-property/featured-create/steps/PropertyProfilesStep.jsx

import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import { Building2, FileText, BadgeCheck, Globe, Map, Tag, UserCheck } from "lucide-react";
import { getUserSearch } from "../../../../features/user/userService";
import { saveImage, deleteImage } from "../utils/indexedDB";
import { compressPdfAdvanced } from "../utils/compressPdfAdvanced";
import { toast } from "sonner";

 

/* ─── Design tokens ─────────────────────────────────────────── */
const inp = (err) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
   outline-none placeholder:text-gray-400 transition-all duration-200
   ${
     err
       ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
       : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"
   }`;

const LABEL = "block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2";
const ERR   = "text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1";

/* ─── Constants ─────────────────────────────────────────────── */
const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "PNB", "Kotak", "Yes Bank"];



const AREA_UNITS = [
  { value: "Acres",   label: "Acres"   },
  { value: "Sq.Yd",  label: "Sq. Yards" },
  { value: "Sq.ft",  label: "Sq. Feet" },
  { value: "Cents",  label: "Cents"   },
  { value: "Grounds", label: "Grounds" },
  { value: "Guntha",  label: "Guntha"  },
  { value: "Hectares", label: "Hectares" },
];

 

/* ─── SectionCard — defined OUTSIDE component to avoid remount ── */
const SectionCard = ({ icon: Icon, title, sub, children }) => (
  <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#f0fdf6,#dcfce7)", border: "2px solid #bbf7d0" }}
      >
        <Icon size={17} style={{ color: "#27AE60" }} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{sub}</p>
        <h3 className="text-sm font-black text-gray-900">{title}</h3>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─── Component ─────────────────────────────────────────────── */
const PropertyProfilesStep = forwardRef(({ payload, update }, ref) => {
  const [errors, setErrors] = useState({});
  const profileRef = useRef(null);
  const [builders, setBuilders] = useState([]);
  const [relationshipManagers, setRelationshipManagers] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipManagerSearch, setRelationshipManagerSearch] = useState("");
  const builderRef = useRef(null);

  const brochureInputRef = useRef(null);

  const isLand = payload.categoryType === "land";


  const [selectedBuilderId, setSelectedBuilderId] = useState("");

  const [buildersLoaded, setBuildersLoaded] = useState(false);
  const [relationshipManagersLoaded, setRelationshipManagersLoaded] = useState(false);

  
    const HIDE_TOWER_TYPES = [
  "villa",
  "duplex",
  "triplex",
  "farmhouse",
];

const shouldHideTowerFields =
  payload.categoryType === "land" ||
  HIDE_TOWER_TYPES.includes(
    payload.propertyType?.trim().toLowerCase()
  );

  const isResidential = payload.categoryType === "residential";

  

  const [filters, setFilters] = useState({
    state: "",
    city: "",
    pincode: "",
    locality: "",
  });

 useEffect(() => {
   // wait until API finished
   if (!buildersLoaded) return;

   // no builder selected
   if (!payload.createdBy) return;

   // check existence
   const existsInAllBuilders = builders.some(
     (b) => String(b._id) === String(payload.createdBy),
   );

   console.log("========== BUILDER VALIDATION ==========");
   console.log("buildersLoaded =>", buildersLoaded);
   console.log("payload.createdBy =>", payload.createdBy);
   console.log(
     "builder IDs =>",
     builders.map((b) => b._id),
   );
   console.log("existsInAllBuilders =>", existsInAllBuilders);

   // clear ONLY if truly deleted
   if (!existsInAllBuilders) {
     console.log("❌ Builder actually deleted from API");

     update({
       createdBy: "",
     });

     setSelectedBuilderId("");
   }
 }, [buildersLoaded, builders, payload.createdBy]);

  useEffect(() => {
    async function loadBuilders() {
      try {
        // Include builder + builder_staff so Operations/staff can assign project owners.
        const res = await getUserSearch("builder,builder_staff");
        const results = Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res?.results)
            ? res.results
            : [];
        const unique = [];
        const seen = new Set();
        results.forEach((user) => {
          const id = String(user?._id || user?.userId || "");
          if (!id || seen.has(id)) return;
          seen.add(id);
          unique.push(user);
        });
        setBuilders(unique);
        setBuildersLoaded(true);
      } catch (err) {
        console.error("Failed to load builders", err);
        setBuilders([]);
        setBuildersLoaded(true);
      }
    }

    loadBuilders();
  }, []);

  useEffect(() => {
    async function loadRelationshipManagers() {
      try {
        const res = await getUserSearch("relationship_manager");
        const results = Array.isArray(res?.data?.results)
          ? res.data.results
          : Array.isArray(res?.results)
            ? res.results
            : [];
        setRelationshipManagers(results);
        setRelationshipManagersLoaded(true);
      } catch (err) {
        console.error("Failed to load relationship managers", err);
        setRelationshipManagers([]);
        setRelationshipManagersLoaded(true);
      }
    }

    loadRelationshipManagers();
  }, []);

  useEffect(() => {
    if (!relationshipManagersLoaded) return;
    if (!payload.relationshipManagerId) return;

    const exists = relationshipManagers.some(
      (manager) => String(manager._id) === String(payload.relationshipManagerId),
    );

    if (!exists) {
      update({ relationshipManagerId: "" });
    }
  }, [relationshipManagersLoaded, relationshipManagers, payload.relationshipManagerId]);

  // Staff invite flow: do not auto-set createdBy. Builder claims via invite + mobile OTP.

  const normalized = (value) => String(value || "").trim().toLowerCase();
  const matchesLocationValue = (itemValue, filterValue) =>
    !filterValue || normalized(itemValue) === normalized(filterValue);

  const locationUsers = [...builders, ...relationshipManagers];

  // Unique values from full builder and relationship manager list
  const uniqueStates = [
    ...new Set([payload.state, ...locationUsers.map((user) => user.state)].filter(Boolean)),
  ];
  const uniqueCities = [
    ...new Set(
      locationUsers
        .filter((user) => matchesLocationValue(user.state, filters.state))
        .map((user) => user.city)
        .concat(payload.city || [])
        .filter(Boolean),
    ),
  ];
  const uniquePincodes = [
    ...new Set(
      locationUsers
        .filter(
          (user) =>
            matchesLocationValue(user.state, filters.state) &&
            matchesLocationValue(user.city, filters.city),
        )
        .map((user) => user.pincode)
        .concat(payload.pincode || [])
        .filter(Boolean),
    ),
  ];
  const uniqueLocalities = [
    ...new Set(
      locationUsers
        .filter(
          (user) =>
            matchesLocationValue(user.state, filters.state) &&
            matchesLocationValue(user.city, filters.city) &&
            matchesLocationValue(user.pincode, filters.pincode),
        )
        .map((user) => user.locality)
        .concat(payload.locality || [])
        .filter(Boolean),
    ),
  ];

  

  const builderRoleKey = (user) =>
    String(user?.roleName || user?.role?.name || user?.role || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");

  // Prefer true builder accounts (API assign rejects builder_staff)
  const assignableBuilders = builders.filter((b) => {
    const role = builderRoleKey(b);
    if (!role) return true;
    if (role.includes("staff")) return false;
    return role === "builder" || role === "builders" || role.includes("builder");
  });

  const filteredBuilders = assignableBuilders.filter((b) => {
    const matchesState = matchesLocationValue(b.state, filters.state);
    const matchesCity = matchesLocationValue(b.city, filters.city);
    const matchesPincode = matchesLocationValue(b.pincode, filters.pincode);
    const matchesLocality = matchesLocationValue(b.locality, filters.locality);
    const matchesSearch =
      !searchQuery.trim() ||
      b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone?.includes(searchQuery);
    return (
      matchesState &&
      matchesCity &&
      matchesPincode &&
      matchesLocality &&
      matchesSearch
    );
  });

  const selectedBuilder =
    assignableBuilders.find(
      (b) => String(b._id) === String(payload.createdBy || selectedBuilderId),
    ) || null;

  const inviteEmailList =
    Array.isArray(payload.builderInviteEmails) &&
    payload.builderInviteEmails.length
      ? payload.builderInviteEmails
      : [""];

  const assignMode =
    payload.builderAssignMode === "invite_link"
      ? "invite_link"
      : payload.builderAssignMode === "existing_builder"
        ? "existing_builder"
        : "";

  const filteredRelationshipManagers = relationshipManagers.filter((manager) => {
    const matchesState = matchesLocationValue(manager.state, filters.state);
    const matchesCity = matchesLocationValue(manager.city, filters.city);
    const matchesPincode = matchesLocationValue(manager.pincode, filters.pincode);
    const matchesLocality = matchesLocationValue(manager.locality, filters.locality);
    const query = relationshipManagerSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      manager.name?.toLowerCase().includes(query) ||
      manager.email?.toLowerCase().includes(query) ||
      manager.phone?.includes(relationshipManagerSearch.trim());

    return (
      matchesState &&
      matchesCity &&
      matchesPincode &&
      matchesLocality &&
      matchesSearch
    );
  });

  const addYoutube = () => {
    const list = payload.youtubeVideos || [];
    update({
      youtubeVideos: [...list, { title: "", url: "", order: list.length + 1 }],
    });
  };

  const updateYoutube = (index, key, value) => {
    const list = [...(payload.youtubeVideos || [])];
    list[index][key] = value;
    update({ youtubeVideos: list });
  };

  const removeYoutube = (index) => {
    const list = [...(payload.youtubeVideos || [])];
    list.splice(index, 1);
    update({ youtubeVideos: list });
   
  };

  
  useImperativeHandle(ref, () => ({
    validate() {
      console.log("========== VALIDATION START ==========");

      const e = {};

      console.log("payload =>", payload);

      // RERA
      if (!payload.reraNumber?.trim()) {
        e.reraNumber = "Required";
        console.log("❌ RERA missing");
      }

      const assignMode =
        payload.builderAssignMode === "invite_link"
          ? "invite_link"
          : payload.builderAssignMode === "existing_builder"
            ? "existing_builder"
            : "";

      if (!assignMode) {
        e.builderAssignMode = "Choose Existing Builder or Builder Invite";
      } else if (assignMode === "existing_builder") {
        if (!String(payload.createdBy || "").trim()) {
          e.createdBy = "Select an existing builder";
        }
      } else {
        const inviteEmails = (payload.builderInviteEmails || [])
          .map((x) => String(x || "").trim().toLowerCase())
          .filter(Boolean);
        const invalidEmail = inviteEmails.find(
          (em) => !/^\S+@\S+\.\S+$/.test(em),
        );
        if (!inviteEmails.length) {
          e.builderInviteEmails = "Add at least one builder invite email";
        } else if (invalidEmail) {
          e.builderInviteEmails = `Invalid email: ${invalidEmail}`;
        }
      }

    const hasRelationshipManagers = relationshipManagers.length > 0;

    if (hasRelationshipManagers && !payload.relationshipManagerId) {
      e.relationshipManagerId = "Please select relationship manager";
    }

      // Brochure
      if (!payload.brochure) {
        e.brochure = "Brochure PDF is required";
        console.log("❌ Brochure missing");
      }

      // Redirect URL
      if (payload.redirectUrl?.trim()) {
        try {
          new URL(payload.redirectUrl.trim());
          console.log("✅ URL valid");
        } catch (err) {
          e.redirectUrl = "Enter valid URL";
          console.log("❌ Invalid URL");
        }
      }

      

      console.log("FINAL ERRORS =>", e);

      setErrors(e);

      // Scroll to error section
      if (Object.keys(e).length > 0) {
        console.log("❌ Validation Failed");

        const scrollTarget =
          e.builderAssignMode ||
          e.builderInviteEmails ||
          e.createdBy ||
          e.relationshipManagerId
            ? builderRef
            : profileRef;

        scrollTarget.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        return false;
      }

      console.log("✅ Validation Success");

      return true;
    },

    isValid() {
      return this.validate();
    },
  }));
  
  
  /* ── Helpers ── */
  const clr = (key) =>
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[key]; 
      return copy;
    });

  // const handleChange = (key, value) => {
  //   update({ [key]: value });
  //   clr(key);
  // };
  const handleChange = (key, value) => {
    update({ [key]: value });
    clr(key);
  };

  const toggleBank = (bank) => {
    const sel = payload.banksApproved || [];
    update({
      banksApproved: sel.includes(bank)
        ? sel.filter((b) => b !== bank)
        : [...sel, bank],
    });
    clr("banksApproved");
  };


  // const removeBrochure = async () => {
  //   const key =
  //     typeof payload.brochure === "string"
  //       ? payload.brochure
  //       : payload.brochure?.key;

  //   if (key) {
  //     await deleteImage(key, "other");
  //   }

  //   update({ brochure: null });

  //   toast.success("Brochure removed successfully");
  // };
  

 const removeBrochure = async () => {
   const key =
     typeof payload.brochure === "string"
       ? payload.brochure
       : payload.brochure?.key;

   if (key) {
     await deleteImage(key, "other");
   }

   update({
     brochure: null,
     brochurePreview: "",
   });

   // VERY IMPORTANT
   if (brochureInputRef.current) {
     brochureInputRef.current.value = "";
   }

   toast.success("Brochure removed successfully");
 };

  const getBrochureName = () => {
    if (payload.brochure?.file) return payload.brochure.file.name;

    if (typeof payload.brochure === "string") {
      return payload.brochure.split("__")[2]; // extract filename
    }

    return null;
  };

  const selectedRelationshipManager = relationshipManagers.find(
    (manager) =>
      String(manager._id) === String(payload.relationshipManagerId),
  );

  const visibleRelationshipManagers = selectedRelationshipManager
    ? [
        selectedRelationshipManager,
        ...filteredRelationshipManagers.filter(
          (manager) => manager._id !== selectedRelationshipManager._id,
        ),
      ]
    : filteredRelationshipManagers;

  /* ── Render ── */
  return (
    <div className="space-y-5" ref={profileRef}>
      {/* ── 1. Project Stats ── */}
      <SectionCard
        icon={Building2}
        title="Project Stats"
        sub="Structure & Units"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* HIDE IN LAND */}
          {!shouldHideTowerFields && (
            <>
              {/* Total Towers */}
              <div>
                <label className={LABEL}>Total Towers *</label>

                <input
                  type="number"
                  min="1"
                  className={inp(errors.totalTowers)}
                  placeholder="8"
                  value={payload.totalTowers || ""}
                  onChange={(e) => handleChange("totalTowers", e.target.value)}
                />

                {errors.totalTowers && (
                  <p className={ERR}>⚠ {errors.totalTowers}</p>
                )}
              </div>

              {/* Total Floors */}
              <div>
                <label className={LABEL}>Total Floors *</label>

                <input
                  type="text"
                  className={inp(errors.totalFloors)}
                  placeholder="G+32"
                  value={payload.totalFloors || ""}
                  onChange={(e) => handleChange("totalFloors", e.target.value)}
                />

                {errors.totalFloors && (
                  <p className={ERR}>⚠ {errors.totalFloors}</p>
                )}
              </div>
            </>
          )}

          {/* Project Area + Unit — paired in one cell */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className={LABEL}>Project Area *</label>
            <div
              className="
                          flex items-center
                          border-2 border-gray-200
                          rounded-xl
                          overflow-hidden
                          bg-white
                          focus-within:border-[#27AE60]
                          focus-within:ring-4
                          focus-within:ring-[#27AE60]/10
                        "
            >
              {/* VALUE */}
              <input
                type="number"
                min="0"
                step="0.01"
                className="
                          flex-1
                          px-4 py-3
                          text-sm font-semibold
                          outline-none
                          bg-transparent
                        "
                placeholder="2"
                value={payload.projectArea || ""}
                onChange={(e) => handleChange("projectArea", e.target.value)}
              />

              {/* DIVIDER */}
              <div className="w-px self-stretch bg-gray-200" />

              {/* STATIC UNIT */}
              <div
                className="
                    px-4 py-3
                    text-sm font-black
                    text-gray-700
                    bg-gray-50
                    uppercase
                  "
              >
                Acre
              </div>
            </div>
            {/* Error messages for both fields */}
            {errors.projectArea && (
              <p className={ERR}>⚠ {errors.projectArea}</p>
            )}
            {errors.areaUnits && <p className={ERR}>⚠ {errors.areaUnits}</p>}
          </div>

          {/* Total Units */}
          <div>
            <label className={LABEL}>Total Units *</label>
            <input
              type="number"
              min="1"
              className={inp(errors.totalUnits)}
              placeholder="480"
              value={payload.totalUnits || ""}
              onChange={(e) => handleChange("totalUnits", e.target.value)}
            />
            {errors.totalUnits && <p className={ERR}>⚠ {errors.totalUnits}</p>}
          </div>

          {/* Available Units */}
          <div>
            <label className={LABEL}>Available Units</label>
            <input
              type="number"
              min="0"
              className={inp(errors.availableUnits)}
              placeholder="120"
              value={payload.availableUnits || ""}
              onChange={(e) => handleChange("availableUnits", e.target.value)}
            />
            {errors.availableUnits && (
              <p className={ERR}>⚠ {errors.availableUnits}</p>
            )}
          </div>

          {/* Possession Date */}
          <div>
            <label className={LABEL}>Possession Date *</label>
            <input
              type="date"
              className={inp(errors.possessionDate)}
              value={payload.possessionDate || ""}
              onChange={(e) => handleChange("possessionDate", e.target.value)}
            />
            {errors.possessionDate && (
              <p className={ERR}>⚠ {errors.possessionDate}</p>
            )}
          </div>
          {/* RERA Number */}
          <div>
            <label className={LABEL}>RERA Number *</label>
            <input
              type="text"
              className={inp(errors.reraNumber)}
              placeholder="RERA/T/2024/000123"
              value={payload.reraNumber || ""}
              onChange={(e) => handleChange("reraNumber", e.target.value)}
            />
            {errors.reraNumber && <p className={ERR}>⚠ {errors.reraNumber}</p>}
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Banks Approved ── */}
      <SectionCard icon={BadgeCheck} title="Banks Approved" sub="Finance">
        {errors.banksApproved && (
          <p className={`${ERR} mb-4`}>⚠ {errors.banksApproved}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {BANKS.map((bank) => {
            const sel = payload.banksApproved?.includes(bank);
            return (
              <button
                key={bank}
                type="button"
                onClick={() => toggleBank(bank)}
                className="px-5 py-2.5 rounded-xl border-2 text-sm font-black transition-all duration-200 select-none"
                style={{
                  background: sel
                    ? "linear-gradient(135deg,#27AE60,#1e8449)"
                    : "white",
                  borderColor: sel ? "#27AE60" : "#e5e7eb",
                  color: sel ? "white" : "#374151",
                  boxShadow: sel ? "0 4px 12px rgba(39,174,96,0.3)" : "none",
                  transform: sel ? "translateY(-1px)" : "none",
                }}
              >
                {sel ? "✓ " : ""}
                {bank}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ── 3. Documents & Links ── */}
      <SectionCard icon={FileText} title="Files & Links" sub="Documents">
        <div className="space-y-5">
          {/* Brochure */}
          <div>
            <label className={LABEL}>Brochure (PDF) *</label>
            <label
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-dashed
                cursor-pointer transition-all group
                ${
                  errors.brochure
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"
                }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                  ${errors.brochure ? "bg-red-100" : "bg-white shadow-sm group-hover:bg-[#27AE60]/10"}`}
              >
                <FileText
                  size={20}
                  className={`transition-colors ${errors.brochure ? "text-red-400" : "text-gray-400 group-hover:text-[#27AE60]"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-bold truncate ${errors.brochure ? "text-red-600" : "text-gray-800"}`}
                >
                  {/* {payload.brochure
                    ? payload.brochure.name
                    : "Upload Brochure PDF"} */}
                  {getBrochureName() || "Upload Brochure PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PDF files only</p>
              </div>
              {payload.brochure?.file && (
                <span
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                  style={{ background: "#27AE60" }}
                >
                  Uploaded ✓
                </span>
              )}
              <input
                type="file"
                ref={brochureInputRef}
                accept="application/pdf"
                className="hidden"
                onChange={async (e) => {
                  let file = e.target.files[0];
                  if (!file) return;

                  if (file.type !== "application/pdf") {
                    toast.error("Only PDF allowed ❌");
                    return;
                  }

                  // 🔥 compress if >1MB
                  const MAX_SIZE = 3 * 1024 * 1024;
                  if (file.size > MAX_SIZE) {
                    toast.loading("Compressing PDF... ⏳");

                    const compressed = await compressPdfAdvanced(file);

                    

                    toast.dismiss();

                    const sizeMB = (compressed.size / 1024 / 1024).toFixed(2);



                    if (compressed.size > MAX_SIZE) {
                      toast.error(
                        `Still ${sizeMB}MB. Please upload smaller PDF ❌`,
                      );
                      return;
                    }

                    const originalMB = (file.size / 1024 / 1024).toFixed(2);
                    const compressedMB = (
                      compressed.size /
                      1024 /
                      1024
                    ).toFixed(2);

                    const savedMB = (
                      (file.size - compressed.size) /
                      1024 /
                      1024
                    ).toFixed(2);

                    toast.success(
                      `PDF compressed successfully! ${originalMB} MB → ${compressedMB} MB (Saved ${savedMB} MB) ✅`,
                    );

                    //toast.success(`Compressed ✅`);

                    file = compressed;
                  }

                  const key = await saveImage(file, "other", "brochure");

                  update({
                    brochure: { key, file },
                  });

                  clr("brochure");
                }}
              />
              {(payload.brochure &&  payload.brochure.file) && (
                <button
                  type="button"
                  onClick={removeBrochure}
                  className="text-red-500 text-xs font-bold ml-2"
                >
                  Remove
                </button>
              )}
            </label>

            {errors.brochure && <p className={ERR}>⚠ {errors.brochure}</p>}
          </div>

          {/* Project Website URL */}
          <div>
            <label className={LABEL}>
              Project Website URL
              <span className="ml-1 text-gray-400 font-semibold normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Globe
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="url"
                className={`${inp(errors.redirectUrl)} pl-10`}
                placeholder="https://project-website.com"
                value={payload.redirectUrl || ""}
                onChange={(e) => handleChange("redirectUrl", e.target.value)}
              />
            </div>
            {errors.redirectUrl && (
              <p className={ERR}>⚠ {errors.redirectUrl}</p>
            )}
            {/* Live preview link when valid URL entered */}
            {payload.redirectUrl && !errors.redirectUrl && (
              <a
                href={payload.redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold mt-1.5 hover:underline"
                style={{ color: "#27AE60" }}
              >
                <Globe size={11} /> Preview link ↗
              </a>
            )}
          </div>

          {/* Map Embed URL */}
          <div>
            <label className={LABEL}>
              Google Maps Embed URL
              <span className="ml-1 text-gray-400 font-semibold normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <div className="relative">
              <Map
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="url"
                className={`${inp(errors.mapEmbedUrl)} pl-10`}
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={payload.mapEmbedUrl || ""}
                onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
              />
            </div>
            {errors.mapEmbedUrl && (
              <p className={ERR}>⚠ {errors.mapEmbedUrl}</p>
            )}
            {/* Live map preview */}
            {payload.mapEmbedUrl &&
              payload.mapEmbedUrl.includes("google.com/maps") && (
                <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <iframe
                    src={payload.mapEmbedUrl}
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Map Preview"
                  />
                </div>
              )}
          </div>
        </div>
      </SectionCard>
      <SectionCard icon={Globe} title="YouTube Videos" sub="Video Showcase">
        <div className="space-y-4">
          {/* {errors.youtubeVideos && (
            <p className={ERR}>⚠ {errors.youtubeVideos}</p>
          )} */}
          {(payload.youtubeVideos || []).map((video, i) => (
            <div
              key={i}
              className="border-2 border-gray-200 rounded-xl p-4 space-y-3"
            >
              <div>
                <label className={LABEL}>Video Title</label>
                <input
                  type="text"
                  className={inp()}
                  placeholder="Property Overview"
                  value={video.title}
                  onChange={(e) => updateYoutube(i, "title", e.target.value)}
                />
                {/* {errors[`youtube_title_${i}`] && (
                  <p className={ERR}>⚠ {errors[`youtube_title_${i}`]}</p>
                )} */}
              </div>

              <div>
                <label className={LABEL}>YouTube URL *</label>
                <input
                  type="url"
                  className={inp()}
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={video.url}
                  onChange={(e) => updateYoutube(i, "url", e.target.value)}
                />
                {/* {errors[`youtube_url_${i}`] && (
                  <p className={ERR}>⚠ {errors[`youtube_url_${i}`]}</p>
                )} */}
              </div>

              <div>
                <label className={LABEL}>Order</label>
                <input
                  type="number"
                  className={inp()}
                  value={video.order}
                  onChange={(e) => updateYoutube(i, "order", e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={() => removeYoutube(i)}
                className="text-red-500 text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addYoutube}
            className="px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-lg"
          >
            + Add YouTube Video
          </button>
        </div>
      </SectionCard>

      <div ref={builderRef} className="space-y-6">
        {/* One card: mode dropdown + existing search OR invite emails */}
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
                border: "2px solid #bbf7d0",
              }}
            >
              <Building2 size={17} style={{ color: "#27AE60" }} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Builder attach
              </p>
              <h3 className="text-sm font-black text-gray-900">
                How do you want to attach the builder?
              </h3>
            </div>
          </div>

          <label className={LABEL}>Builder option *</label>
          <select
            className={inp(errors.builderAssignMode)}
            value={assignMode}
            onChange={(e) => {
              const mode = String(e.target.value || "");
              if (mode === "existing_builder") {
                setSelectedBuilderId(String(payload.createdBy || ""));
                update({
                  builderAssignMode: "existing_builder",
                  builderInviteEmails: [""],
                  builderInviteCompany: "",
                });
              } else if (mode === "invite_link") {
                setSelectedBuilderId("");
                update({
                  builderAssignMode: "invite_link",
                  createdBy: "",
                });
              } else {
                setSelectedBuilderId("");
                update({
                  builderAssignMode: "",
                  createdBy: "",
                  builderInviteEmails: [""],
                  builderInviteCompany: "",
                });
              }
              clr("builderAssignMode");
              clr("createdBy");
              clr("builderInviteEmails");
            }}
          >
            <option value="">— Select Existing Builder or Builder Invite —</option>
            <option value="existing_builder">Existing Builder</option>
            <option value="invite_link">Builder Invite</option>
          </select>
          {errors.builderAssignMode ? (
            <p className={ERR}>⚠ {errors.builderAssignMode}</p>
          ) : (
            <p className="mt-2 text-[11px] font-semibold text-slate-500">
              Existing Builder shows search below. Builder Invite shows email fields below.
            </p>
          )}

          {/* Existing Builder fields — same card */}
          {assignMode === "existing_builder" ? (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="mb-4 text-xs font-semibold text-gray-600">
                Pick an already onboarded builder (sets <strong>Created By</strong>). Team can
                approve live.
              </p>

              <div className="mb-4">
                <label className={LABEL}>Search Builder</label>
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    className={`${inp(errors.createdBy)} pl-10`}
                    placeholder="Search by name, email or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-gray-400 hover:text-gray-600"
                    >
                      x
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div>
                  <label className={LABEL}>State</label>
                  <select
                    className={inp()}
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({
                        state: e.target.value,
                        city: "",
                        pincode: "",
                        locality: "",
                      })
                    }
                  >
                    <option value="">All States</option>
                    {uniqueStates.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>City</label>
                  <select
                    className={inp()}
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        city: e.target.value,
                        pincode: "",
                        locality: "",
                      }))
                    }
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Pincode</label>
                  <select
                    className={inp()}
                    value={filters.pincode}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        pincode: e.target.value,
                        locality: "",
                      }))
                    }
                  >
                    <option value="">All Pincodes</option>
                    {uniquePincodes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Locality</label>
                  <select
                    className={inp()}
                    value={filters.locality}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, locality: e.target.value }))
                    }
                  >
                    <option value="">All Localities</option>
                    {uniqueLocalities.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={LABEL}>Select Builder *</label>
                <select
                  className={inp(errors.createdBy)}
                  value={String(payload.createdBy || "")}
                  disabled={!buildersLoaded}
                  onChange={(e) => {
                    const id = String(e.target.value || "").trim();
                    setSelectedBuilderId(id);
                    update({
                      createdBy: id,
                      builderAssignMode: "existing_builder",
                    });
                    clr("createdBy");
                  }}
                >
                  <option value="">
                    {buildersLoaded
                      ? filteredBuilders.length
                        ? "— Select existing builder —"
                        : "No builders for this filter"
                      : "Loading builders…"}
                  </option>
                  {filteredBuilders.map((b) => {
                    const loc = [b.locality, b.city, b.state]
                      .filter(Boolean)
                      .join(", ");
                    return (
                      <option key={b._id} value={String(b._id)}>
                        {b.name || "Unnamed"}
                        {loc ? ` - ${loc}` : ""}
                        {b.email ? ` (${b.email})` : ""}
                      </option>
                    );
                  })}
                </select>
                <p className="mt-2 text-[11px] font-semibold text-slate-500">
                  {buildersLoaded
                    ? `${filteredBuilders.length} builder(s) found`
                    : "Loading…"}
                  {selectedBuilder
                    ? ` · Selected: ${selectedBuilder.name || "Builder"}`
                    : ""}
                </p>
                {errors.createdBy ? (
                  <p className={ERR}>⚠ {errors.createdBy}</p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Builder Invite fields — same card */}
          {assignMode === "invite_link" ? (
            <div className="mt-5 border-t border-gray-100 pt-5">
              <p className="mb-4 text-xs text-gray-600">
                Add one or more builder emails. Each email receives the Launch Partner invite with
                <strong> View Preview</strong> and <strong> Approve &amp; Onboard</strong> buttons.
                First builder who completes mobile OTP onboarding claims the project.
              </p>

              <div className="mb-3 space-y-2">
                <label className={LABEL}>Builder invite emails *</label>
                {inviteEmailList.map((email, idx) => (
                  <div key={`invite-email-${idx}`} className="flex gap-2">
                    <input
                      className={inp(errors.builderInviteEmails)}
                      type="email"
                      placeholder="builder@company.com"
                      value={email || ""}
                      onChange={(e) => {
                        const list = [...inviteEmailList];
                        list[idx] = e.target.value;
                        handleChange("builderInviteEmails", list);
                        clr("builderInviteEmails");
                      }}
                    />
                    {inviteEmailList.length > 1 && (
                      <button
                        type="button"
                        className="rounded-xl border-2 border-gray-200 px-3 text-sm font-bold text-red-500"
                        onClick={() => {
                          const list = [...inviteEmailList];
                          list.splice(idx, 1);
                          handleChange(
                            "builderInviteEmails",
                            list.length ? list : [""],
                          );
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {errors.builderInviteEmails && (
                  <p className={ERR}>⚠ {errors.builderInviteEmails}</p>
                )}
              </div>

              <button
                type="button"
                className="mb-4 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                onClick={() =>
                  handleChange("builderInviteEmails", [...inviteEmailList, ""])
                }
              >
                + Add another email
              </button>

              <div>
                <label className={LABEL}>Company name (optional)</label>
                <input
                  className={inp()}
                  placeholder="Shown in invite email greeting"
                  value={payload.builderInviteCompany || ""}
                  onChange={(e) =>
                    handleChange("builderInviteCompany", e.target.value)
                  }
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border-2 border-gray-200 bg-gray-50/70 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#f0fdf6,#dcfce7)",
                  border: "2px solid #bbf7d0",
                }}
              >
                <UserCheck size={17} style={{ color: "#27AE60" }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Relationship Manager
                </p>
                <h3 className="text-sm font-black text-gray-900">
                  Select Relationship Manager
                </h3>
              </div>
            </div>

            <div className="mb-4">
              <label className={LABEL}>Search Relationship Manager</label>
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  className={`${inp()} pl-10`}
                  placeholder="Search by name, email or phone..."
                  value={relationshipManagerSearch}
                  onChange={(e) => setRelationshipManagerSearch(e.target.value)}
                />
                {relationshipManagerSearch && (
                  <button
                    type="button"
                    onClick={() => setRelationshipManagerSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
                  >
                    x
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div>
                <label className={LABEL}>State</label>
                <select
                  className={inp()}
                  value={filters.state}
                  onChange={(e) => {
                    setFilters({
                      state: e.target.value,
                      city: "",
                      pincode: "",
                      locality: "",
                    });
                  }}
                >
                  <option value="">All States</option>
                  {uniqueStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>City</label>
                <select
                  className={inp()}
                  value={filters.city}
                  onChange={(e) => {
                    setFilters((f) => ({
                      ...f,
                      city: e.target.value,
                      pincode: "",
                      locality: "",
                    }));
                  }}
                >
                  <option value="">All Cities</option>
                  {uniqueCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Pincode</label>
                <select
                  className={inp()}
                  value={filters.pincode}
                  onChange={(e) => {
                    setFilters((f) => ({
                      ...f,
                      pincode: e.target.value,
                      locality: "",
                    }));
                  }}
                >
                  <option value="">All Pincodes</option>
                  {uniquePincodes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL}>Locality</label>
                <select
                  className={inp()}
                  value={filters.locality}
                  onChange={(e) => {
                    setFilters((f) => ({ ...f, locality: e.target.value }));
                  }}
                >
                  <option value="">All Localities</option>
                  {uniqueLocalities.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(relationshipManagerSearch ||
              filters.state ||
              filters.city ||
              filters.pincode ||
              filters.locality) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {relationshipManagerSearch && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                    "{relationshipManagerSearch}"
                    <button
                      type="button"
                      onClick={() => setRelationshipManagerSearch("")}
                      className="ml-1 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                )}
                {filters.state && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                    {filters.state}
                    <button
                      type="button"
                      onClick={() => {
                        setFilters({
                          state: "",
                          city: "",
                          pincode: "",
                          locality: "",
                        });
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                )}
                {filters.city && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                    {filters.city}
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((f) => ({
                          ...f,
                          city: "",
                          pincode: "",
                          locality: "",
                        }));
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                )}
                {filters.pincode && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                    {filters.pincode}
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((f) => ({ ...f, pincode: "", locality: "" }));
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                )}
                {filters.locality && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-[#f0fdf6] border border-[#bbf7d0] text-[#1e8449] text-xs font-bold rounded-lg">
                    {filters.locality}
                    <button
                      type="button"
                      onClick={() => {
                        setFilters((f) => ({ ...f, locality: "" }));
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      x
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFilters({
                      state: "",
                      city: "",
                      pincode: "",
                      locality: "",
                    });
                    setRelationshipManagerSearch("");
                  }}
                  className="text-xs text-red-400 font-bold hover:text-red-600 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            <div>
              <label className={LABEL}>Select Relationship Manager *</label>
              <select
                className={inp(errors.relationshipManagerId)}
                value={payload.relationshipManagerId || ""}
                onChange={(e) => handleChange("relationshipManagerId", e.target.value)}
              >
                <option value="">
                  {filteredRelationshipManagers.length === 0
                    ? "No relationship managers found"
                    : "Select Relationship Manager"}
                </option>
                {visibleRelationshipManagers.map((manager) => (
                  <option key={manager._id} value={manager._id}>
                    {manager.name
                      ? manager.name.charAt(0).toUpperCase() + manager.name.slice(1)
                      : "Relationship Manager"}
                    {manager.city || manager.state
                      ? ` - ${manager.city || ""}${manager.city && manager.state ? ", " : ""}${manager.state || ""}`
                      : ""}
                  </option>
                ))}
              </select>
              {errors.relationshipManagerId && (
                <p className={ERR}>Warning {errors.relationshipManagerId}</p>
              )}
              {filteredRelationshipManagers.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {filteredRelationshipManagers.length} relationship manager(s) found
                </p>
              )}
            </div>
          </div>
      </div>
    </div>
  );
});

export default PropertyProfilesStep;
