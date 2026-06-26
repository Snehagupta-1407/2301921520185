/**
 * Logging Middleware
 * Campus Evaluation - Affordmed
 * 
 * A structured, leveled logger for use throughout the codebase.
 * Must be integrated at every function entry point.
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const LEVEL_LABELS = {
  0: "DEBUG",
  1: "INFO",
  2: "WARN",
  3: "ERROR",
};

const LEVEL_COLORS = {
  DEBUG: "\x1b[36m",   // cyan
  INFO:  "\x1b[32m",   // green
  WARN:  "\x1b[33m",   // yellow
  ERROR: "\x1b[31m",   // red
  RESET: "\x1b[0m",
};

let currentLevel = LOG_LEVELS.DEBUG;

/**
 * Format a timestamp as ISO string
 */
function getTimestamp() {
  return new Date().toISOString();
}

/**
 * Core log function
 * @param {number} level - Log level
 * @param {string} context - Module/function name
 * @param {string} message - Log message
 * @param {object} [meta] - Optional metadata
 */
function log(level, context, message, meta = null) {
  if (level < currentLevel) return;

  const label = LEVEL_LABELS[level];
  const color = LEVEL_COLORS[label] || "";
  const reset = LEVEL_COLORS.RESET;
  const timestamp = getTimestamp();

  const metaStr = meta ? ` | ${JSON.stringify(meta)}` : "";
  const line = `${color}[${timestamp}] [${label}] [${context}] ${message}${metaStr}${reset}`;

  if (level === LOG_LEVELS.ERROR) {
    process.stderr.write(line + "\n");
  } else {
    process.stdout.write(line + "\n");
  }
}

const logger = {
  setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
      currentLevel = LOG_LEVELS[level];
    }
  },

  debug(context, message, meta) {
    log(LOG_LEVELS.DEBUG, context, message, meta);
  },

  info(context, message, meta) {
    log(LOG_LEVELS.INFO, context, message, meta);
  },

  warn(context, message, meta) {
    log(LOG_LEVELS.WARN, context, message, meta);
  },

  error(context, message, meta) {
    log(LOG_LEVELS.ERROR, context, message, meta);
  },

  /**
   * Wrap an async function with entry/exit/error logging
   * @param {string} context - Function name / module
   * @param {Function} fn - Async function to wrap
   */
  middleware(context, fn) {
    return async function (...args) {
      logger.info(context, "Function entered", { args: args.length });
      const start = Date.now();
      try {
        const result = await fn.apply(this, args);
        const duration = Date.now() - start;
        logger.info(context, "Function completed", { durationMs: duration });
        return result;
      } catch (err) {
        const duration = Date.now() - start;
        logger.error(context, "Function threw error", {
          error: err.message,
          durationMs: duration,
        });
        throw err;
      }
    };
  },
};

module.exports = logger;
