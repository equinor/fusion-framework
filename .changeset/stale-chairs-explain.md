---
'@equinor/fusion-framework-react': minor
'@equinor/fusion-framework-module-app': minor
---

Create and expose interface for App

* deprecate [AppModuleProvider.createApp](https://github.com/equinor/fusion-framework/blob/cf08d5ae3cef473e5025fd973a2a7a45a3b22dee/packages/modules/app/src/AppModuleProvider.ts#L171)

this should not create any breaking changes since apps was only created from provider.
if the class is still needed it can be imported:
```ts
import { App } from '@equinor/fusion-framework-module-app/app'
```