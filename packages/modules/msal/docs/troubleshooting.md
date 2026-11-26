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

## Repeated Consent Redirects (`AADSTS65001`)

`MsalClient.acquireToken` only falls back from `acquireTokenSilent` to interactive authentication
when MSAL throws `InteractionRequiredAuthError`. Network, invalid-scope, and configuration errors
propagate directly without redirecting.

When Entra ID returns `AADSTS65001` (`consent_required`), one automatic redirect is allowed per
authorization request (client, authority, account, scopes, and claims) in the current tab session
so user-grantable consent still works. If the same request still requires interaction after
returning, `acquireToken` logs guidance and throws the original `InteractionRequiredAuthError`
instead of redirecting again.

- **Fix the root cause:** verify the target API's Entra ID app registration exposes the requested
  scope, pre-authorizes the portal client application, or has tenant admin consent.
- **Manual recovery:** once configuration is fixed, a user-triggered retry via
  `acquireToken({ request, silent: false })` or `behavior: 'popup'` bypasses the automatic redirect
  guard. Do not call `silent: false` from an automatic retry loop.
- **Reset behavior:** the guard clears automatically once silent or popup acquisition succeeds for
  that request, or when the browser tab is closed.

## Getting Help

- 📖 [MSAL Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal) - Complete working examples
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests
