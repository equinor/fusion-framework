---
"@equinor/fusion-framework-cli": patch
---

Fix `ffc app publish` to use `DefaultAzureCredential` in CI environments when no token is provided.

Previously, when `FUSION_TOKEN` was removed from CI pipelines, the CLI would fall back to interactive authentication mode, which attempted to load OS-level token cache persistence (keytar/libsecret). This native module is unavailable on GitHub-hosted runners and other headless CI environments, causing publish to fail.

Now, when running in CI (detected via environment variables like `GITHUB_ACTIONS`, `CI`, etc.) and no token is provided, the CLI automatically uses `DefaultAzureCredential`, which works seamlessly with `azure/login` OIDC federation and managed identities.

**Migration for affected teams:**
Remove the `FUSION_TOKEN` acquisition step from your workflow. The CLI will now handle authentication automatically:

```yaml
# Before: explicit token acquisition
- name: Acquire Fusion Token
  run: |
    TOKEN=$(az account get-access-token --scope ... --query accessToken -o tsv)
    echo "FUSION_TOKEN=$TOKEN" >> $GITHUB_ENV

- name: Publish app
  run: ffc app publish --env ci ./dist/app.zip

# After: just publish (no token needed)
- name: Publish app
  run: ffc app publish --env ci ./dist/app.zip
```

Fixes: https://github.com/equinor/fusion/issues/862
