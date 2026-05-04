# Bookmark

Save and restore application state snapshots using the Fusion bookmark module.

**Import:**

```ts
import { useCurrentBookmark, enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';
```

## Overview

Bookmarks let users save the current state of your app (filters, selections, active views) and restore it later. The `useCurrentBookmark` hook is the primary API for app developers — it reads the active bookmark and lets you provide a callback that captures your app's current state when a bookmark is created.

## Enable Bookmarks

Register the bookmark module in your app's configuration:

```ts
import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const configure = (configurator) => {
  enableBookmark(configurator);
};
```

## useCurrentBookmark

The recommended hook for working with bookmarks in your app. Returns the current bookmark (if any) and a setter, filtered to only show bookmarks belonging to your app.

**Signature:**

```ts
function useCurrentBookmark<TData extends BookmarkData>(
  payloadGenerator?: BookmarkPayloadGenerator<TData>,
): {
  currentBookmark: Bookmark<TData> | null;
  setCurrentBookmark: (bookmarkId: string) => void;
};
```

| Parameter          | Type                                | Description                                                    |
| ------------------ | ----------------------------------- | -------------------------------------------------------------- |
| `payloadGenerator` | `BookmarkPayloadGenerator<TData>` _(optional)_ | Callback that returns the current app state to store in the bookmark. **Must be wrapped in `useCallback`.** |

### Basic Usage

Provide a `payloadGenerator` wrapped in `useCallback` to capture your app state when a bookmark is created:

```tsx
import { useCallback, useState } from 'react';
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';

type MyBookmarkData = {
  selectedFilter: string;
  activeTab: number;
};

const MyApp = () => {
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState(0);

  const { currentBookmark } = useCurrentBookmark<MyBookmarkData>(
    useCallback(() => ({
      selectedFilter: filter,
      activeTab: tab,
    }), [filter, tab])
  );

  // Restore state from bookmark when it changes
  // currentBookmark is null when no bookmark is active or the bookmark belongs to a different app

  return (
    <div>
      <p>Active bookmark: {currentBookmark?.name ?? 'None'}</p>
    </div>
  );
};
```

## useBookmark (Deprecated)

> [!CAUTION]
> `useBookmark` is **deprecated**. Use `useCurrentBookmark` instead.

`useBookmark` provides the full bookmark CRUD API (create, update, delete, list). For app development, `useCurrentBookmark` is sufficient — it handles app-scoping automatically and has a simpler interface.

```ts
// ❌ Deprecated
import { useBookmark } from '@equinor/fusion-framework-react-app/bookmark';

// ✅ Use instead
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
```

If you need the full CRUD API, import directly from `@equinor/fusion-framework-react-module-bookmark`.

## Prerequisites

- The bookmark module must be enabled via `enableBookmark` in the app configurator
- `@equinor/fusion-framework-react-module-bookmark` must be installed as a peer dependency
