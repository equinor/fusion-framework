---
'@equinor/fusion-framework-legacy-interopt': patch
---

update loading of legacy applications

+ when an application load from CJS with `registerApp` the manifest is mutated and should update in legacy app container
+ add strict `undefined` check of manifest app component
+ add check if miss match of appKey, output warn and error if current app is not in scope
