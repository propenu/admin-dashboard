import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Download, ExternalLink, Loader2, X } from "lucide-react";

const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

/** PDF preview drawer; the file comes from the shared cache, so reopening is instant. */
export default function InvoiceViewDrawer({ invoice, pdf, onClose, onOpenPdf, onDownload }) {
  const [pdfUrl, setPdfUrl] = useState(() => pdf.peek(invoice));
  const [pdfError, setPdfError] = useState("");

  useEffect(() => {
    let alive = true;
    pdf.get(invoice).then(
      (url) => alive && setPdfUrl(url),
      () => alive && setPdfError("Could not load the PDF"),
    );
    return () => { alive = false; };
  }, [invoice, pdf]);

  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[120] flex justify-end bg-slate-950/40 backdrop-blur-[2px]" style={{ animation: "invoiceFade .15s ease-out" }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <style>{"@keyframes invoiceFade{from{opacity:0}to{opacity:1}}@keyframes invoiceSlide{from{transform:translateX(100%)}to{transform:none}}"}</style>
      <section className="flex h-dvh w-[min(100vw,720px)] flex-col overflow-hidden bg-[#f8faf9] shadow-[-20px_0_60px_rgba(15,23,42,.18)] sm:rounded-l-3xl" style={{ animation: "invoiceSlide .22s cubic-bezier(.4,0,.2,1)" }}>
        <header className="bg-gradient-to-r from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-5 py-4 text-white sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[.18em] text-emerald-100">Tax invoice</p>
              <h2 className="mt-1 truncate font-mono text-lg font-medium">{invoice.invoiceNumber || "Invoice"}</h2>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-50"><CalendarDays size={12} />{date(invoice.invoiceDate)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onOpenPdf(invoice)} title="Open PDF in new tab" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25"><ExternalLink size={15} /></button>
              <button type="button" onClick={() => onDownload(invoice)} title="Download PDF" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25"><Download size={15} /></button>
              <button type="button" onClick={onClose} title="Close" className="rounded-xl bg-white/15 p-2.5 hover:bg-white/25"><X size={15} /></button>
            </div>
          </div>
        </header>

        <div className="relative flex-1 bg-slate-100">
          {pdfUrl ? (
            <iframe title={`Invoice ${invoice.invoiceNumber || ""}`} src={pdfUrl} className="h-full w-full border-0" />
          ) : (
            <div className="grid h-full place-items-center text-center">
              {pdfError ? (
                <p className="text-sm text-red-600">{pdfError}</p>
              ) : (
                <div><Loader2 className="mx-auto animate-spin text-[#27AE60]" size={26} /><p className="mt-2 text-xs text-slate-500">Preparing PDF…</p></div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
