---
"@equinor/fusion-framework-cli": minor
---

Add `--config` option to `app publish` command for uploading application configuration after publishing the bundle.

```bash
# Upload default app.config.ts after publishing
ffc app publish --config

# Upload specific config file
ffc app publish --config app.config.prod.ts --env prod
```

This streamlines the deployment workflow by combining bundle upload and config upload in a single command.

**Internal changes:**
- Refactored `publishAppConfig` to accept pre-resolved config and framework instance, improving modularity and reusability
- Updated `generateApplicationConfig` to return both config and package metadata, with graceful fallback when package resolution fails
- Simplified `app config` command flow by handling config generation and manifest loading before publishing

Fixes: https://github.com/equinor/fusion-core-tasks/issues/257
