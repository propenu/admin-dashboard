import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

const GREEN = rgb(0.153, 0.682, 0.376); // #27AE60
const GREEN_DARK = rgb(0.09, 0.45, 0.27);
const SLATE = rgb(0.1, 0.14, 0.2);
const MUTED = rgb(0.4, 0.45, 0.52);
const LINE = rgb(0.88, 0.91, 0.94);
const CARD_BG = rgb(0.96, 0.98, 0.97);
const ORANGE = rgb(0.9, 0.45, 0.1);
const WHITE = rgb(1, 1, 1);

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

/**
 * Build a visual Support Head → Operations PDF and trigger download.
 */
export async function downloadOpsReportPdf({
  overview,
  rangeLabel,
  headName,
} = {}) {
  const s = overview?.summary || {};
  const pods = overview?.tlPods || [];
  const pack = overview?.leadershipPack || {};
  const journey = overview?.journeyMix || [];
  const generatedAt = new Date().toLocaleString("en-IN");

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595, 842]); // A4
  let { width, height } = page.getSize();
  let y = height - 40;

  const ensureSpace = (need = 40) => {
    if (y < need + 40) {
      page = pdf.addPage([595, 842]);
      ({ width, height } = page.getSize());
      y = height - 40;
    }
  };

  const drawText = (text, x, yy, size, bold = false, color = SLATE) => {
    page.drawText(String(text ?? ""), {
      x,
      y: yy,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };

  // ── Header band ──────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: height - 88,
    width,
    height: 88,
    color: GREEN,
  });
  drawText("PROPENU", 40, height - 36, 11, true, WHITE);
  drawText("Customer Support Head  ·  Operations Report", 40, height - 56, 16, true, WHITE);
  drawText(`Period: ${rangeLabel || "Selected period"}  ·  Generated: ${generatedAt}`, 40, height - 74, 9, false, WHITE);
  y = height - 110;

  drawText(`Prepared by: ${headName || "Support Head"}`, 40, y, 10, false, MUTED);
  y -= 22;

  // ── KPI cards ────────────────────────────────────────────────
  drawText("Department overview", 40, y, 12, true, GREEN_DARK);
  y -= 14;

  const kpis = [
    { label: "Open tickets", value: s.openTickets },
    { label: "Unassigned", value: s.unassignedTickets },
    { label: "SLA risk", value: s.slaRisk },
    { label: "Assigned", value: s.assigned },
    { label: "In progress", value: s.inProgress },
    { label: "Completed", value: s.completed },
    { label: "Team Leads", value: s.activeTeamLeads },
    { label: "Ops focus", value: s.pendingOpsReports },
  ];

  const cardW = 120;
  const cardH = 48;
  const gap = 10;
  const startX = 40;
  kpis.forEach((kpi, index) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    if (col === 0) ensureSpace(cardH + 20);
    const x = startX + col * (cardW + gap);
    const cy = y - row * (cardH + gap) - cardH;
    page.drawRectangle({
      x,
      y: cy,
      width: cardW,
      height: cardH,
      color: CARD_BG,
      borderColor: LINE,
      borderWidth: 1,
    });
    drawText(kpi.label, x + 10, cy + 30, 8, false, MUTED);
    drawText(fmt(kpi.value), x + 10, cy + 12, 14, true, SLATE);
  });
  y -= Math.ceil(kpis.length / 4) * (cardH + gap) + 16;

  // ── Leadership focus ─────────────────────────────────────────
  ensureSpace(80);
  drawText("Leadership focus", 40, y, 12, true, GREEN_DARK);
  y -= 8;
  page.drawRectangle({ x: 40, y: y - 2, width: 120, height: 2, color: GREEN });
  y -= 18;

  const focusItems = pack.items || [];
  focusItems.forEach((item) => {
    ensureSpace(36);
    page.drawRectangle({
      x: 40,
      y: y - 28,
      width: width - 80,
      height: 32,
      color: item.available ? rgb(1, 0.97, 0.93) : CARD_BG,
      borderColor: LINE,
      borderWidth: 1,
    });
    drawText(item.label || "Item", 52, y - 12, 10, true, SLATE);
    drawText(item.description || "", 52, y - 24, 8, false, MUTED);
    const badge = item.available ? String(fmt(item.count)) : "OK";
    const badgeColor = item.available ? ORANGE : GREEN_DARK;
    drawText(badge, width - 80, y - 16, 11, true, badgeColor);
    y -= 40;
  });

  y -= 6;

  // ── Journey mix ──────────────────────────────────────────────
  if (journey.length) {
    ensureSpace(70);
    drawText("Journey mix (open work by stage)", 40, y, 12, true, GREEN_DARK);
    y -= 8;
    page.drawRectangle({ x: 40, y: y - 2, width: 180, height: 2, color: GREEN });
    y -= 18;
    journey.forEach((item) => {
      ensureSpace(22);
      const label = `${item.shortLabel || item.label}: ${fmt(item.value)} (${item.percentage || 0}%)`;
      drawText(label, 52, y, 10, false, SLATE);
      const status = Number(item.value || 0) === 0 ? "OK" : "Needs work";
      drawText(status, width - 110, y, 9, true, Number(item.value || 0) === 0 ? GREEN_DARK : ORANGE);
      y -= 16;
    });
    y -= 10;
  }

  // ── Team Lead pods table ─────────────────────────────────────
  ensureSpace(90);
  drawText("Team Lead pods", 40, y, 12, true, GREEN_DARK);
  y -= 8;
  page.drawRectangle({ x: 40, y: y - 2, width: 110, height: 2, color: GREEN });
  y -= 20;

  const cols = [
    { key: "name", label: "Team Lead", w: 130 },
    { key: "cceCount", label: "CCEs", w: 40 },
    { key: "assigned", label: "A", w: 36 },
    { key: "inProgress", label: "P", w: 36 },
    { key: "completed", label: "D", w: 36 },
    { key: "openTickets", label: "Tickets", w: 50 },
    { key: "stuckCases", label: "Stuck", w: 44 },
    { key: "online", label: "Status", w: 50 },
  ];

  const drawTableHeader = () => {
    ensureSpace(28);
    page.drawRectangle({
      x: 40,
      y: y - 18,
      width: width - 80,
      height: 22,
      color: GREEN_DARK,
    });
    let x = 48;
    cols.forEach((c) => {
      drawText(c.label, x, y - 12, 8, true, WHITE);
      x += c.w;
    });
    y -= 26;
  };

  drawTableHeader();

  if (!pods.length) {
    drawText("No Team Lead pods in this period.", 48, y, 9, false, MUTED);
    y -= 20;
  } else {
    pods.forEach((pod, index) => {
      ensureSpace(28);
      if (y < 70) {
        drawTableHeader();
      }
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 40,
          y: y - 14,
          width: width - 80,
          height: 18,
          color: CARD_BG,
        });
      }
      const row = {
        name: String(pod.name || "Team Lead").slice(0, 22),
        cceCount: fmt(pod.cceCount),
        assigned: fmt(pod.assigned),
        inProgress: fmt(pod.inProgress),
        completed: fmt(pod.completed),
        openTickets: fmt(pod.openTickets),
        stuckCases: fmt(pod.stuckCases),
        online: pod.isOnline ? "Online" : "Offline",
      };
      let x = 48;
      cols.forEach((c) => {
        drawText(row[c.key], x, y - 10, 8, false, SLATE);
        x += c.w;
      });
      y -= 18;
    });
  }

  // ── Footer ───────────────────────────────────────────────────
  ensureSpace(50);
  y -= 10;
  page.drawRectangle({ x: 40, y: y + 4, width: width - 80, height: 1, color: LINE });
  y -= 12;
  drawText(
    "Propenu Support  ·  Internal operations document  ·  Not for external sharing",
    40,
    y,
    8,
    false,
    MUTED,
  );

  const bytes = await pdf.save();
  const stamp = new Date().toISOString().slice(0, 10);
  saveAs(
    new Blob([bytes], { type: "application/pdf" }),
    `support-head-ops-report-${stamp}.pdf`,
  );
}
