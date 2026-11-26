# Troubleshooting

## Common Issues

| Issue | Solution |
|-------|----------|
| **Authentication Loop** | Ensure redirect URIs match your application's routing |
| **Token Acquisition Fails** | Check that required scopes are properly configured |
| **Module Not Found** | Ensure the module is properly configured and framework is initialized |
| **Multiple MSAL Instances** | Remove duplicate configurations from child modules |
| **Redirect Returns Void** | For redirect flows, use `handleRedirect()` after navigation completes |
| **Token Empty/Undefined** | Verify user is authenticated and scopes are correct |

## Stop repeated consent redirects (AADSTS65001)

`MsalClient.acquireToken` in `@equinor/fusion-framework-module-msal` only falls back
from `acquireTokenSilent` when MSAL throws `InteractionRequiredAuthError`. Network,
invalid scope/client, and other non-interaction errors propagate unchanged.

`invalid_grant` with `AADSTS65001` and suberror `consent_required` can mean either
user-grantable consent or missing API pre-authorization/admin consent. One automatic
redirect is allowed for user-grantable consent. If the same authorization request
still requires interaction after returning, the original MSAL error is thrown
instead of redirecting again. Check the API's Entra app registration, exposed scopes,
authorized client applications, and tenant admin consent; repeated sign-in cannot
repair those settings. Display the error to the user rather than automatically retrying.

The guard uses hashed request identities in `sessionStorage`, isolated by application,
authority, account/tenant, normalized scopes, claims and other authorization parameters.
It survives client recreation and page reloads in the same tab; correlation IDs,
nonce and navigation state do not create a new attempt. Storage/hashing failures
reject explicitly before automatic navigation. Redirect failures propagate and clear
the attempt; if cleanup also fails, an `AggregateError` contains both failures.

A successful silent or popup token acquisition clears only its matching attempt;
storage cleanup failures reject explicitly. Merely completing `handleRedirectPromise`
does **not** reset the guard: the requested token must subsequently be acquired
successfully. Attempts otherwise last for the tab session, with no timed automatic
retry that could restart the loop. Popup interaction remains repeatable. After fixing
configuration, offer a user-triggered `acquireToken({ request, silent: false })` or
popup retry. Do not call `silent: false` from an automatic retry loop; explicit
interactive requests are not subject to the automatic fallback guard.

## Getting Help

- 📖 [MSAL Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal) - Complete working examples
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests
