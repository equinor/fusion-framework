---
"@equinor/fusion-framework-dev-portal": major
---

This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

**Features**

- Development portal for the Fusion framework
- Support for MSAL authentication
- Integration with service discovery
- Environment variable configuration

This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and while it can be used standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.

**Read More**

For more detailed information, usage examples, and advanced configuration, please refer to the [GitHub README](https://github.com/equinor/fusion-framework/tree/main/packages/dev-portal/README.md) for this package.
