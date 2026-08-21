import { useEffect, useRef } from "react";
import { pingPresence } from "../features/user/userService";
import { getAuthToken } from "../utils/authToken";

/** How often the open admin tab says "I'm still here". */
const HEARTBEAT_MS = 45_000;

/**
 * While staff keep the admin dashboard open (and tab visible), ping presence.
 * Online/Offline on RM Team Floor = lastSeenAt within ~3 minutes.
 * Closing the tab / hiding it long enough → Offline (logout not required).
 */
export function usePresenceHeartbeat() {
  const inFlight = useRef(false);

  useEffect(() => {
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
  }, []);
}
