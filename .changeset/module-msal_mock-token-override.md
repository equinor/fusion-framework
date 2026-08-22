---
"@equinor/fusion-framework-module-msal": minor
---

`MsalMockUser` gains an optional `token` field. When set, `MsalMockClient` returns that exact
access/id token instead of generating one from the account's claims — useful when a backend
mock validates the token itself (specific claims, audience, or signature) and needs to see the
token it expects rather than a mock-shaped substitute.
