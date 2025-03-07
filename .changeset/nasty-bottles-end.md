---
"@equinor/fusion-observable": patch
---

Added comprehensive unit tests for the `createReducer` function to ensure its correct functionality. The tests cover the following scenarios:

- Creating a reducer function.
- Creating a reducer with a default value from a function.
- Handling actions and updating state correctly.
- Handling multiple actions and updating state correctly.
- Handling default cases when no action matches.
- Handling matchers correctly.

These tests improve the reliability and maintainability of the `createReducer` function by verifying its behavior in various use cases.
