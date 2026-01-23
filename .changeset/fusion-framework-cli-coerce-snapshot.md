---
"@equinor/fusion-framework-cli": patch
---

Use semver coercion when generating snapshot versions so pre-release package versions are stripped to their base release before appending the snapshot suffix.
