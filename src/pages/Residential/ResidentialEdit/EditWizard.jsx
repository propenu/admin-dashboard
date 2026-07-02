// EditWizard.jsx — FIXED: stable debounce, no stale closures, correct upload payload
import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { ChevronLeft, ChevronRight, Check, LayoutList, MapPin, SlidersHorizontal, ShieldCheck, Wifi } from "lucide-react";
import { actions } from "../../../store/newIndex";
import { savePropertyData } from "../../../store/common/propertyThunks";
import StepBasicDetails from "./steps/StepBasicDetails";
import StepLocationDetails from "./steps/StepLocationDetails";
import StepPropertyDetails from "./steps/StepPropertyDetails";
import StepVerifyPublish from "./steps/StepVerifyPublish";
import { getPropertyById } from "../../../services/Common/AllPropertyServices";
import { setActiveCategory } from "../../../store/Ui/uiSlice";
import { isAgentCreatedProperty } from "../../../Utils/propertyCreatorRole";

// ─────────────────────────────────────────────────────────────────────────────
// cleanData — strips empty values, resolves createdBy._id, preserves File/Date
// ─────────────────────────────────────────────────────────────────────────────
const cleanData = (obj) => {
  if (obj instanceof File) return obj;
  if (obj instanceof FileList) return Array.from(obj);
  if (obj instanceof Date) return obj;

  if (Array.isArray(obj)) {
    return obj
      .map(cleanData)
      .filter(
        (v) =>
          v !== undefined &&
          v !== null &&
          !(typeof v === "object" && !(v instanceof File) && Object.keys(v).length === 0),
      );
  }

  if (obj && typeof obj === "object") {
    const cleaned = {};
    Object.keys(obj).forEach((key) => {
      let value = obj[key];
      if (key === "createdBy" && typeof value === "object") value = value?._id;
      const cv = cleanData(value);
      if (
        cv !== "" &&
        cv !== undefined &&
        cv !== null &&
        !(
          typeof cv === "object" &&
          !(cv instanceof File) &&
          !(cv instanceof Date) &&
          Object.keys(cv).length === 0
        )
      ) {
        cleaned[key] = cv;
      }
    });
    return cleaned;
  }

  return obj;
};

