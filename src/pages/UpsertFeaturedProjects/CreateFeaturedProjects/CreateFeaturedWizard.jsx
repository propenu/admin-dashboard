// frontend/admin-dashboard/src/pages/post-property/CreateFeaturedWizard.jsx
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stepper from "./Constants/Stepper";
import { fetchLoggedInUser } from "../../../services/UserServices/userServices";
import { useFeaturedProject } from "./hook/useFeaturedProject";
import { ALL_STEPS, STEP_META } from "./Constants/constants";
import { StepRenderer } from "./Components/StepRenderer";
import { Header } from "./Components/Header";
import { StepHeaderCard } from "./Components/StepHeaderCard";
import { MainFormCard } from "./Components/MainFormCard";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";


export default function CreateFeaturedWizard() {
  const navigate = useNavigate();

  // ── Read initial values from localStorage once (avoids re-render on mount) ──
  const initialStepRef = useRef(null);
  const initialMaxRef = useRef(null);

  if (initialStepRef.current === null) {
    const savedStep = localStorage.getItem("featured_step");
    initialStepRef.current = savedStep ? Number(savedStep) : 0;
  }

  if (initialMaxRef.current === null) {
    const savedMax = localStorage.getItem("featured_max_completed");
    initialMaxRef.current = savedMax ? Number(savedMax) : 0;
  }

  const [current, setCurrent] = useState(initialStepRef.current);

  // ── maxCompleted tracks the highest step the user successfully passed via Next ──
  // Going backward does NOT decrease this value, so stepper knows what's already done
  const [maxCompleted, setMaxCompleted] = useState(initialMaxRef.current);

  const [isSeoValid, setIsSeoValid] = useState(false);
  const [stepperOpen, setStepperOpen] = useState(false);

  const location = useLocation();
  const projectTypeRef = useRef(location.state?.type);
  const projectType = projectTypeRef.current;

  const {
    payload,
    setPayload,
    updatePayload,
    replacePayload,
    submit,
    isLoading,
    progress,
  } = useFeaturedProject(projectType);

  const basicRef = useRef();
  const heroRef = useRef();
  const bhkRef = useRef();
  const amenitiesRef = useRef();
  const galleryRef = useRef();
  const aboutRef = useRef();
  const locationRef = useRef();
  const propertyProfilesRef = useRef();
  const seoRef = useRef();

  const isRestoringRef = useRef(false);

  // Persist current step to localStorage
  useEffect(() => {
    if (isRestoringRef.current) return;
    localStorage.setItem("featured_step", current);
    console.log("💾 Saved Step:", current);
  }, [current]);

  // Persist maxCompleted to localStorage
  useEffect(() => {
    localStorage.setItem("featured_max_completed", maxCompleted);
    console.log("💾 Saved Max Completed:", maxCompleted);
  }, [maxCompleted]);

  useEffect(() => {
    console.log("🚀 Wizard Mounted");
  }, []);

  // Guard against invalid step values
  useEffect(() => {
    if (current < 0 || current >= ALL_STEPS.length) {
      console.warn("⚠ Invalid step detected, resetting to 0");
      setCurrent(0);
    }
  }, [current]);

  // Load logged-in user into payload
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchLoggedInUser();
        if (!user) return;
        setPayload((prev) => ({
          ...prev,
          createdBy: user.id ?? user._id ?? "",
        }));
      } catch (err) {
        console.warn("User load failed", err);
      }
    }
    loadUser();
  }, []);

  // Close mobile stepper when step changes
  useEffect(() => {
    setStepperOpen(false);
  }, [current]);

  const handleSubmit = () => {
    submit();
    localStorage.removeItem("featured_step");
    localStorage.removeItem("featured_max_completed");
  };

  // ── Triggers UI error display for a specific step ──
  const validateSpecificStep = (stepIndex) => {
    const stepId = ALL_STEPS[stepIndex]?.id;

    if (stepId === "basic") return basicRef.current?.validate();
    if (stepId === "hero") return heroRef.current?.validate();
    if (stepId === "bhk") return bhkRef.current?.validate();
    if (stepId === "amenities") return amenitiesRef.current?.validate();
    if (stepId === "gallery") return galleryRef.current?.validate();
    if (stepId === "about") return aboutRef.current?.validate();
    if (stepId === "location") return locationRef.current?.validate();
    if (stepId === "propertyProfiles")
      return propertyProfilesRef.current?.validate();
    if (stepId === "seo") {
      const ok = seoRef.current?.validate();
      setIsSeoValid(ok);
      return ok;
    }

    return true;
  };

  // ── Silent check (no UI errors) ──
  const checkStepValid = (stepIndex) => {
    const stepId = ALL_STEPS[stepIndex]?.id;

    if (stepId === "basic") return basicRef.current?.isValid();
    if (stepId === "hero") return heroRef.current?.isValid();
    if (stepId === "bhk") return bhkRef.current?.isValid();
    if (stepId === "amenities") return amenitiesRef.current?.isValid();
    if (stepId === "gallery") return galleryRef.current?.isValid();
    if (stepId === "about") return aboutRef.current?.isValid();
    if (stepId === "location") return locationRef.current?.isValid();
    if (stepId === "propertyProfiles")
      return propertyProfilesRef.current?.isValid();
    if (stepId === "seo") return seoRef.current?.isValid();

    return true;
  };

  /**
   * handleStepClick — called when user clicks a step in the Stepper.
   *
   * Rules:
   *  - Backward: always allowed freely
   *  - Within completed range (≤ maxCompleted): allowed freely
   *  - Beyond completed range: validate from maxCompleted onward,
   *    block at the first incomplete step
   */
  const handleStepClick = (targetIndex) => {
    // ✅ Free backward navigation
    if (targetIndex < current) {
      setCurrent(targetIndex);
      return;
    }

    // ✅ Target is within already-completed steps → jump freely
    if (targetIndex <= maxCompleted) {
      setCurrent(targetIndex);
      return;
    }

    // 🔍 Validate only from maxCompleted onward (not from current)
    let firstInvalid = -1;
    for (let i = maxCompleted; i < targetIndex; i++) {
      if (!checkStepValid(i)) {
        firstInvalid = i;
        break;
      }
    }

    if (firstInvalid !== -1) {
      // Trigger UI validation errors on that step, then navigate there
      validateSpecificStep(firstInvalid);
      toast.error(`⚠ Please complete Step ${firstInvalid + 1}`);
      setCurrent(firstInvalid);
      return;
    }

    setCurrent(targetIndex);
  };

  /**
   * handleNext — validates the current step and advances.
   * Also updates maxCompleted so stepper knows this step is done.
   */
  const handleNext = () => {
    const stepId = ALL_STEPS[current]?.id;

    if (stepId === "basic" && !basicRef.current?.validate()) return;
    if (stepId === "hero" && !heroRef.current?.validate()) return;
    if (stepId === "bhk" && !bhkRef.current?.validate()) return;
    if (stepId === "amenities" && !amenitiesRef.current?.validate()) return;
    if (stepId === "gallery" && !galleryRef.current?.validate()) return;
    if (stepId === "about" && !aboutRef.current?.validate()) return;
    if (stepId === "location" && !locationRef.current?.validate()) return;
    if (
      stepId === "propertyProfiles" &&
      !propertyProfilesRef.current?.validate()
    )
      return;
    if (stepId === "seo") {
      const ok = seoRef.current?.validate();
      setIsSeoValid(ok);
      if (!ok) return;
    }

    const nextStep = Math.min(current + 1, ALL_STEPS.length - 1);

    // ✅ Advance the high-water mark so stepper renders this step as "done"
    setMaxCompleted((prev) => Math.max(prev, nextStep));
    setCurrent(nextStep);
  };

  const StepComponent = (
    <StepRenderer
      step={ALL_STEPS[current].id}
      refs={{
        basic: basicRef,
        hero: heroRef,
        bhk: bhkRef,
        amenities: amenitiesRef,
        gallery: galleryRef,
        about: aboutRef,
        location: locationRef,
        propertyProfiles: propertyProfilesRef,
        seo: seoRef,
      }}
      payload={payload}
      update={updatePayload}
      replace={replacePayload}
    />
  );

  const isLastStep = current === ALL_STEPS.length - 1 && isSeoValid;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky Topbar ── */}
      <Header current={current} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* ── Desktop Stepper (md+) ── */}
        <div className="hidden md:block">
          <Stepper
            steps={ALL_STEPS}
            current={current}
            maxCompleted={maxCompleted}
            onClickStep={handleStepClick}
          />
        </div>

        {/* ── Mobile Stepper (collapsible) ── */}
        <div className="md:hidden">
          <button
            onClick={() => setStepperOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{STEP_META[current].icon}</span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#27AE60]">
                  Step {current + 1} of {ALL_STEPS.length}
                </p>
                <p className="text-xs font-bold text-gray-700">
                  {ALL_STEPS[current].title}
                </p>
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-400 transition-transform duration-200 ${stepperOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown stepper on mobile */}
          {stepperOpen && (
            <div className="mt-1 bg-white rounded-xl border border-gray-200 shadow-md p-3 overflow-x-auto">
              <Stepper
                steps={ALL_STEPS}
                current={current}
                maxCompleted={maxCompleted}
                onClickStep={handleStepClick}
              />
            </div>
          )}
        </div>

        {/* ── Step Header Card ── */}
        <StepHeaderCard current={current} />

        {/* ── Main Form Card ── */}
        <MainFormCard
          StepComponent={StepComponent}
          current={current}
          setCurrent={setCurrent}
          isLastStep={isLastStep}
          handleNext={handleNext}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          progress={progress}
        />
      </div>
    </div>
  );
}