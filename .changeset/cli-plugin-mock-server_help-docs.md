---
"@equinor/fusion-framework-cli-plugin-mock-server": minor
---

`ffc mock-server` now serves local help articles and FAQs as a `help` service, so the dev portal can open the article an app requests with `useHelpCenter().openArticle(slug)`. The help docs folder is set with `--help-docs <dir>` or `mockServer.helpDocs` in `dev-server.config.ts` (relative to the project root), and otherwise auto-detected from `./docs` or `docs/<appKey>` in parent folders up to the repository root. The server logs how many articles and FAQs it serves and from where. Auto-detection is best effort: a detected folder that cannot be read is skipped with a warning. Projects without help articles or FAQs are unchanged, and a local `help.mock.ts` that defines the `help` service takes precedence (a `serviceDiscovery: 'merge'` module layers onto the help docs instead). `helpDocs: false` or `--no-help-docs` turns the feature off.

```typescript
export default defineDevServerConfig(() => ({
  mockServer: { helpDocs: '../docs/my-app' },
}));
```

Refs: https://github.com/equinor/fusion-core-tasks/issues/2153
