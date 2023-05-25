---
'@equinor/fusion-framework-react-components-bookmark': patch
'@equinor/fusion-framework-react-module-bookmark': patch
---

fix(react-module-bookmark): module can be undefined

the bookmark module might not been enable, which makes the application crash.

__TODO:__
 - [ ] create a simpler hook for using bookmark
 - [ ] create a hook for exposing the module
 - [ ] create better documentation
