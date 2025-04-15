# @equinor/fusion-log

## 1.1.3

### Patch Changes

- [#2972](https://github.com/equinor/fusion-framework/pull/2972) [`08a4ebb`](https://github.com/equinor/fusion-framework/commit/08a4ebb74b9ce9da8c7a4b4dabe3cd476c67a86e) Thanks [@odinr](https://github.com/odinr)! - update imports to use module syntax and add type field in package.json

## 1.1.2

### Patch Changes

- [#2885](https://github.com/equinor/fusion-framework/pull/2885) [`abb3560`](https://github.com/equinor/fusion-framework/commit/abb3560a22ad8830df19904272035458433f4237) Thanks [@dependabot](https://github.com/apps/dependabot)! - Update he `Typescript` version `^5.7.3` to `^5.8.2`

## 1.1.1

### Patch Changes

- [#2848](https://github.com/equinor/fusion-framework/pull/2848) [`dcd2fb1`](https://github.com/equinor/fusion-framework/commit/dcd2fb1394e175d0cc2a4289ed3ede8e0271d67d) Thanks [@odinr](https://github.com/odinr)! - Refactored imports to use `type` when importing types from a module, to conform with the `useImportType` rule in Biome.

## 1.1.0

### Minor Changes

- [#2408](https://github.com/equinor/fusion-framework/pull/2408) [`3238800`](https://github.com/equinor/fusion-framework/commit/32388003d9b9a61ed70f7125358d03889dbf8ca0) Thanks [@odinr](https://github.com/odinr)! - Removed formatting of messages in the `log` function. Now the messages are printed as they are, without any additional formatting. This is done to make the messages more readable and to avoid any additional formatting that might be added by the user. Formatting objects would result in the console outputting `[[object,object]]` which was not very helpful.

## 1.0.2

### Patch Changes

- [#2358](https://github.com/equinor/fusion-framework/pull/2358) [`decb9e9`](https://github.com/equinor/fusion-framework/commit/decb9e9e3d1bb1b0577b729a1e7ae812afdd83cb) Thanks [@eikeland](https://github.com/eikeland)! - Updating vitest to 2.0.4. Setting vitest as devDependency in fusion-query. Updating vite to 5.3.4

## 1.0.1

### Patch Changes

- [#2333](https://github.com/equinor/fusion-framework/pull/2333) [`86d55b8`](https://github.com/equinor/fusion-framework/commit/86d55b8d27a572f3f62170b1e72aceda54f955e1) Thanks [@odinr](https://github.com/odinr)! - Updated `TypeScript` to 5.5.3

- [#2320](https://github.com/equinor/fusion-framework/pull/2320) [`1dd85f3`](https://github.com/equinor/fusion-framework/commit/1dd85f3a408a73df556d1812a5f280945cc100ee) Thanks [@odinr](https://github.com/odinr)! - Removed the `removeComments` option from the `tsconfig.base.json` file.

  Removing the `removeComments` option allows TypeScript to preserve comments in the compiled JavaScript output. This can be beneficial for several reasons:

  1. Improved debugging: Preserved comments can help developers understand the code better during debugging sessions.
  2. Documentation: JSDoc comments and other important code documentation will be retained in the compiled output.
  3. Source map accuracy: Keeping comments can lead to more accurate source maps, which is crucial for debugging and error tracking.

  No action is required from consumers of the library. This change affects the build process and doesn't introduce any breaking changes or new features.

  Before:

  ```json
  {
    "compilerOptions": {
      "module": "ES2022",
      "target": "ES6",
      "incremental": true,
      "removeComments": true,
      "preserveConstEnums": true,
      "sourceMap": true,
      "moduleResolution": "node"
    }
  }
  ```

  After:

  ```json
  {
    "compilerOptions": {
      "module": "ES2022",
      "target": "ES6",
      "incremental": true,
      "preserveConstEnums": true,
      "sourceMap": true,
      "moduleResolution": "node"
    }
  }
  ```

  This change ensures that comments are preserved in the compiled output, potentially improving the development and debugging experience for users of the Fusion Framework.

## 1.0.0

### Major Changes

- [#2155](https://github.com/equinor/fusion-framework/pull/2155) [`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a) Thanks [@odinr](https://github.com/odinr)! - The `Logger` module is a new package for handling logging in the Fusion frontend ecosystem.

  - The `Logger` class extends the `ILogger` interface, ensuring that all logger implementations adhere to a consistent contract.
  - The `ConsoleLogger` class is a concrete implementation of the `Logger` class that logs messages to the console.
  - The `_createMessage` method in the `Logger` class has been made abstract, allowing concrete implementations to define their own message formatting logic.
  - Added a `version` property to the `Logger` class, which exposes the current version of the logger module.
  - Introduced a `resolveLogLevel` utility function that can resolve log levels from both string and numeric representations.
  - Added support for resolving the default log level from the `FUSION_LOG_LEVEL` environment variable. If the environment variable is not set, it defaults to `LogLevel.Error`.

  To use the new `Logger` module, import the necessary components and create a new logger instance:

  ```typescript
  import { ConsoleLogger, LogLevel } from "@equinor/fusion-log";

  // Create a new console logger
  const logger = new ConsoleLogger("MyApplication");

  // Set the log level
  logger.level = LogLevel.Debug;

  // Log messages at different levels
  logger.debug("This is a debug message");
  logger.info("This is an info message");
  logger.warn("This is a warning message");
  logger.error("This is an error message");

  // Create a sub-logger
  const subLogger = logger.createSubLogger("SubComponent");
  subLogger.debug("This is a debug message from the sub-logger");
  ```

  To resolve a log level from a string or numeric value, use the resolveLogLevel function:

  ```typescript
  import { resolveLogLevel, LogLevel } from "@equinor/fusion-log";

  // Resolve log level from a string
  const logLevelFromString = resolveLogLevel("debug"); // LogLevel.Debug

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

- [#2155](https://github.com/equinor/fusion-framework/pull/2155) [`97a79fb`](https://github.com/equinor/fusion-framework/commit/97a79fbec701edff276632f2219672b8eb4eb85a) Thanks [@odinr](https://github.com/odinr)! - Added a new script `test:coverage` to the package.json file. This script runs the test suite with code coverage reporting enabled, allowing developers to analyze the test coverage of the codebase.

  Example usage:

  ```bash
  pnpm test
  pnpm test:coverage
  ```

  This will run the test suite using Vitest and generate a code coverage report.

  Added a new test suite for the ConsoleLogger class. The test suite covers various scenarios, including:

  - Logging messages at different log levels (debug, info, warning, error)
  - Logging multiple messages in a single call
  - Logging messages with a custom title
  - Ensuring that messages with a lower log level than the configured level are not logged
  - Testing sub-loggers and their behavior, including custom sub-titles

  Added a new configuration file vitest.config.ts for Vitest, the test runner used in this package. This file sets up the project-specific configuration for Vitest, such as the test file pattern and environment variables.
