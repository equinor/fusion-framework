---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Install the feature-flag and telemetry framework modules with the React app Vitest plugin so applications do not need to declare them separately to run tests. Feature flags remain app-scoped and are enabled automatically only when the application's own configuration registers them.
