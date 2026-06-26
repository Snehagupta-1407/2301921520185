/**
 * NotificationsPage — shows all notifications with filter, pagination, read/unread.
 */
import { useState } from "react";
import {
  Alert, Badge, Box, CircularProgress, Divider,
  Pagination, Stack, Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { useNotifications } from "../hooks/useNotifications";
import { logger } from "../middleware/logger";

export function NotificationsPage() {
  logger.info("NotificationsPage", "rendered");

  const [filter, setFilter] = useState("All");
  const {
    notifications, totalPages, page, setPage,
    loading, error, readIds, markAsRead, unreadCount,
  } = useNotifications(filter);

  const handleFilterChange = (newFilter) => {
    logger.info("NotificationsPage", "filter changed", { newFilter });
    setFilter(newFilter);
  };

  const handlePageChange = (_, newPage) => {
    logger.info("NotificationsPage", "page changed", { newPage });
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsIcon sx={{ fontSize: 30, color: "primary.main" }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Notifications
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Filter */}
      <Box mb={3}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
      </Box>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load notifications: {error}
        </Alert>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No notifications found for this filter.</Alert>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isRead={readIds.has(n.ID)}
              onRead={markAsRead}
            />
          ))}
        </Stack>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}
    </Box>
  );
}
