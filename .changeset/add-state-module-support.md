---
"@equinor/fusion-framework-app": minor
---

Add state management module support to @equinor/fusion-framework-app

This change introduces comprehensive state management capabilities to the app package, allowing developers to easily enable persistent state storage in their Fusion applications.

### New Features

- **State Module Enabler**: Added `enableState` function that configures the state module with PouchDB storage
- **Package Exports**: Added new export path `./enable-state` for the state enabler function
- **Type Definitions**: Added typesVersions support for the new state enabler
- **Peer Dependencies**: Added `@equinor/fusion-framework-module-state` as an optional peer dependency
- **Storage Configuration**: Automatic app-scoped storage with key prefixing to prevent state collisions

### Usage

Applications can now enable state management by:

```typescript
import { enableState } from '@equinor/fusion-framework-app/enable-state';

export const configure = (configurator) => {
  enableState(configurator);
};
```

The state module provides persistent storage with automatic app-key scoping and uses PouchDB for reliable data persistence across browser sessions.

**Note**: Applications must install `@equinor/fusion-framework-module-state` to use this functionality.
