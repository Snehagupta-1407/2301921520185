import {
  Box, Card, CardActionArea, CardContent,
  Chip, Typography, Tooltip,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { logger } from "../middleware/logger";

const TYPE_CONFIG = {
  Placement: { color: "primary", emoji: "💼" },
  Result:    { color: "success", emoji: "📋" },
  Event:     { color: "warning", emoji: "🎉" },
};

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function NotificationCard({ notification, isRead, onRead }) {
  const { ID, Type, Message, Timestamp } = notification;
  const config = TYPE_CONFIG[Type] ?? { color: "default", emoji: "🔔" };

  const handleClick = () => {
    if (!isRead) {
      logger.info("NotificationCard", "marked as read", { id: ID });
      onRead(ID);
    }
  };

  return (
    <Card
      elevation={isRead ? 0 : 2}
      sx={{
        border: "1px solid",
        borderColor: isRead ? "divider" : "primary.light",
        borderRadius: 2,
        transition: "all 0.2s ease",
        opacity: isRead ? 0.75 : 1,
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardActionArea onClick={handleClick} disabled={isRead}>
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1}>
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              {!isRead && (
                <Tooltip title="Unread">
                  <CircleIcon sx={{ fontSize: 8, color: "primary.main", mt: 0.5, flexShrink: 0 }} />
                </Tooltip>
              )}
              <Box>
                <Typography
                  variant="body1"
                  fontWeight={isRead ? 400 : 600}
                  sx={{ textTransform: "capitalize" }}
                >
                  {config.emoji} {Message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatTime(Timestamp)}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={Type}
              color={config.color}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 600, fontSize: "0.7rem" }}
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
