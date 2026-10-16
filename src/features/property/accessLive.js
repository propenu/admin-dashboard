import { useEffect, useRef } from "react";
import { SERVICES } from "../../config/services";
import { ENV } from "../../config/env";
import { getAuthToken } from "../../utils/authToken";

const RETRY_MS = 3000;
const listeners = new Set();
let controller = null;
let retryTimer = 0;

const streamUrl = () => `${ENV.API_BASE_URL}${SERVICES.PROPERTY}/deleted-listings/access/stream`;

const emit = (change) => {
  listeners.forEach((listener) => {
    try {
      listener(change);
    } catch {
      /* one bad listener must not stop the others */
    }
  });
};

function scheduleRetry() {
  window.clearTimeout(retryTimer);
  if (!listeners.size) return;
  retryTimer = window.setTimeout(connect, RETRY_MS);
}

async function connect() {
  if (controller || !listeners.size) return;
  const token = getAuthToken();
  if (!token) return scheduleRetry();
  const current = new AbortController();
  controller = current;
  try {
    const response = await fetch(streamUrl(), {
      headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
      signal: current.signal,
      credentials: "include",
    });
    if (!response.ok || !response.body) throw new Error(`Access stream failed (${response.status})`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let sep;
      while ((sep = buffer.indexOf("\n\n")) >= 0) {
        const chunk = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        let eventName = "message";
        const data = [];
        for (const line of chunk.split("\n")) {
          if (line.startsWith("event:")) eventName = line.slice(6).trim();
          else if (line.startsWith("data:")) data.push(line.slice(5).trim());
        }
        if (eventName !== "access" || !data.length) continue;
        try {
          emit(JSON.parse(data.join("\n")));
        } catch {
          /* ignore malformed frame */
        }
      }
    }
  } catch {
    /* network drop or abort; retry below if still wanted */
  } finally {
    if (controller === current) controller = null;
    if (!current.signal.aborted) scheduleRetry();
  }
}

function subscribe(listener) {
  listeners.add(listener);
  connect();
  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      window.clearTimeout(retryTimer);
      controller?.abort();
      controller = null;
    }
  };
}

/** Calls onChange whenever Super Admin or a head flips an access switch (deleted pages, lead contacts). */
export function useAccessLiveUpdates(onChange) {
  const callbackRef = useRef(onChange);
  useEffect(() => {
    callbackRef.current = onChange;
  });
  useEffect(() => subscribe((change) => callbackRef.current?.(change)), []);
}
