---
title: Bookmark
category: Guide
tags:
    - how to
    - basic
    - app
    - bookmark
---

### React App Bookmark implementation

<ModuleBadge module="react-module-app" />

To enable bookmark for an application there are only one tinges needed. If the bookmark is enabled on in your portal. A function to capture the applications state is needed. The `currentBookmark` will be updated when ever the bookmark changes, and all navigation will be handled by parent application / portal.

```ts
import { useCurrentBookmark } from '@equinor/fusion-framework-react-app/bookmark';

const currentBookmark = useCurrentBookmark(
    useCallback(() => someApplicationState, [someApplicationState])
);
```
