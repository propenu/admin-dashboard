import { useEffect, useRef } from "react";
import { pingPresence } from "../features/user/userService";
import { getAuthToken } from "../utils/authToken";

/** How often the open admin tab says "I'm still here". */
const HEARTBEAT_MS = 45_000;

/**
 * While staff keep the admin dashboard open (and tab visible), ping presence.
 * Starts only after shell session is ready (enabled).
 */
export function usePresenceHeartbeat(options = {}) {
  const { enabled = true } = options;
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;

    const beat = async () => {
      if (!getAuthToken()) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        await pingPresence();
      } catch {
        /* non-blocking — network blips should not spam */
      } finally {
        inFlight.current = false;
      }
    };

    beat();
    const id = window.setInterval(beat, HEARTBEAT_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") beat();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);
}
