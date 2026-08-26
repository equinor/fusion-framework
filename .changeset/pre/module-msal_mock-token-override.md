---
"@equinor/fusion-framework-module-msal": minor
---

`MsalMockConfigurator` gains a `setToken(token, skipResolve?)` method. When set, `MsalMockClient`
returns that exact access/id token instead of generating one from the account's claims — useful
when a backend mock validates the token itself (specific claims, audience, or signature) and
needs to see the token it expects rather than a mock-shaped substitute. By default, `setToken`
also signs in the account derived from the token's own claims (`name`, `preferred_username`,
`oid`, `tid`, `scp`) via the new `createMockUserFromToken` helper — pass `skipResolve: true` to
keep a separately declared account while still returning this token.
