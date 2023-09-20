---
'@equinor/fusion-framework-react-components-people-provider': patch
---

Allow providing fallback image

when defining a `PeopleResolverProvider`, one might want to provide a blob for fallback when a person photo is not found.

> this will increase the general resolve time, since repeating request for resolving a person photo will not execute a new query until cache expires

```tsx
import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';
import fallbackSvg from './resources/fallback-photo.svg';

const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

const App = () => (
  <PeopleResolverProvider options={{fallbackImage}}>
    ...children
  </PeopleResolverProvider>
);
```