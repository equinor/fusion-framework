---
"@equinor/fusion-framework-dev-portal": minor
---

Add comprehensive telemetry integration to the Fusion Dev Portal.

**New Features:**
- Enable telemetry tracking for portal usage analytics and monitoring
- Configure portal-specific metadata including version and name identification
- Set up telemetry event scoping for portal-specific tracking
- Attach framework configurator events for comprehensive telemetry coverage

**Technical Implementation:**
- Integrate `@equinor/fusion-framework-module-telemetry` module
- Configure telemetry with portal metadata (`type: 'portal-telemetry'`)
- Set default scope to `['portal']` for event categorization
- Establish parent-child telemetry relationship for consistent tracking
- Add TypeScript path references for telemetry module

**Configuration Updates:**
- Enhanced `config.ts` with detailed telemetry setup and documentation
- Updated dependency versions to use `workspace:*` for better monorepo compatibility
- Improved code documentation and developer experience features

resolves: [#3485](https://github.com/equinor/fusion-framework/issues/3485)