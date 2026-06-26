/**
 * usePriorityNotifications hook
 * Fetches all notifications and returns top-n by priority score.
 */
import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";
import { getTopNPriority } from "../api/priority";
import { logger } from "../middleware/logger";

export function usePriorityNotifications(topN = 10, filterType = "All") {
  logger.debug("usePriorityNotifications", "hook rendered", { topN, filterType });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("readNotifIds");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markAsRead = useCallback((id) => {
    logger.info("usePriorityNotifications", "markAsRead", { id });
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        sessionStorage.setItem("readNotifIds", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const load = useCallback(async () => {
    logger.info("usePriorityNotifications", "load triggered", { topN, filterType });
    setLoading(true);
    setError(null);
    try {
      // Fetch a large batch to select top-n from
      const data = await fetchNotifications({ page: 1, limit: 10, notification_type: filterType === "All" ? null : filterType });
      const top = await getTopNPriority(data.notifications, topN);
      setNotifications(top);
      logger.info("usePriorityNotifications", "load success", { count: top.length });
    } catch (err) {
      logger.error("usePriorityNotifications", "load failed", { error: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [topN, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.ID)).length;

  return { notifications, loading, error, readIds, markAsRead, unreadCount, reload: load };
}
