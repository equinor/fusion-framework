---
title: Bookmark
category: Guide
tags:
    - how to
    - basic
    - app
    - bookmark
---

### React App development

<ModuleBadge module="react-module-bookmark" />

To enable bookmark for an application there are 2 tinges needed. Fist the `enableBookmark` will need to be configured as shown below, and then a function to capture the applications state is needed.

```ts
import { enableContext } from '@equinor/fusion-framework-react-module-bookmark';

export const configure = (configurator) => {
    // Some Application configuration
    enableBookmark(configurator);
    // more configuration...
};
```

The `currentBookmark` will be updated when ever the bookmark changes, and all navigation will be handled by parent application / portal.

```ts
import { useCurrentBookmark } from '@equinor/fusion-framework-react-bookmark';

const currentBookmark = useCurrentBookmark(
    useCallback(() => someApplicationState, [someApplicationState])
);
```
