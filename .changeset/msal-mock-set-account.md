---
"@equinor/fusion-framework-module-msal": minor
---

Add `setAccount` to `MsalMockConfigurator`, so a test declares the signed-in user on the builder instead of baking it into a client.

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
});
```

It takes an object, `null` when nobody is signed in, or an ordinary `ConfigBuilderCallback` resolving either:

```typescript
builder.setAccount(null);
builder.setAccount(async ({ hasModule }) => ({
  name: hasModule('app') ? 'App User' : 'Portal User',
}));
```

The callback is the builder's own type rather than a bespoke one, so it is handed the same arguments every other configuration callback receives and is resolved by the same machinery.

`null` and `{ signedOut: true }` both start without a session, and differ in what a later login resolves to: `null` forgets the identity, `signedOut` keeps it. A declared `null` is a declaration in its own right, so it overrides the default signed-in user — only an absent declaration means the test said nothing.

`setAccount` writes to `mock.account` on the configuration rather than to a field on the builder, so the user travels the ordinary builder pipeline: a callback is resolved by `_buildConfig` with the same arguments every other configuration callback receives, and the result is on the raw configuration before validation. The schema strips the key, so nothing about a test reaches `MsalProvider` — the branch exists purely to carry the declaration across the builder. `MsalMockConfig` is exported for code that reads it.

`setAccount` records configuration only — the user is signed in on the client as it is built, so it may be declared at any point before initialization and the last declaration wins. Keeping the user off `MsalClientConfig` is what lets `MsalMockClient` take the same argument the real `MsalClient` takes: a client is configured with *what it talks to*, never with *who is signed in*.

Because the user is in place before `MsalProvider.initialize()` runs, the provider's own start-up path acts on it. Pairing `{ signedOut: true }` with `setRequiresAuth(true)` therefore exercises the real automatic login, rather than a state assigned after initialization had already finished.

Because who is signed in is session state rather than client configuration, the user is applied to whichever client the module ends up authenticating through — wherever that client was built. When the module is hoisted onto a host application's provider, no client is built here, so the user is signed in on the *host's* client instead. Without that, a declaration made in an application's test would silently do nothing precisely when the application is being tested inside a portal. The session is shared, so the host sees the same user, as it does in production; when the host does not authenticate through a mock client the declaration throws rather than failing quietly.

`setClient` replaces the client, but not the rule: a mock client supplied that way receives the declared user too.
