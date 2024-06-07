---
'@equinor/fusion-framework-module-widget': patch
'@equinor/fusion-framework-module-app': patch
---

#2235 renamed a method and changed type. This PR forgot to change to the correct param when using this method. Fixes typo - update to use actions `type` in the reducer.
