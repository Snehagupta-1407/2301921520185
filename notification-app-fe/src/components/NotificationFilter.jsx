import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { logger } from "../middleware/logger";

const FILTERS = ["All", "Placement", "Result", "Event"];

const TYPE_COLORS = {
  Placement: "#1976d2",
  Result: "#388e3c",
  Event: "#f57c00",
  All: "#555",
};

export function NotificationFilter({ value, onChange }) {
  logger.debug("NotificationFilter", "rendered", { value });

  const handleChange = (_, newVal) => {
    if (newVal === null) return; // keep at least one selected
    logger.info("NotificationFilter", "filter changed", { from: value, to: newVal });
    onChange(newVal);
  };

  return (
    <ToggleButtonGroup
      value={value || "All"}
      exclusive
      onChange={handleChange}
      size="small"
      sx={{ flexWrap: "wrap", gap: 0.5 }}
      aria-label="notification filter"
    >
      {FILTERS.map((type) => (
        <ToggleButton
          key={type}
          value={type}
          sx={{
            textTransform: "none",
            px: 2,
            borderRadius: "20px !important",
            fontWeight: 500,
            "&.Mui-selected": {
              backgroundColor: TYPE_COLORS[type],
              color: "#fff",
              "&:hover": { backgroundColor: TYPE_COLORS[type], opacity: 0.9 },
            },
          }}
        >
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
