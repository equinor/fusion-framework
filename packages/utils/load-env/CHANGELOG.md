# @equinor/fusion-load-env

## 1.0.3

### Patch Changes

- [#3479](https://github.com/equinor/fusion-framework/pull/3479) [`11b5a00`](https://github.com/equinor/fusion-framework/commit/11b5a00047171f9969cabbcbbb53dd188ed8421e) Thanks [@dependabot](https://github.com/apps/dependabot)! - Bump dotenv from 17.2.2 to 17.2.3 (TypeScript definition fix)

## 1.0.2

### Patch Changes

- [#2910](https://github.com/equinor/fusion-framework/pull/2910) [`07cc985`](https://github.com/equinor/fusion-framework/commit/07cc9857e1427b574e011cc319518e701dba784d) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updated vitest from 2.1.9 to 3.2.4 across all packages.

  ## Breaking Changes

  - **Node.js Requirements**: Requires Node.js 18+ (already satisfied)
  - **Vite Compatibility**: Updated to work with Vite 7.x (already using Vite 7.1.5)
  - **Snapshot Format**: Snapshots now use backtick quotes (\`) instead of single quotes
  - **Coverage API**: New coverage methods `enableCoverage()` and `disableCoverage()`
  - **TypeScript Support**: Enhanced TypeScript integration and type definitions

  ## Security Updates

  - CVE-2025-24963: Browser mode serves arbitrary files (fixed in 2.1.9)
  - CVE-2025-24964: Remote Code Execution vulnerability (fixed in 2.1.9)

  ## Migration Notes

  - Test snapshots may need regeneration due to quote format changes
  - Some test configurations might need updates for new TypeScript support
  - Peer dependency warnings for @vitest/coverage-v8 are expected and safe to ignore

  ## Links

  - [Vitest 3.0 Migration Guide](https://vitest.dev/guide/migration)
  - [Vitest 3.2.4 Release Notes](https://github.com/vitest-dev/vitest/releases/tag/v3.2.4)

## 1.0.1

### Patch Changes

- [#3332](https://github.com/equinor/fusion-framework/pull/3332) [`8c88574`](https://github.com/equinor/fusion-framework/commit/8c885745ee345cd7ef219b2cc469fd19c8687467) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore: bump dotenv from 16.6.1 to 17.2.2

## 1.0.0

### Major Changes

- [#3019](https://github.com/equinor/fusion-framework/pull/3019) [`6e1553b`](https://github.com/equinor/fusion-framework/commit/6e1553bee90ec9688cee8d7a39575df1b2535adc) Thanks [@odinr](https://github.com/odinr)! - Initial release of @equinor/fusion-load-env, a utility package for managing environment variables in Node.js applications.

  **Key features include:**

  - Converting JavaScript objects to environment variable strings and vice versa.
  - Loading environment variables from .env files with support for environment-specific files (e.g., `.env.dev`).
  - Customizable prefix for namespacing variables to avoid conflicts.
  - Support for camelCase key transformations in object parsing.
  - Safe processing of variables with a specified prefix.

  See README for more detailed information
