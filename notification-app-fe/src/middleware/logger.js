/**
 * Frontend Logging Middleware
 * Structured leveled logger — replaces all console.log usage.
 * Must be used at every function entry point throughout the codebase.
 */

const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

let currentLevel = LOG_LEVELS.DEBUG;

function getTimestamp() {
  return new Date().toISOString();
}

function log(level, context, message, meta = null) {
  if (LOG_LEVELS[level] < currentLevel) return;
  const metaStr = meta ? JSON.stringify(meta) : "";
  const line = `[${getTimestamp()}] [${level}] [${context}] ${message}${metaStr ? " | " + metaStr : ""}`;
  if (level === "ERROR") {
    console.error(line);
  } else if (level === "WARN") {
    console.warn(line);
  } else {
    console.info(line);
  }
}

export const logger = {
  setLevel(level) {
    currentLevel = LOG_LEVELS[level] ?? 0;
  },
  debug(ctx, msg, meta) { log("DEBUG", ctx, msg, meta); },
  info(ctx, msg, meta)  { log("INFO",  ctx, msg, meta); },
  warn(ctx, msg, meta)  { log("WARN",  ctx, msg, meta); },
  error(ctx, msg, meta) { log("ERROR", ctx, msg, meta); },

  /**
   * Wrap an async function with automatic entry/exit/error logging.
   * @param {string} context - Module/function name for log prefix
   * @param {Function} fn - Async function to wrap
   */
  middleware(context, fn) {
    return async function (...args) {
      logger.info(context, "entered");
      const start = performance.now();
      try {
        const result = await fn.apply(this, args);
        logger.info(context, "completed", { ms: +(performance.now() - start).toFixed(2) });
        return result;
      } catch (err) {
        logger.error(context, "threw error", { error: err.message });
        throw err;
      }
    };
  },
};
