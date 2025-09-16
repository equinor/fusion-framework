---
"@equinor/fusion-framework-cli": patch
"@equinor/fusion-framework-dev-server": patch
"@equinor/fusion-framework-module-http": patch
"@equinor/fusion-framework-module-services": patch
"@equinor/fusion-observable": patch
"@equinor/fusion-query": patch
"@equinor/fusion-imports": patch
"@equinor/fusion-load-env": patch
"@equinor/fusion-log": patch
"@equinor/fusion-framework-vite-plugin-api-service": patch
"@equinor/fusion-framework-vite-plugin-spa": patch
---

Updated vitest from 2.1.9 to 3.2.4 across all packages.

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
