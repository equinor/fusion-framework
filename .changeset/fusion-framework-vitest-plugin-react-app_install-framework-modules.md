---
"@equinor/fusion-framework-vitest-plugin-react-app": patch
---

Install the feature-flag and telemetry framework modules with the React app Vitest plugin so applications do not need to declare them separately to run tests. The plugin automatically enables the parent feature-flag mock only when the application declares the feature-flag module as a runtime dependency.
