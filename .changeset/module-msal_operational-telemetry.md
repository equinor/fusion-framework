---
"@equinor/fusion-framework-module-msal": minor
---

Report authentication outcomes as safe operational records: `acquire-token`, `login`,
`logout`, `handle-redirect` and `exchange-auth-code` each record one
`fusion.msal.<operation>.duration` metric with a `success`, `failure` or `cancelled`
outcome. MSAL `user_cancelled` errors and suppressed acquisition in the hidden iframe are
cancellations, a failure adds one sanitized exception, and a failed silent login before the
interactive fallback adds a `fusion.msal.silent-login-fallback` warning. Tokens, scopes,
accounts, login hints, auth codes and original errors are never recorded; authentication
results and thrown errors are unchanged. Token acquisition for a telemetry export request,
marked with `markTelemetryExportRequest`, is not recorded.

**Migration:** these records replace the `module-msal.acquireToken` measurement and the
`acquireToken-failed`, `logout.failed`, `handleRedirect.failed`,
`initialize.auth-code-exchange-failed` and `login.silent-failed` exceptions. Remaining
`module-msal.*` events no longer include `username`, requested or default `scopes`, or the
logout `redirectUri`; `canLoginSilently` is now a boolean rather than the login hint or
account it was derived from.

The module now disposes providers it created when the host disposes it; hosted, proxied
and custom providers are left untouched.

Ref: #5804.
