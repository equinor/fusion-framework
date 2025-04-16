---
"@equinor/fusion-framework-dev-portal": major
---

This release introduces a new package, `@equinor/fusion-framework-dev-portal`, as part of a refactor of the `@equinor/fusion-framework-cli`.
The refactor moves specific functionality and code related to the development portal into its own dedicated package to improve modularity and maintainability.

Additionally, this update includes improved documentation and examples for better user guidance.

This package is a small part of the refactoring of the `@equinor/fusion-framework-cli` and is not intended for direct use in production.
The main purpose of this package is to provide a development portal for the Fusion framework, allowing developers to easily set up and test their applications in a local environment.

Event though this package can be used as standalone, it is recommended to use the `@equinor/fusion-framework-dev-server` package for a more complete development experience.
