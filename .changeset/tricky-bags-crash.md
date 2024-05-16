---
"@equinor/fusion-log": minor
---

Added a new script `test:coverage` to the package.json file. This script runs the test suite with code coverage reporting enabled, allowing developers to analyze the test coverage of the codebase.

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
