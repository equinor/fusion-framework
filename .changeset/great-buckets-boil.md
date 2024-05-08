---
"@equinor/fusion-framework-cli": patch
---

Fixed styling of the render root element for the application

fixes: https://github.com/equinor/fusion/issues/301

## @equinor/fusion-framework-cli

### What the change is

This change fixes an issue where the root element rendered by the CLI was not being styled correctly, causing layout issues in some applications.

### Why the change was made

Previously, the root element was not receiving the correct styles due to an issue with the way styles were being applied. This led to visual inconsistencies and layout problems in applications rendered by the CLI.

### How a consumer should update their code

No code changes are required for consumers. This fix will be automatically applied when using the updated version of the `@equinor/fusion-framework-cli` package.
