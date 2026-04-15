
import { useState } from "react";
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { applyValues, extractAllVars, toSamplesMap, toSingleBraces } from "../utils/helpers";

import { BodySection } from "./sections/BodySection";
import { DetectedVarsPanel } from "./sections/DetectedVarsPanel";
import { InfoSection } from "./sections/InfoSection";
import { PreviewPanel } from "./sections/PreviewPanel";
import { StatusSection } from "./sections/StatusSection";
import { SubjectSection } from "./sections/SubjectSection";
import { VariableSamplesSection } from "./sections/VariableSamplesSection";
import { Loader2 } from "lucide-react";





const NotificationForm = ({ initial, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    _id: initial._id || undefined,
    name: initial.name || "",
    slug: initial.slug || "",
    subject: initial.subject || "",
    content: initial.content || "",
    category: initial.category || "festival",
    status: initial.status || "active",
  });

  const [samplesMap, setSamplesMap] = useState(() => {
    if (
      initial.variableSamples &&
      typeof initial.variableSamples === "object"
    ) {
      return initial.variableSamples;
    }
    return toSamplesMap(initial.variables);
  });

  // Only show red validation errors after user first tries to submit
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const detectedVars = useMemo(
    () => extractAllVars(form.subject, form.content),
    [form.subject, form.content],
  );

  const handleSampleChange = (name, value) =>
    setSamplesMap((prev) => ({ ...prev, [name]: value }));

  const missingSamples = detectedVars.filter((n) => !samplesMap[n]?.trim());

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   setSubmitAttempted(true);

  //   // Block save if any variable has no value filled
  //   if (missingSamples.length > 0) {
  //     toast.error(
  //       `Fill values for: ${missingSamples.map((n) => `{{${n}}}`).join(", ")}`,
  //       {
  //         description:
  //           "These values replace the tokens in subject & body before saving.",
  //       },
  //     );
  //     return;
  //   }

  //   // Substitute all {{varName}} → actual value in subject & content, then save
  //   onSubmit({
  //     ...form,
  //     subject: applyValues(form.subject, samplesMap),
  //     content: applyValues(form.content, samplesMap),
  //     variables: detectedVars,
  //   });
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (missingSamples.length > 0) {
      toast.error(
        `Fill values for: ${missingSamples.map((n) => `{{${n}}}`).join(", ")}`,
      );
      return;
    }

    // ✅ DO NOT replace values while saving
    onSubmit({
      ...form,
      subject: toSingleBraces(form.subject), // ✅ {{name}} → {name}
      content: toSingleBraces(form.content), // ✅
      variables: detectedVars,
      variableSamples: samplesMap,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex lg:flex-row md:flex-col sm:flex-col max-sm:flex-col  gap-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <InfoSection form={form} setField={setField} />

        {/* 1 — Subject */}
        <SubjectSection
          subject={form.subject}
          onChange={(v) => setField("subject", v)}
        />

        {/* 2 — Variable Values (required) */}
        <VariableSamplesSection
          detectedVars={detectedVars}
          samplesMap={samplesMap}
          onSampleChange={handleSampleChange}
          showErrors={submitAttempted}
        />

        {/* 3 — Body */}
        <BodySection
          content={form.content}
          onChange={(v) => setField("content", v)}
        />

        {/* Detected vars read-only */}
        <DetectedVarsPanel detectedVars={detectedVars} />

        

        {/* 5 — Status */}
        <StatusSection
          status={form.status}
          onChange={(v) => setField("status", v)}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-2xl hover:bg-green-700 active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-green-200"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting
            ? "Saving…"
            : initial._id
              ? "Update Template"
              : "Create Template"}
        </button>
      </div>

      <PreviewPanel
        form={form}
        detectedVars={detectedVars}
        samplesMap={samplesMap}
      />
    </form>
  );
};

export default NotificationForm;