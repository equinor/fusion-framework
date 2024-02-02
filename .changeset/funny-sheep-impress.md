---
"@equinor/fusion-framework-react-app": patch
---

Added functionality for enabling feature flagging

```ts
import { enableFeatureFlag } from `@equinor/fusion-framework-react-app/feature-flag`
enableFeatureFlag(confgurator, [{
  id: 'my-flag',
  title: 'My flag'
}])
```

the user still needs to install `@equinor/fusion-framework-module-feature-flag`
