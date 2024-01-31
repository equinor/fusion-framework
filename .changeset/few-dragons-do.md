---
"@equinor/fusion-framework-module-app": patch
---

improve type of current application

- result will be `undefined` if current application has never been set
- result will be `IApplication` if current application is set
- result will be `null` if current application is cleared
