---
"@equinor/fusion-framework-cli": patch
---

Fixed issue where app routing was not properly handled in the development server configuration. Some request where given with `/` instead of `@`, so now we support both formats.

example `/apps/bundles/apps/my-app/6.7.8/src/index.ts?import` was expected to be `/apps/bundles/apps/my-app@6.7.8/src/index.ts?import`.

Should fix https://github.com/equinor/fusion/issues/640

