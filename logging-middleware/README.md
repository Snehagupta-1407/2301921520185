# Logging Middleware

A structured, leveled logging utility for use throughout the codebase.

## Usage

```js
const logger = require('./logging-middleware/logger');

// Direct logging
logger.info('ModuleName', 'Something happened', { key: 'value' });
logger.warn('ModuleName', 'Something might be wrong');
logger.error('ModuleName', 'Something broke', { error: err.message });

// Wrap a function with automatic entry/exit/error logging
const myFn = logger.middleware('myFn', async (x) => {
  // your logic
  return x * 2;
});
```

## Log Levels
- DEBUG — verbose trace info
- INFO  — normal operation
- WARN  — something unexpected but recoverable
- ERROR — failure, written to stderr

## Format
`[ISO_TIMESTAMP] [LEVEL] [CONTEXT] Message | {meta}`