export default function EditWizard() {
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);

  const storedId       = localStorage.getItem("editPropertyId");
  const storedCategory = localStorage.getItem("editPropertyCategory");

  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const category   = useSelector((s) => s.ui.activeCategory) || storedCategory;
  const propertyId = id || storedId;

  // ── Keep a stable ref to the latest Redux form state so debounced callbacks
  //    never capture a stale snapshot.
  const { form: current, loading } = useSelector((s) => s[category] || {});

  const isAgentProperty = isAgentCreatedProperty(current);
  const completionPercent = Number(
    current?.completion?.percent ?? current?.completion ?? 0,
  );
  const canShowVerification =
    !isAgentProperty && completionPercent >= 70;

  const currentRef = useRef(current);
  useEffect(() => { currentRef.current = current; }, [current]);

  // ── Sync stored category into Redux once ─────────────────────────────────
  useEffect(() => {
    if (storedCategory) dispatch(setActiveCategory(storedCategory));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Hydrate form from server ─────────────────────────────────────────────
  useEffect(() => {
    if (!category || !propertyId) return;
    (async () => {
      try {
        const res = await getPropertyById(category, propertyId);
        const property = res?.data;
        if (!property) return;
        dispatch(
          actions[category].hydrateForm({
            ...property,
            galleryFiles : property.galleryFiles || [],
            amenities    : property.amenities    || [],
          }),
        );
      } catch (err) {
        console.error("❌ FETCH ERROR:", err);
      }
    })();
  }, [category, propertyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stable debounce — created ONCE, reads latest state via ref ───────────
  // FIX: Previously re-created on every `current` change, resetting the timer
  //      on every keystroke and capturing stale state.
  const debouncedAutoSave = useMemo(
    () =>
    // The debounced callback reads the ref only when it executes, never during render.
    // eslint-disable-next-line react-hooks/refs
    debounce(async ({ category: cat, propertyId: pid, stepName, dispatch: d }) => {
      try {
        // Read from ref — always fresh, never stale
        const payload = cleanData(currentRef.current);
        await d(savePropertyData({ category: cat, id: pid, step: stepName, data: payload })).unwrap();
      } catch (err) {
        console.error("❌ Autosave failed:", err);
      }
    }, 1500),
    [],
  );

  // ── Field update — stable callback, does NOT depend on `current` ─────────
  // FIX: Previously unstable because it was a plain function recreated each
  //      render, causing all child components to re-render on every keystroke.
  const handleFieldUpdate = useCallback(
    (field, value, stepName) => {
      if (!category || !actions[category]) {
        console.error("❌ Category not ready:", category);
        toast.error("Category not ready");
        return;
      }
      dispatch(actions[category].updateField({ key: field, value }));
      debouncedAutoSave({ category, propertyId, stepName, dispatch });
    },
    [category, propertyId, dispatch, debouncedAutoSave],
  );

  // ── Document upload — builds payload from explicit values, not stale Redux ─
  const handleUploadDocument = useCallback(
    async (files) => {
      if (!files?.length) return;

      const docType = files[0]?.docType || currentRef.current?.verificationDocumentType || "";

      dispatch(actions[category].setDocumentsFiles(files));
      dispatch(actions[category].updateField({ key: "verificationDocumentType", value: docType }));

      const mergedPayload = cleanData({
        ...currentRef.current,
        verificationDocumentType : docType,
        documentsFiles           : files,
      });

      try {
        await dispatch(
          savePropertyData({ category, id: propertyId, step: "verification", data: mergedPayload }),
        ).unwrap();
        toast.success("Document saved successfully!");
      } catch (err) {
        console.error("❌ Upload failed:", err);
        toast.error(err?.message || "Failed to save document");
      }
    },
    [category, propertyId, dispatch],
  );

  // ── Verify document status toggle ────────────────────────────────────────
  const handleVerifyDocument = useCallback(
    (index, status) => {
      const cur        = currentRef.current;
      const serverDocs = [...(cur.verificationDocuments || [])];
      const localDocs  = [...(cur.documentsFiles        || [])];

      if (index < serverDocs.length) {
        serverDocs[index] = { ...serverDocs[index], status };
      } else {
        const li = index - serverDocs.length;
        if (localDocs[li]) localDocs[li] = { ...localDocs[li], status };
      }

      dispatch(actions[category].setDocumentsFiles(localDocs));

      const payload = cleanData({
        ...cur,
        documentsFiles        : localDocs,
        verificationDocuments : serverDocs,
      });

      dispatch(savePropertyData({ category, id: propertyId, step: "verification", data: payload }));
    },
    [category, propertyId, dispatch],
  );

  // ── Manual step save ─────────────────────────────────────────────────────
  const handleStepSave = useCallback(
    async (stepName) => {
      const tid = toast.loading(`Saving ${stepName}...`);
      try {
        const payload = cleanData(currentRef.current);
        await dispatch(savePropertyData({ category, id: propertyId, step: stepName, data: payload })).unwrap();
        toast.success("Saved to cloud!", { id: tid });
        return true;
      } catch {
        toast.error("Sync failed", { id: tid });
        return false;
      }
    },
    [category, propertyId, dispatch],
  );

  // ── Publish ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    const tid = toast.loading("Publishing...");
    try {
      const payload = cleanData(currentRef.current);
      await dispatch(savePropertyData({ category, id: propertyId, step: "verification", data: payload })).unwrap();
      toast.success("Property is Live!", { id: tid });
      navigate(`/properties`);
    } catch (err) {
      toast.error(err.message || "Failed to publish", { id: tid });
    }
  }, [category, propertyId, dispatch, navigate]);

  // ── Debounce cleanup ─────────────────────────────────────────────────────
  useEffect(() => () => debouncedAutoSave.cancel(), [debouncedAutoSave]);

  const wizardSteps = [
    {
      key: "basic",
      number: "01",
      title: "Basic Details",
      description: "Intent, category, pricing and core property facts",
      icon: <LayoutList className="h-4 w-4" />,
      content: (
        <StepBasicDetails
          data={current}
          onChange={(field, value) => handleFieldUpdate(field, value, "basic")}
          onSave={() => handleStepSave("basic")}
        />
      ),
    },
    {
      key: "location",
      number: "02",
      title: "Location",
      description: "Address, locality, map pin and nearby places",
      icon: <MapPin className="h-4 w-4" />,
      content: (
        <StepLocationDetails
          data={current}
          onChange={(field, value) => handleFieldUpdate(field, value, "location")}
          onSave={() => handleStepSave("location")}
        />
      ),
    },
    {
      key: "details",
      number: "03",
      title: "Property Profile",
      description: "Amenities, gallery and category-specific details",
      icon: <SlidersHorizontal className="h-4 w-4" />,
      content: (
        <StepPropertyDetails
          data={current}
          onChange={(field, value) => handleFieldUpdate(field, value, "details")}
          onSave={() => handleStepSave("details")}
        />
      ),
    },
    ...(canShowVerification
      ? [
          {
            key: "verification",
            number: "04",
            title: "Verify & Publish",
            description: "Documents, verification status and publishing",
            icon: <ShieldCheck className="h-4 w-4" />,
            content: (
              <StepVerifyPublish
                data={current}
                onVerifyDocument={handleVerifyDocument}
                onUploadDocument={handleUploadDocument}
                onUpdateField={(field, value) =>
                  handleFieldUpdate(field, value, "verification")
                }
                onSubmit={handleSubmit}
              />
            ),
          },
        ]
      : []),
  ];

  const currentStepIndex = Math.min(
    activeStep,
    Math.max(0, wizardSteps.length - 1),
  );
  const activeDefinition = wizardSteps[currentStepIndex];

  const goToNextStep = async () => {
    if (!activeDefinition) return;
    const saved = await handleStepSave(activeDefinition.key);
    if (saved && currentStepIndex < wizardSteps.length - 1) {
      setActiveStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Loading / missing state ───────────────────────────────────────────────
  if (!category || !propertyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] flex flex-col items-center justify-center gap-6 px-4">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-3xl bg-[#27AE60]/20 animate-ping" style={{ animationDuration: "1.5s" }} />
            <div className="relative w-20 h-20 rounded-3xl bg-white shadow-2xl shadow-[#27AE60]/25 flex items-center justify-center border border-[#27AE60]/20">
              <Wifi className="w-8 h-8 text-[#27AE60]" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-800 font-black text-lg">Loading secure environment</p>
            <p className="text-slate-400 text-sm">Fetching property data...</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/properties`)}
          className="px-8 py-3.5 bg-[#27AE60] text-white text-sm font-black rounded-2xl hover:bg-[#219653] transition-all active:scale-95 shadow-xl shadow-[#27AE60]/30"
        >
          ← Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #f8fffe 100%)" }}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#27AE60]/12 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 max-sm">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[#27AE60]/10 text-slate-500 hover:text-[#27AE60] transition-all border border-transparent hover:border-[#27AE60]/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-slate-100 shrink-0 hidden sm:block" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60] hidden sm:inline-block" />
                  <h1 className="text-sm text-[#000000] truncate">
                    Edit {category.charAt(0).toUpperCase() + category.slice(1)}
                    <span className="text-[blue] font-normal text-xs ml-1.5 hidden sm:inline">#{id?.slice(-6)}</span>
                  </h1>
                </div>
                <p className="text-[12px] text-[#27AE60] uppercase truncate hidden sm:block mt-0.5">
                  {current?.title || "Draft Property"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {loading && (
                <div className="hidden sm:flex items-center gap-2 bg-[#27AE60]/8 border border-[#27AE60]/15 px-3.5 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#27AE60] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="text-[10px] text-[#27AE60] font-black uppercase tracking-widest ml-0.5">Saving</span>
                </div>
              )}
              <button
                onClick={() => navigate(`/properties`)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-[1600px] px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-4 overflow-x-auto pb-1 lg:hidden">
          <div className="flex min-w-max gap-2">
            {wizardSteps.map((step, index) => (
              <button
                key={step.key}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
                  currentStepIndex === index
                    ? "border-[#27AE60] bg-[#27AE60] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {step.icon}
                <span className="text-xs font-bold">{step.number}</span>
                <span className="text-xs font-semibold">{step.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
              <div className="border-b border-emerald-100 bg-emerald-50/70 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                  Edit workflow
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  Complete each section
                </p>
              </div>
              <nav className="space-y-1.5 p-3">
                {wizardSteps.map((step, index) => {
                  const selected = currentStepIndex === index;
                  const completed = currentStepIndex > index;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => setActiveStep(index)}
                      className={`group flex w-full items-start gap-3 rounded-2xl p-3 text-left transition ${
                        selected
                          ? "bg-[#27AE60] text-white shadow-lg shadow-emerald-200"
                          : "text-slate-600 hover:bg-emerald-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          selected
                            ? "bg-white/20"
                            : completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {completed ? <Check className="h-4 w-4" /> : step.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[9px] font-black uppercase tracking-widest opacity-70">
                          Step {step.number}
                        </span>
                        <span className="mt-0.5 block text-xs font-bold">
                          {step.title}
                        </span>
                        <span
                          className={`mt-1 block text-[10px] leading-relaxed ${
                            selected ? "text-white/75" : "text-slate-400"
                          }`}
                        >
                          {step.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <WizardSection
              step={activeDefinition?.number}
              total={wizardSteps.length}
              title={activeDefinition?.title}
              description={activeDefinition?.description}
              icon={activeDefinition?.icon}
              accentColor="#27AE60"
            >
              {activeDefinition?.content}
            </WizardSection>

            <div className="mt-4 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={() => {
                  setActiveStep((step) => Math.max(0, step - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              {currentStepIndex < wizardSteps.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-6 text-xs font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-[#219653]"
                >
                  Save & Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    const saved = await handleStepSave(activeDefinition.key);
                    if (saved) navigate("/properties");
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-6 text-xs font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-[#219653]"
                >
                  Finish Editing <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function WizardSection({ children, step, total, title, description, icon, accentColor }) {
  return (
    <section>
      <div className="mb-2 flex min-w-0 items-center gap-2">
        <div
          className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-2xl text-white text-[12px] font-bold uppercase tracking-wider shrink-0 shadow-lg"
          style={{ background: accentColor, boxShadow: `0 6px 20px ${accentColor}35` }}
        >
          {icon}
          <span className="hidden sm:inline">{title}</span>
        </div>
        <span className="min-w-0 truncate text-xs font-black uppercase tracking-wide text-slate-600 sm:hidden">{title}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-green-900 to-transparent" />
        <span className="shrink-0 text-[10px] font-black tabular-nums text-[#27AE60]">{step}/{String(total).padStart(2, "0")}</span>
      </div>

      <div
        className="bg-white rounded-3xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md"
        style={{ border: `1.5px solid ${accentColor}18`, boxShadow: `0 2px 20px ${accentColor}08` }}
      >
        <div className="h-0.5" style={{ background: `linear-gradient(90deg, ${accentColor}60, ${accentColor}20, transparent)` }} />
        {description && (
          <div className="border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:px-7">
            <p className="text-xs text-slate-500">{description}</p>
          </div>
        )}
        <div className="p-3 sm:p-7 lg:p-8">{children}</div>
      </div>
    </section>
  );
}
