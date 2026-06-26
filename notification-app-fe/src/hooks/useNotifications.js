/**
 * useNotifications hook
 * Handles fetching, pagination, filtering, and read/unread tracking.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { fetchNotifications } from "../api/notifications";
import { logger } from "../middleware/logger";

const PAGE_SIZE = 10;

export function useNotifications(filterType = "All") {
  logger.debug("useNotifications", "hook rendered", { filterType });

  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track read notification IDs in a Set (persisted to sessionStorage)
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("readNotifIds");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markAsRead = useCallback((id) => {
    logger.info("useNotifications", "markAsRead", { id });
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
    logger.info("useNotifications", "load triggered", { page, filterType });
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({
        page,
        limit: PAGE_SIZE,
        notification_type: filterType === "All" ? null : filterType,
      });
      setNotifications(data.notifications);
      setTotal(data.total);
      logger.info("useNotifications", "load success", { count: data.notifications.length });
    } catch (err) {
      logger.error("useNotifications", "load failed", { error: err.message });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, filterType]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setPage(1);
  }, [filterType]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const unreadCount = notifications.filter((n) => !readIds.has(n.ID)).length;

  return {
    notifications,
    total,
    totalPages,
    page,
    setPage,
    loading,
    error,
    readIds,
    markAsRead,
    unreadCount,
    reload: load,
  };
}
