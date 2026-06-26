/**
 * Stage 1: Priority Inbox — Campus Notifications Microservice
 * 
 * Fetches notifications from the evaluation API and returns
 * the top-N by priority (Placement > Result > Event) + recency.
 * Uses a Max-Heap for efficient O(n log k) selection.
 */

const logger = require("./logging-middleware/logger");

// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = "http://4.224.186.213/evaluation-service";
const TOP_N = 10;

// Priority weights (higher = more important)
const PRIORITY_WEIGHT = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ─── Auth ───────────────────────────────────────────────────────────────────
/**
 * Obtain a Bearer token using stored credentials.
 * Replace the values below with your actual clientID / clientSecret.
 */
const getAuthToken = logger.middleware("getAuthToken", async () => {
  const credentials = {
    email: process.env.EVAL_EMAIL || "your@email.com",
    name: process.env.EVAL_NAME || "Your Name",
    rollNo: process.env.EVAL_ROLL || "your-roll-no",
    accessCode: process.env.EVAL_ACCESS_CODE || "your-access-code",
    clientID: process.env.EVAL_CLIENT_ID || "your-client-id",
    clientSecret: process.env.EVAL_CLIENT_SECRET || "your-client-secret",
  };

  logger.info("getAuthToken", "Requesting auth token", { email: credentials.email });

  const res = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error(`Auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  logger.info("getAuthToken", "Token obtained successfully");
  return data.access_token;
});

// ─── Fetch Notifications ────────────────────────────────────────────────────
const fetchAllNotifications = logger.middleware("fetchAllNotifications", async (token) => {
  logger.info("fetchAllNotifications", "Fetching notifications from API");

  const res = await fetch(`${API_BASE}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Fetch notifications failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  logger.info("fetchAllNotifications", "Notifications fetched", {
    count: data.notifications?.length ?? 0,
  });
  return data.notifications ?? [];
});

// ─── Scoring ────────────────────────────────────────────────────────────────
/**
 * Compute a composite score for a notification.
 * Score = typeWeight * 1e12 + unixTimestampMs
 * This ensures type-priority always beats recency across types,
 * while within the same type, newer notifications rank higher.
 */
function scoreNotification(notification) {
  const weight = PRIORITY_WEIGHT[notification.Type] ?? 0;
  const timestampMs = new Date(notification.Timestamp).getTime();
  return weight * 1e12 + timestampMs;
}

// ─── Max-Heap ───────────────────────────────────────────────────────────────
/**
 * MinHeap of size k — keeps the top-k highest scored items.
 * Insertion: O(log k), final extraction: O(k log k)
 * Overall: O(n log k) for n notifications, far better than O(n log n) sort.
 */
class MinHeap {
  constructor() {
    this.heap = [];
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.heap[0];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l].score < this.heap[smallest].score) smallest = l;
      if (r < n && this.heap[r].score < this.heap[smallest].score) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }

  toSortedArray() {
    const result = [];
    const copy = new MinHeap();
    copy.heap = [...this.heap];
    while (copy.size() > 0) result.push(copy.pop());
    return result.reverse(); // highest score first
  }
}

// ─── Main: Get Top-N Priority Notifications ─────────────────────────────────
/**
 * Returns the top-n notifications by (type priority, recency).
 * Efficiently maintains a min-heap of size n while scanning all notifications.
 * When a new notification comes in, it is inserted in O(log n) time.
 */
const getTopNPriorityNotifications = logger.middleware(
  "getTopNPriorityNotifications",
  async (notifications, n = TOP_N) => {
    logger.info("getTopNPriorityNotifications", `Selecting top ${n} from ${notifications.length} notifications`);

    const heap = new MinHeap();

    for (const notif of notifications) {
      const score = scoreNotification(notif);
      const entry = { score, notification: notif };

      if (heap.size() < n) {
        heap.push(entry);
      } else if (score > heap.peek().score) {
        heap.pop();
        heap.push(entry);
      }
    }

    const topN = heap.toSortedArray().map((e) => e.notification);
    logger.info("getTopNPriorityNotifications", `Top ${n} selected`, {
      types: topN.map((n) => n.Type),
    });
    return topN;
  }
);

// ─── Entry Point ─────────────────────────────────────────────────────────────
const main = logger.middleware("main", async () => {
  logger.info("main", `Starting Priority Inbox (top ${TOP_N})`);

  const token = await getAuthToken();
  const notifications = await fetchAllNotifications(token);
  const topN = await getTopNPriorityNotifications(notifications, TOP_N);

  logger.info("main", `=== TOP ${TOP_N} PRIORITY NOTIFICATIONS ===`);
  topN.forEach((n, i) => {
    logger.info("main", `#${i + 1}`, {
      Type: n.Type,
      Message: n.Message,
      Timestamp: n.Timestamp,
      ID: n.ID,
    });
  });

  console.log("\n📋 Priority Inbox Result:");
  console.table(
    topN.map((n, i) => ({
      Rank: i + 1,
      Type: n.Type,
      Message: n.Message,
      Timestamp: n.Timestamp,
    }))
  );

  return topN;
});

main().catch((err) => {
  logger.error("main", "Unhandled error", { error: err.message });
  process.exit(1);
});
