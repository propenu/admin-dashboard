/** Session bridge: Client Progress Queue → WhatsApp Inbox composer */
export const WA_INBOX_COMPOSE_KEY = "propenu:wa-inbox-compose";

/** In-memory copy so React Strict Mode double-mount still has the draft. */
let memoryComposePayload = null;

export function normalizeInboxWaId(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return "";
  digits = digits.replace(/^0+/, "");
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export function waIdsMatch(a, b) {
  const left = String(a || "").replace(/\D/g, "");
  const right = String(b || "").replace(/\D/g, "");
  if (!left || !right) return false;
  return (
    left === right ||
    left.endsWith(right) ||
    right.endsWith(left)
  );
}

export function saveInboxComposePayload(payload) {
  const phone = normalizeInboxWaId(payload?.phone);
  const draft = String(payload?.draft || "").trim();
  if (!phone || !draft) return false;
  const next = {
    phone,
    name: String(payload?.name || "").trim(),
    draft,
    ts: Date.now(),
  };
  memoryComposePayload = next;
  try {
    sessionStorage.setItem(WA_INBOX_COMPOSE_KEY, JSON.stringify(next));
  } catch {
    /* memory still holds it */
  }
  return true;
}

export function readInboxComposePayload() {
  if (memoryComposePayload?.phone && memoryComposePayload?.draft) {
    return { ...memoryComposePayload };
  }
  try {
    const raw = sessionStorage.getItem(WA_INBOX_COMPOSE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const phone = normalizeInboxWaId(parsed?.phone);
    const draft = String(parsed?.draft || "").trim();
    if (!phone || !draft) {
      clearInboxComposePayload();
      return null;
    }
    if (parsed?.ts && Date.now() - Number(parsed.ts) > 30 * 60 * 1000) {
      clearInboxComposePayload();
      return null;
    }
    memoryComposePayload = {
      phone,
      name: String(parsed?.name || "").trim(),
      draft,
      ts: parsed.ts,
    };
    return { ...memoryComposePayload };
  } catch {
    return null;
  }
}

export function clearInboxComposePayload() {
  memoryComposePayload = null;
  try {
    sessionStorage.removeItem(WA_INBOX_COMPOSE_KEY);
  } catch {
    /* ignore */
  }
}
