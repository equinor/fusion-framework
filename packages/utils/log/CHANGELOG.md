# @equinor/fusion-log

## 1.0.0

### Major Changes

-   [#2155](https://github.com/equinor/fusion-framework/pull/2155) [`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a) Thanks [@odinr](https://github.com/odinr)! - The `Logger` module is a new package for handling logging in the Fusion frontend ecosystem.

    -   The `Logger` class extends the `ILogger` interface, ensuring that all logger implementations adhere to a consistent contract.
    -   The `ConsoleLogger` class is a concrete implementation of the `Logger` class that logs messages to the console.
    -   The `_createMessage` method in the `Logger` class has been made abstract, allowing concrete implementations to define their own message formatting logic.
    -   Added a `version` property to the `Logger` class, which exposes the current version of the logger module.
    -   Introduced a `resolveLogLevel` utility function that can resolve log levels from both string and numeric representations.
    -   Added support for resolving the default log level from the `FUSION_LOG_LEVEL` environment variable. If the environment variable is not set, it defaults to `LogLevel.Error`.

    To use the new `Logger` module, import the necessary components and create a new logger instance:

    ```typescript
    import { ConsoleLogger, LogLevel } from '@equinor/fusion-log';

    // Create a new console logger
    const logger = new ConsoleLogger('MyApplication');

    // Set the log level
    logger.level = LogLevel.Debug;

    // Log messages at different levels
    logger.debug('This is a debug message');
    logger.info('This is an info message');
    logger.warn('This is a warning message');
    logger.error('This is an error message');

    // Create a sub-logger
    const subLogger = logger.createSubLogger('SubComponent');
    subLogger.debug('This is a debug message from the sub-logger');
    ```

    To resolve a log level from a string or numeric value, use the resolveLogLevel function:

    ```typescript
    import { resolveLogLevel, LogLevel } from '@equinor/fusion-log';

    // Resolve log level from a string
    const logLevelFromString = resolveLogLevel('debug'); // LogLevel.Debug

    // Resolve log level from a number
    const logLevelFromNumber = resolveLogLevel(3); // LogLevel.Info
    ```

    The default log level can be controlled using the `FUSION_LOG_LEVEL` environment variable. If the variable is set to an invalid value, it will default to `LogLevel.Debug` in development environments and `LogLevel.Error` in production environments.

    ```sh
    # Set the default log level to Debug
    FUSION_LOG_LEVEL=debug

    # Set the default log level to Warning
    FUSION_LOG_LEVEL=warning
    ```

### Minor Changes

-   [#2155](https://github.com/equinor/fusion-framework/pull/2155) [`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a) Thanks [@odinr](https://github.com/odinr)! - Added a new script `test:coverage` to the package.json file. This script runs the test suite with code coverage reporting enabled, allowing developers to analyze the test coverage of the codebase.

    Example usage:

    ```bash
    pnpm test
    pnpm test:coverage
    ```

    This will run the test suite using Vitest and generate a code coverage report.

    Added a new test suite for the ConsoleLogger class. The test suite covers various scenarios, including:

    -   Logging messages at different log levels (debug, info, warning, error)
    -   Logging multiple messages in a single call
    -   Logging messages with a custom title
    -   Ensuring that messages with a lower log level than the configured level are not logged
    -   Testing sub-loggers and their behavior, including custom sub-titles

    Added a new configuration file vitest.config.ts for Vitest, the test runner used in this package. This file sets up the project-specific configuration for Vitest, such as the test file pattern and environment variables.
