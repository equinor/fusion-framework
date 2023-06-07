---
'@equinor/fusion-framework-module-app': minor
---

Allow updating manifest of application

+ add meta data for `setManifest` action to flag if `merge` or `replace`
+ add method on `App` to update manifest, _default flag `merge`_
+ check in state reducer if `setManifest` action is `update` or `merge`  
+ update flow `handleFetchManifest` to prop passing of flag