/**
 * Notifications API client
 * Fetches from the evaluation server with Bearer token auth.
 */
import { logger } from "../middleware/logger";

const BASE_URL = "/api";
// Replace with your actual token from /evaluation-service/auth
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjc2FpZXdzMjMwMkBnbGJpdG0uYWMuaW4iLCJleHAiOjE3ODI0NjAwODQsImlhdCI6MTc4MjQ1OTE4NCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImY0YjYxNTRlLTY4MzItNDg2YS1hNDg0LTU1MDYxYzU1YWQ4OCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InNuZWhhIGd1cHRhIiwic3ViIjoiMjRlYWFkZjctOWEyOC00YzVjLWIwZmYtMmY3ZTE1ZDViYzQ2In0sImVtYWlsIjoiY3NhaWV3czIzMDJAZ2xiaXRtLmFjLmluIiwibmFtZSI6InNuZWhhIGd1cHRhIiwicm9sbE5vIjoiMjMwMTkyMTUyMDE4NSIsImFjY2Vzc0NvZGUiOiJ4eGtKbmsiLCJjbGllbnRJRCI6IjI0ZWFhZGY3LTlhMjgtNGM1Yy1iMGZmLTJmN2UxNWQ1YmM0NiIsImNsaWVudFNlY3JldCI6IktxRXBzd1dwR3B1WndBQksifQ.OjXRGCKzDGhEmFycm-rQE67N8kAzZP87nZKTsBVxB70";
console.log("TOKEN FROM ENV:", AUTH_TOKEN);
export const fetchNotifications = logger.middleware(
  "fetchNotifications",
  async ({ page = 1, limit = 10, notification_type = null } = {}) => {
const url = new URL(`${BASE_URL}/notifications`, window.location.origin);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    if (notification_type && notification_type !== "All") {
      url.searchParams.set("notification_type", notification_type);
    }

    logger.info("fetchNotifications", "Calling API", { page, limit, notification_type });

    const res = await fetch(url.toString()
    , {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Request URL:", url.toString());
console.log("Response Status:", res.status);
console.log("Response Status Text:", res.statusText);

    if (!res.ok) {
      logger.error("fetchNotifications", "API error", { status: res.status });
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    logger.info("fetchNotifications", "Response received", {
      count: data.notifications?.length ?? 0,
    });

    return {
      notifications: data.notifications ?? [],
      total: data.total ?? data.notifications?.length ?? 0,
    };
  }
);
