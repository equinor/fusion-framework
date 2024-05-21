# Fusion Log Utilities

This package provides a set of utilities for logging messages in a TypeScript/JavaScript application within the Fusion Framework. The primary purpose of this code is to provide a consistent and configurable logging mechanism that can be used throughout the application.

## Overview

The logging utilities in this package are designed to provide a flexible and extensible logging solution. The main components are:

- `Logger` (abstract class): Defines the base interface and functionality for logging messages with different severity levels (debug, info, warn, error).
- `ConsoleLogger`: A concrete implementation of the `Logger` class that logs messages to the console.
- `LogLevel` (enum): Defines the different log levels that can be used to control the verbosity of logging.
- `resolveLogLevel` (function): Resolves a log level from a string or number representation.

> [!WARNING]
> Ensure that `FUSION_LOG_LEVEL` is set in your package manager's environment variables before compiling the code for production.
> [Learn more about setting the log level as an environment variable](#setting-log-level-as-environment-variable)



## ConsoleLogger
The `ConsoleLogger` class is a concrete implementation of the `Logger` class. It logs messages to the console using the appropriate console methods (`console.debug`, `console.info`, `console.warn`, `console.error`). The `ConsoleLogger` class also supports creating sub-loggers with a new title and optional subtitle.

```typescript
import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';

// Create a new ConsoleLogger instance
const logger = new ConsoleLogger('MyApplication');

// Set the logging level
logger.level = LogLevel.Debug;

// Log messages at different severity levels
logger.debug('This is a debug message');
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');

// Create a sub-logger
const subLogger = logger.createSubLogger('SubComponent');
subLogger.debug('This is a debug message from the sub-logger');
```

## LogLevel

The `LogLevel` enum represents the different log levels that can be used to control the verbosity of logging. It includes the following levels:

0. **None** - No logging will be performed.
1. **Error** - Due to a more serious problem, the software has not been able to perform some function.
2. **Warning** - An indication that something unexpected happened, or indicative of some problem in the near future.
3. **Info** - Confirmation that things are working as expected.
4. **Debug** - Detailed information, typically of interest only when diagnosing problems.

#### Setting log level as Environment Variable

The logging level can be configured using the `FUSION_LOG_LEVEL` environment variable. If the environment variable is set, the resolveDefaultLogLevel function will attempt to parse the log level from it. If the parsing fails, it will default to LogLevel.Debug in development environments or LogLevel.Error in production environments.

```sh
# .env file
FUSION_LOG_LEVEL=4
# or
FUSION_LOG_LEVEL=debug
```

## Custom Loggers

Developers can define their own logger either by extending the `Logger` class or by implementing the `ILogger` interface. Below are examples of both approaches.

### Extending the `Logger` Class

> The `Logger` class is an abstract class that implements the `ILogger` interface.
> It provides basic functionality for creating messages with `chalk`.


To create a custom logger by extending the `Logger` class, you need to create a new class that inherits from `Logger` and override the necessary methods.

```typescript
import { Logger, LogLevel } from '@equinor/fusion-log';

class CustomLogger extends Logger {
    constructor(title: string) {
        super(title);
        // handle messages filtered by logLevel
        this.log.subscribe(({lvl,msg}) => {
          writeToMyDatabase(lvl, msg); 
        });
        // handle all messages
        this._log$.subscribe(({lvl,msg}) => {
          writeToMyDatabase(lvl, msg); // custom handling of messages
        });
    }

    // Override the log method to customize logging behavior
    protected _createMessage(...msg: unknown[]): unknown[] {
       return {
        title: this.title,
        timestamp: Date.Now(),
        message: msg.map(convertMessageToString).join('\n'),
       } // custom message
    }
}
```


### Implementing the `ILogger` Interface

> The `ILogger` interface defines the base interface and functionality for logging messages with different severity levels (debug, info, warn, error).

To create a custom logger by implementing the `ILogger` interface, you need to create a new class that implements all the methods defined in the `ILogger` interface.

### Resolving the log level

The `defaultLogLevel` will be resolved by default. If the `FUSION_LOG_LEVEL` environment variable is set, the resolveDefaultLogLevel function will attempt to parse the log level from it. If the parsing fails, it will default to `LogLevel.Debug` in development environments or `LogLevel.Error` in production environments.

```typescript
import { defaultLogLevel, type ILogger } from '@equinor/fusion-log';
class CustomLogger implements ILogger {
  logLevel: LogLevel = defaultLogLevel;
}
```

The `resolveLogLevel` function resolves a log level from a string or number representation. It handles both cases and throws an error if the provided value is not a valid log level.

```typescript
import { resolveLogLevel } from '@equinor/fusion-log';
logger.logLevel = resolveLogLevel(process.env.MY_LOG_LEVEL);
