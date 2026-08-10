# Enable Bookmarks

The bookmark module allows applications to save and restore application state.

> **Important:** Import `enableBookmark` from the app-level package, not from
> `@equinor/fusion-framework-module-bookmark` directly.

```ts
import { configureModules } from '@equinor/fusion-framework-app';
import { enableBookmark } from '@equinor/fusion-framework-app/enable-bookmark';

const initialize = configureModules((configurator) => {
  enableBookmark(configurator);
});
```

Payload generators registered through the bookmark module are automatically
cleaned up when the module is disposed.
