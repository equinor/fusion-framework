---
'@equinor/fusion-framework-docs': patch
---

Upgrade VuePress and related dependencies:
- @vuepress/bundler-vite: 2.0.0-rc.24 → 2.0.0-rc.26
- @vuepress/cli: 2.0.0-rc.24 → 2.0.0-rc.26
- @vuepress/client: 2.0.0-rc.24 → 2.0.0-rc.26
- @vuepress/plugin-register-components: 2.0.0-rc.112 → 2.0.0-rc.118
- @vuepress/utils: 2.0.0-rc.24 → 2.0.0-rc.26
- vuepress: 2.0.0-rc.24 → 2.0.0-rc.26
- vuepress-theme-hope: 2.0.0-rc.94 → 2.0.0-rc.98
- vue: 3.5.21 → 3.5.25

Add serve script with configurable base path for local testing of production builds.

Fix incorrect AppLoader.tsx path in documentation (@packages/cli/src/bin/dev-portal/AppLoader.tsx → @packages/dev-portal/src/AppLoader.tsx).
