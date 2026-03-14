# @equinor/fusion-log

Structured, level-filtered logging utilities for Fusion Framework applications.

`@equinor/fusion-log` gives you a thin, RxJS-backed logging abstraction with a ready-made console implementation and helpers for resolving log levels from environment variables. Use it whenever you need consistent, configurable log output across modules.

## Key Exports

| Export             | Kind              | Purpose                                                                    |
|--------------------|-------------------|----------------------------------------------------------------------------|
| `ConsoleLogger`    | Class             | Colour-coded console logger with title prefixes and sub-logger support.    |
| `Logger`           | Abstract class    | Base class to extend when building custom log destinations.                |
| `ILogger`          | Interface         | Contract satisfied by every logger — use for dependency injection.         |
| `LogLevel`         | Enum              | Severity constants (`None`, `Error`, `Warning`, `Info`, `Debug`).          |
| `defaultLogLevel`  | Constant          | The level resolved at startup from `FUSION_LOG_LEVEL`.                     |
| `resolveLogLevel`  | Function          | Parse a string or number into a type-safe `LogLevel`.                      |

## Quick Start

```typescript
import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';

const logger = new ConsoleLogger('MyApp');
logger.level = LogLevel.Debug;

logger.debug('bootstrapping modules…');
logger.info('application ready');
logger.warn('deprecated API called');
logger.error('failed to fetch config', err);
```

## Log Levels

Higher numeric values are more verbose. Setting `logger.level` to a given level enables that level **and all levels below it**.

| Level     | Value | When to use                                            |
|-----------|-------|--------------------------------------------------------|
| `None`    | 0     | Disable all logging.                                   |
| `Error`   | 1     | An operation failed and the caller should be aware.    |
| `Warning` | 2     | Something unexpected that may need investigation.      |
| `Info`    | 3     | Routine confirmation (e.g. "module initialised").      |
| `Debug`   | 4     | Verbose diagnostics for development only.              |

### Configure via Environment Variable

Set `FUSION_LOG_LEVEL` **before** your bundler compiles the code so the default level is inlined at build time.

```sh
# .env
FUSION_LOG_LEVEL=4        # numeric
# or
FUSION_LOG_LEVEL=debug    # case-insensitive name
```

> [!WARNING]
> Ensure that `FUSION_LOG_LEVEL` is set in your package manager's environment variables before compiling the code for production.

Resolution rules (applied once at module load):

1. If `FUSION_LOG_LEVEL` is set and parsable → use the parsed value.
2. If parsing fails and `NODE_ENV === 'development'` → fall back to `Debug`.
3. Otherwise → fall back to `Error`.
4. If the variable is not set → default to `Error`.

You can also resolve a level at runtime with `resolveLogLevel`:

```typescript
import { resolveLogLevel } from '@equinor/fusion-log';

const level = resolveLogLevel(process.env.MY_LOG_LEVEL ?? 'error');
logger.level = level;
```

## Sub-Loggers

Create child loggers to add component-level context. The child's title is prefixed with the parent's title, and the log level is inherited unless overridden.

```typescript
const router = logger.createSubLogger('Router');
router.debug('navigated to /dashboard');
// console output: "MyApp::Router  navigated to /dashboard"

const auth = logger.createSubLogger('Auth', undefined, LogLevel.Error);
auth.info('token refreshed'); // suppressed — level is Error
```

## Custom Loggers

### Extending `Logger`

Subclass `Logger` to route log entries to any destination while reusing level filtering and the RxJS observable pipeline.

```typescript
import { Logger, LogLevel, type ILogger } from '@equinor/fusion-log';

class RemoteLogger extends Logger {
  constructor(private readonly endpoint: string) {
    super();
    // subscribe to the filtered stream
    this.log.subscribe(({ lvl, msg }) => {
      fetch(this.endpoint, {
        method: 'POST',
        body: JSON.stringify({ level: lvl, messages: msg }),
      });
    });
  }

  protected _createMessage(_lvl: LogLevel, ...msg: unknown[]): unknown[] {
    return msg;
  }

  createSubLogger(title: string): ILogger {
    const sub = new RemoteLogger(this.endpoint);
    sub.level = this.level;
    return sub;
  }
}
```

### Implementing `ILogger`

If you don't need the RxJS pipeline, implement `ILogger` directly:

```typescript
import { type ILogger, LogLevel, defaultLogLevel } from '@equinor/fusion-log';

class NoopLogger implements ILogger {
  level: LogLevel = defaultLogLevel;
  debug() {}
  info() {}
  warn() {}
  error() {}
  createSubLogger(): ILogger {
    return new NoopLogger();
  }
}
```
