/**
 * PriorityNotificationsPage
 * Shows top-N priority notifications (Placement > Result > Event + recency).
 * Allows user to configure N and filter by type.
 */
import { useState } from "react";
import {
  Alert, Badge, Box, CircularProgress, Divider,
  MenuItem, Select, Stack, Typography, FormControl, InputLabel,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { usePriorityNotifications } from "../hooks/usePriorityNotifications";
import { logger } from "../middleware/logger";

const TOP_N_OPTIONS = [5, 10, 15, 20];

export function PriorityNotificationsPage() {
  logger.info("PriorityNotificationsPage", "rendered");

  const [topN, setTopN] = useState(10);
  const [filter, setFilter] = useState("All");

  const {
    notifications, loading, error,
    readIds, markAsRead, unreadCount,
  } = usePriorityNotifications(topN, filter);

  const handleTopNChange = (e) => {
    logger.info("PriorityNotificationsPage", "topN changed", { topN: e.target.value });
    setTopN(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    logger.info("PriorityNotificationsPage", "filter changed", { newFilter });
    setFilter(newFilter);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <StarIcon sx={{ fontSize: 30, color: "warning.main" }} />
        </Badge>
        <Typography variant="h5" fontWeight={700}>
          Priority Inbox
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Top {topN} notifications ranked by importance (Placement &gt; Result &gt; Event) and recency.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} alignItems={{ sm: "center" }}>
        <NotificationFilter value={filter} onChange={handleFilterChange} />
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Show Top</InputLabel>
          <Select value={topN} label="Show Top" onChange={handleTopNChange}>
            {TOP_N_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>Top {n}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Error */}
      {!loading && error && (
        <Alert severity="error">Failed to load notifications: {error}</Alert>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <Alert severity="info">No priority notifications found.</Alert>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <Stack spacing={1.5}>
          {notifications.map((n, i) => (
            <Box key={n.ID}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                sx={{ pl: 0.5 }}
              >
                #{i + 1}
              </Typography>
              <NotificationCard
                notification={n}
                isRead={readIds.has(n.ID)}
                onRead={markAsRead}
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
