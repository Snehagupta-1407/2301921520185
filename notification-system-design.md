# Notification System Design

## Stage 1

### Problem

The campus notification platform receives a continuous stream of notifications across three types: **Placement**, **Result**, and **Event**. Users lose track of important updates due to the high volume. The goal is to always surface the top-N most important unread notifications efficiently.

---

### Priority Model

Priority is determined by a **composite score**:

```
score = typeWeight × 10^12 + unixTimestampMs
```

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

The large multiplier (10¹²) ensures **type priority always dominates recency** across different types, while within the same type, newer notifications rank higher.

**Example:**
- Placement from yesterday vs Event from now → Placement wins
- Two Placements → the more recent one wins

---

### Algorithm: Min-Heap of Size k

To efficiently find the top-k notifications from a stream of n total:

1. Maintain a **min-heap of size k** (keyed on score).
2. For each incoming notification:
   - If heap size < k → push directly.
   - Else if notification score > heap minimum → pop minimum, push new.
3. Result: heap contains the top-k highest-scored notifications.

**Complexity:**
- Time: **O(n log k)** — far better than O(n log n) sort for large n, small k
- Space: **O(k)** — only stores k items at a time

---

### Handling Continuous Stream

As new notifications arrive:
- Each insertion into the heap is **O(log k)** — constant overhead regardless of how many total notifications exist.
- The heap never grows beyond k, so memory stays bounded.
- No full re-sort is needed when a new notification comes in.

This makes the solution suitable for a **real-time notification feed** where n keeps growing.

---

### Architecture Overview

```
Notification API (GET /evaluation-service/notifications)
        │
        ▼
  fetchAllNotifications()
        │
        ▼
  scoreNotification()   ← typeWeight × 10¹² + timestamp
        │
        ▼
  MinHeap (size k)     ← O(log k) per insert
        │
        ▼
  getTopNPriorityNotifications()
        │
        ▼
  Priority Inbox Display
```

---

### Logging

Every function is wrapped with the **Logging Middleware** created in the pre-test setup stage. This provides:
- Function entry/exit traces
- Duration measurement
- Error capture with stack context
- Structured JSON metadata per log line

---

### Assumptions

- Notifications are fetched fresh from the API (no local DB).
- "Unread" state is not part of Stage 1 (no UI required).
- All notifications are treated as active; no expiry logic.
- The auth token is obtained once and reused for the session.
