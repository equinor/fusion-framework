---
title: Feature Flag
category: Guide
tag:
    - how to
    - basic
    - app
    - cookbooks
    - feature
    - feature-flag
---

Feature flags allows the application to provide functionality which can be enabled/disabled.



[see module for technical documentation](../../modules/feature-flag/module.md)

## Configuration

> [!NOTE]
> In the future `feature flags` will be provided as an API service, and no configuration needed 

@[code](@cookbooks/app-react-feature-flag/src/config.ts)

## Usage

[see cookbook example](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-feature-flag)
@[code](@cookbooks/app-react-feature-flag/src/FeatureFlags.tsx)

> [!TIP]
> the `readOnly` attribute will disable toggling of a feature