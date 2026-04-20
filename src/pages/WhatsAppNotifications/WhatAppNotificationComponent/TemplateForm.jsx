// frontend/admin-dashboard/src/pages/WhatsAppNotifications/WhatAppNotificationComponent/TemplateForm.jsx
import { useState } from "react";
import { EMPTY_FORM } from "../common/EmptyForm";
import { countVars } from "../utils/helper";

import { toast } from "sonner";
import { buildPayload } from "../utils/payloadBuilder";
import { HeaderSection } from "./sections/HeaderSection";
import { BodySection } from "./sections/BodySection";
import { FooterSection } from "./sections/FooterSection";
import { ButtonsSection } from "./sections/ButtonsSection";
import { InfoSection } from "./sections/InfoSection";
import { PreviewPanel } from "./preview/PreviewPanel";
import { Loader2 } from "lucide-react";


export const TemplateForm = ({ initial, onSubmit, submitting }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      // ✅ BODY
      if (!form.body.text?.trim()) {
        toast.error("Body text is required");
        return;
      }

      // ✅ VARIABLES
      const vc = countVars(form.body.text);
      if (vc > 0 && form.body.examples.filter(Boolean).length < vc) {
        toast.error(`Add sample values for all ${vc} variable(s)`);
        return;
      }

      // ✅ NAME
      if (!form.name?.trim()) {
        toast.error("Template name is required");
        return;
      }

      // ✅ HEADER TEXT VALIDATION (🔥 NEW)
      if (
        form.header.enabled &&
        form.header.format === "TEXT" &&
        !form.header.text?.trim()
      ) {
        toast.error("Header text is required");
        return;
      }

      // ✅ HEADER MEDIA VALIDATION
      if (
        form.header.enabled &&
        form.header.format !== "TEXT" &&
        !form.header.mediaHandle
      ) {
        toast.error(`Please upload ${form.header.format} media`);
        return;
      }

      // ✅ BUILD PAYLOAD SAFELY
      const payload = buildPayload(form);

      onSubmit(payload);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <InfoSection form={form} setField={setField} />

        <HeaderSection
          header={form.header}
          onChange={(v) => setField("header", v)}
        />
        <BodySection body={form.body} onChange={(v) => setField("body", v)} />
        <FooterSection
          footer={form.footer}
          onChange={(v) => setField("footer", v)}
        />
        <ButtonsSection
          buttons={form.buttons}
          onChange={(v) => setField("buttons", v)}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting
            ? "Submitting to Meta…"
            : initial._id
              ? "Update Template"
              : "Submit Template to Meta"}
        </button>
      </div>
      <PreviewPanel form={form} />
    </form>
  );
};