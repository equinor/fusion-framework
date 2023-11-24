---
'@equinor/fusion-framework-module-bookmark': patch
---

After creating a bookmark the bookmark module will no longer set it as current. This makes sense because the application is already in the correct state when the bookmark was created

see: #1547

https://github.com/equinor/fusion-framework/blob/main/packages/modules/navigation/src/module.ts#L13
