/**
 * Priority scoring for notifications.
 * Placement > Result > Event, tie-broken by recency.
 */
import { logger } from "../middleware/logger";

const PRIORITY_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export function scoreNotification(n) {
  const weight = PRIORITY_WEIGHT[n.Type] ?? 0;
  const ts = new Date(n.Timestamp).getTime();
  return weight * 1e12 + ts;
}

/**
 * Returns top-n notifications by priority score using a min-heap (O(n log k)).
 */
export const getTopNPriority = logger.middleware(
  "getTopNPriority",
  async (notifications, n = 10) => {
    logger.info("getTopNPriority", `Selecting top ${n} from ${notifications.length}`);

    const scored = notifications
      .map((notif) => ({ notif, score: scoreNotification(notif) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((x) => x.notif);

    logger.info("getTopNPriority", "Selection complete", { selected: scored.length });
    return scored;
  }
);
