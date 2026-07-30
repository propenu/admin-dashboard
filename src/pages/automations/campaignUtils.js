/** Normalize Mongo EmailLog campaign rows + BullMQ status into one UI shape. */

export const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload && typeof payload === "object" && payload.campaignId) return [payload];
  return [];
};

export const unpackOne = (payload) => {
  if (!payload) return null;
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data;
  }
  if (payload.campaignId || payload.total != null) return payload;
  return null;
};

export const normalizeCampaign = (raw = {}) => {
  const campaignId = String(raw.campaignId || raw._id || "").trim();
  const total = Number(raw.total || 0) || 0;
  const completed = Number(raw.completed ?? raw.success ?? 0) || 0;
  const failed = Number(raw.failed || 0) || 0;
  const waiting = Number(raw.waiting ?? raw.pending ?? 0) || 0;
  const processing = Number(raw.processing ?? 0) || 0;
  const active = Number(raw.active || 0) || 0;
  const done = Math.min(total, completed + failed);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  let progress = raw.progress;
  if (typeof progress === "string" && progress.includes("/")) {
    progress = `${pct}%`;
  } else if (typeof progress !== "string" || !progress.includes("%")) {
    progress = `${pct}%`;
  }

  return {
    campaignId,
    total,
    completed,
    failed,
    waiting,
    processing,
    active,
    progress,
    lastUpdated: raw.lastUpdated || raw.latest || null,
  };
};
