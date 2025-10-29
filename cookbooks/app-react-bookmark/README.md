# Basic Bookmark Cookbook

This cookbook demonstrates how to use bookmarks with context-based persistence in your Fusion Framework application.

## What This Shows

This cookbook illustrates how to:
- Use the `useCurrentBookmark` hook to manage bookmarks
- Store and retrieve bookmark data with a custom payload
- Sync form state with bookmark state using refs and effects
- Persist bookmark data tied to the current context

## Key Concepts

Bookmarks allow users to save and restore state within a specific context (like a project or task). The cookbook demonstrates:
- Defining a bookmark payload type
- Using a callback to provide bookmark data
- Syncing local state with bookmark state
- The ref pattern for avoiding stale closures

## Code Example

### Define Your Bookmark Payload

```typescript
export interface MyPayload {
  title: string;
  data: string;
}
```

### Component with Bookmark

```typescript
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';
import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';

export const App = () => {
  const titleId = useId();
  const dataId = useId();
  
  // Local state for form inputs
  const [payload, setPayload] = useState({
    title: '',
    data: '',
  });

  // Use a ref to store the current payload for the bookmark callback
  // This avoids stale closures in the callback
  const updateData = useRef(payload);

  // Get the current bookmark with a callback to provide data
  const { currentBookmark } = useCurrentBookmark<MyPayload>(
    useCallback(() => updateData.current, [])
  );

  // When the bookmark changes, update local state
  useLayoutEffect(() => {
    setPayload({
      title: currentBookmark?.payload?.title ?? '',
      data: currentBookmark?.payload?.data ?? '',
    });
  }, [currentBookmark]);

  // Keep the ref in sync with local state
  useLayoutEffect(() => {
    updateData.current = payload;
  }, [payload]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: '1rem' }}>
      <form style={{ display: 'flex', gap: '1rem' }}>
        <label htmlFor={titleId}>Title</label>
        <input
          id={titleId}
          type="text"
          onChange={(e) => {
            setPayload((x) => ({
              ...x,
              title: e.target.value,
            }));
          }}
          value={payload.title}
        />
        <label htmlFor={dataId}>Bookmark data:</label>
        <input
          id={dataId}
          type="text"
          onChange={(e) => {
            setPayload((x) => ({
              ...x,
              data: e.target.value,
            }));
          }}
          value={payload.data}
        />
      </form>
      
      {/* Display the current bookmark */}
      <pre>{JSON.stringify(currentBookmark, null, 2)}</pre>
    </div>
  );
};
```

## Understanding the Pattern

### Ref Pattern for Callbacks

The ref pattern is used to avoid stale closures:

```typescript
const updateData = useRef(payload);
```

The callback passed to `useCurrentBookmark` reads from this ref:

```typescript
useCurrentBookmark<MyPayload>(
  useCallback(() => updateData.current, [])
);
```

This ensures the callback always returns the latest payload value, even though the callback reference never changes (empty dependency array).

### Syncing State

Two `useLayoutEffect` hooks keep everything in sync:

1. **Bookmark → State**: When bookmark changes, update local state
2. **State → Ref**: When state changes, update the ref

This creates a cycle where user input updates state, state updates the ref, and the ref provides data to the bookmark.

### useLayoutEffect vs useEffect

Using `useLayoutEffect` ensures the synchronization happens synchronously after DOM updates but before the browser paints. This prevents visual flicker when updating form inputs from bookmark data.

### Configuration

The bookmark module requires context configuration:

```typescript
import { enableContext } from '@equinor/fusion-framework-module-context';
import { enableBookmark } from '@equinor/fusion-framework-react-app/bookmark';

export const configure: AppModuleInitiator = (configurator) => {
  enableContext(configurator, async (builder) => {
    builder.setContextType(['projectMaster']); // Define what context types to match
  });
  enableBookmark(configurator);
};
```

## When to Use Bookmarks

Use bookmarks when:
- You want to save user's form state or preferences
- Users should be able to return to a specific state
- State should be tied to a specific context (project, task, etc.)
- You want automatic persistence across page reloads

Bookmarks automatically save when you provide data through the callback and restore when the component mounts.