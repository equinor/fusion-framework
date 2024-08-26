---
title: Fusion Framework CLI - Commands
---

## Authentication

To run any app commands involving the [app api](https://fusion-s-apps-ci.azurewebsites.net/swagger/index.html), you need to provide a valid fusion access_token.

The CLI will look for the env varable `FUSION_TOKEN`.

You can get an access token by using the azure `az` command in your local dev environment.

```sh
az login --scope example-env-scope.default
az account get-access-token
```

See the [section](#authentication-in-github-actions) for using the framework-cli in a workflow with azure authentication.

---

### Authentication in GitHub actions

To run `fusion-framework-cli` commands towards the apps service, you need to set the env variable `FUSION_TOKEN` with a valid azure access_token in the the Equinor tenant.

To get azure access_token in a action you need to:

- Create azure service principal credentials to authenticate action and save them as secrets in your repository.
- use the action `azure/login@v2` with the secret credentials to authenticate.
- use the action `azure/cli@v2` to retreive access token for logged in user.
- Save access token as `FUSION_TOKEN` env variable.
- Run `fusion-framework-cli app XX` command like publish, upload or tag.

Create a GitHub Action **secret** AZURE_CREDENTIALS with the value as an object like described in the example below:

```json
{
    "clientSecret":  "******",
    "subscriptionId":  "******",
    "tenantId":  "******",
    "clientId":  "******"
}
```

Define workflow steps that runs the `az` command to get a token and save the token in env variable ``FUSION_TOKEN``.

```yaml
steps:
  - name: Azure login
    uses: azure/login@v2
    with:
      creds: ${{ secrets.AZURE_CREDENTIALS }}

  - name: Azure CLI
    uses: azure/cli@v2
    with:
      azcliversion: latest
      inlineScript: |
        export FUSION_TOKEN="$(az account get-access-token --scope example-env-scope\.default)"
  
  - name: Publish app...
```

You can then use commands like ``fusion-framework-cli app publish``, or run defined package script `pnpm app:publish`, in you workflow to publish the application to the apps service.
