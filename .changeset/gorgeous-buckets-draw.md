---
'@equinor/fusion-framework-react-app': patch
---

create a hook which returns the current `ContextProvider`

example
```ts
import { useContextProvider } from '@equinor/fusion-framework-react-app/context';
const App = () => {
  const contextProvider = useContextProvider();
}
```
