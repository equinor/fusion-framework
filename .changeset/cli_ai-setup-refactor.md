---
"@equinor/fusion-framework-cli": patch
---

Internal: refactor AI framework setup to use ModulesConfigurator directly instead of configureFramework, removing need for dummy auth configuration and improving type safety. Also removes logging of sensitive API key information.
