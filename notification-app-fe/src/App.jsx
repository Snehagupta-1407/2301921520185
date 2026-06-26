/**
 * App — root component with navigation between pages.
 * Runs exclusively on http://localhost:3000
 */
import { useState } from "react";
import {
  AppBar, Box, Container, CssBaseline, Tab, Tabs,
  ThemeProvider, Toolbar, Typography, createTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import { NotificationsPage } from "./pages/NotificationsPage";
import { PriorityNotificationsPage } from "./pages/PriorityNotificationsPage";
import { logger } from "./middleware/logger";

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  logger.info("App", "mounted");
  const [tab, setTab] = useState(0);

  const handleTabChange = (_, newTab) => {
    logger.info("App", "tab changed", { tab: newTab });
    setTab(newTab);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
            🏫 Campus Notifications
          </Typography>
        </Toolbar>
        <Box sx={{ bgcolor: "primary.dark" }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ "& .MuiTab-root": { color: "rgba(255,255,255,0.7)" }, "& .Mui-selected": { color: "#fff" } }}
          >
            <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="All Notifications" />
            <Tab icon={<StarIcon fontSize="small" />} iconPosition="start" label="Priority Inbox" />
          </Tabs>
        </Box>
      </AppBar>

      <Box component="main" sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 112px)", py: 2 }}>
        <Container maxWidth="md" disableGutters>
          {tab === 0 && <NotificationsPage />}
          {tab === 1 && <PriorityNotificationsPage />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
