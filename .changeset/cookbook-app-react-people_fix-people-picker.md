---
"@equinor/fusion-framework-cookbook-app-react-people": patch
---

Refresh the people cookbook to use the latest `@equinor/fusion-react-person` package and keep the `PeoplePicker` preload example stable.

- Update the cookbook dependency to `@equinor/fusion-react-person` 2.0.15.
- Keep the sample `resolveIds` list stable so the initial people are resolved consistently on mount.