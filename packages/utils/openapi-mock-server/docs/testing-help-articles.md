# Test help articles locally

Fusion apps open help articles with `useHelpCenter().openArticle(slug)` from
`@equinor/fusion-framework-react-app/help-center`. In the production portal this opens the Fusion
Help side sheet. Locally, `ffc mock-server` can serve your own help docs as a mock `help` service,
and the dev portal opens the matching article in a help panel. A wrong slug, a renamed article,
or a missing document then fails in local runs and Playwright tests instead of in production.

## What is covered

| Covered | Not covered |
| --- | --- |
| Opening an article from an app's help button or info icon | Release notes, governance, and chat |
| Browsing the app's articles in a sidebar, and an article index for `openHelp()` | Article images (relative image paths do not resolve) |
| FAQs with expandable answers and links to their articles, also from `openFaqs()` | Search relevance and filters of the real Help service |
| A simple term search over articles and FAQs, also from `openSearch(term)` | |
| Article title, last updated date, summary, and markdown content | The real Fusion Help application and its exact look |
| A clear not-found state for an unknown slug | Changes to the production portal or Help service |
| Edits shown the next time help opens, without a restart | |

The help panel has a sidebar shaped like production Fusion Help: Search, Help Chatbot, App
Description, Frequently Asked Questions, and Release Notes at the top, the current app's articles
in `sortOrder`, and App Governance and Contact Support at the bottom. Production-only pages
(`openGovernance()`, `openReleaseNotes()`, and the chatbot, app description, and support entries)
show a short "not supported in the dev portal" message.

## Write help articles

Help articles are the same markdown files the `fhelp` CLI syncs to the production Help service:
one `.md` file per article with YAML frontmatter. Articles are found by `slug`.

```markdown
---
slug: getting-started
title: Getting started
summary: First steps in My App.
appKey: my-app
sortOrder: 1
tags: [onboarding]
---

# Getting started

Article content in markdown.
```

| Frontmatter | Required | Use |
| --- | --- | --- |
| `slug` | Yes | Identifier passed to `openArticle(slug)` |
| `title` | Yes | Article title shown in the help panel |
| `summary` | No | Short intro under the title |
| `appKey`, `relevantApps` | No | Apps the article is linked to (used by `/apps/{appKey}/articles`) |
| `sortOrder`, `tags`, `category` | No | Ordering and metadata, as in the Help service |

Files without `slug` and `title` frontmatter, such as a `README.md` or an FAQ, are ignored, and so
are release notes (frontmatter with `publishedDate`).
Files are scanned non-recursively, like `fhelp`. Each article gets a stable UUID derived from its
slug, so it is the same across requests and restarts.

## Write FAQs

FAQs are `fhelp` FAQ files: one `.md` file per question, with the answer as the markdown body.

```markdown
---
slug: faq-get-access
appKey: my-app
question: How do I get access?
sortOrder: 1
linkedArticle: get-access
relevantAppKeys: [my-app]
tags: [access]
---

Request the **My App User** role in Access IT.
```

| Frontmatter | Required | Use |
| --- | --- | --- |
| `slug` | Yes | FAQ identifier, used by `/faqs/{slug}` and search hits |
| `question` | Yes | The question shown in the FAQ list |
| `linkedArticle` | No | Article slug opened by the answer's **Read the article** button |
| `appKey`, `relevantAppKeys` | No | Apps the FAQ is linked to (used by `/apps/{appKey}/faqs`) |
| `sortOrder`, `tags` | No | Ordering and metadata, as in the Help service |

## Where help docs go

A help docs folder holds the article and FAQ files directly, or in `articles` and `faqs`
subfolders (the Fusion core apps layout, next to `releasenotes/`). Without any configuration,
`ffc mock-server` auto-detects, in order:

1. `./docs` in the project root — either `./docs/articles/*.md` or `./docs/*.md`.
2. `docs/<appKey>` in the project root or any parent folder up to the repository root (the folder
   containing `.git` or `pnpm-workspace.yaml`), for example `../../docs/my-app/articles` in a
   monorepo. `<appKey>` is the `package.json` name without its npm scope.

Auto-detection only picks a folder that contains at least one article or FAQ. When nothing is
found, no `help` service is added and the mock server behaves exactly as before. Auto-detection is
best effort: a candidate folder that cannot be read, for example project docs with invalid
frontmatter, is skipped with a warning instead of stopping the mock server.

A local `help.mock.ts` module that defines the `help` service takes precedence over help docs,
whether they are configured or detected; configured help docs then log a warning that they are not
served. A `help.mock.ts` with `serviceDiscovery: 'merge'` instead layers onto the help docs, for
example to add middleware routes.

## Set or turn off the docs folder

Set the folder in `dev-server.config.ts`, next to the other mock-server settings. Relative paths
resolve from the project root, so a subfolder and a sibling folder both work:

```typescript
import type {} from '@equinor/fusion-framework-cli-plugin-mock-server';
import { defineDevServerConfig } from '@equinor/fusion-framework-cli';

export default defineDevServerConfig(() => ({
  mockServer: {
    helpDocs: '../docs/my-app', // or `false` to turn help docs off
  },
}));
```

Or pass it on the command line, which takes precedence over the configuration:

```sh
ffc mock-server --help-docs ../docs/my-app
ffc mock-server --no-help-docs
```

Precedence is `--help-docs` / `--no-help-docs`, then `mockServer.helpDocs`, then
`mockServerPlugin({ helpDocs })`, then auto-detection. A configured folder must exist — the mock
server fails at startup otherwise — but may start empty.

On startup the mock server logs where articles come from:

```text
mock server listening at http://localhost:4010
serving 3 help article(s) and 2 FAQ(s) from ../../docs/my-app (detected)
```

## Open help from the app

Wire the help button with `useHelpCenter()`. Run the app against the mock server with `--mock` so
service discovery includes the local `help` service:

```tsx
import { useHelpCenter } from '@equinor/fusion-framework-react-app/help-center';

export const HelpButton = () => {
  const helpCenter = useHelpCenter();
  return <button onClick={() => helpCenter.openArticle('getting-started')}>Help</button>;
};
```

```sh
ffc mock-server --port 4010
ffc app dev --mock http://localhost:4010   # in another terminal
```

Clicking the button opens the dev portal help panel with the article. Edit the markdown file and
click again to see the change.

For contextual help, put an info icon next to each page heading, each opening the article that
explains that page. The cookbook's
[`HelpInfoButton`](../../../../cookbooks/app-react-mock-playwright/src/components/HelpInfoButton.tsx)
is an EDS icon button with an accessible `Help: <label>` name:

```tsx
<h2>Existing discovery service</h2>
<HelpInfoButton articleSlug="existing-service-override" label="Existing service override" />
```

Clicking another info icon while the panel is open switches it to that article.

## Test help in Playwright

The help panel exposes stable test ids:

| `data-testid` | Shown when |
| --- | --- |
| `help-sidesheet` | The help panel is open (with `data-help-page` set to the requested page) |
| `help-loading` | The article is loading |
| `help-article`, `help-article-title`, `help-article-content` | The article was found |
| `help-not-found` | No article matches the slug; the message names the slug |
| `help-unavailable` | No `help` service is in service discovery (no help docs served) |
| `help-unsupported` | A production-only page (release notes, governance, …) was requested |
| `help-faqs`, `help-faq` (with `data-help-faq`, `data-expanded`) | The FAQ page and each FAQ |
| `help-faq-question`, `help-faq-answer`, `help-faq-article-link` | An FAQ's question button, answer, and **Read the article** link |
| `help-faqs-empty` | The app has no FAQs |
| `help-error` | Any other help service failure, showing the service's own message (e.g. the mock naming a file with invalid frontmatter) |
| `help-article-updated` | The article's "Last updated" date |
| `help-nav`, `help-nav-toggle` | The sidebar and its collapse/expand button |
| `help-nav-article` (with `data-help-article`) | One sidebar entry per article; the shown one has `aria-current="page"` |
| `help-nav-<page>` | A production page entry, e.g. `help-nav-search`, `help-nav-release-notes` |
| `help-home`, `help-home-article` | The article index shown by `openHelp()` |
| `help-search`, `help-search-input`, `help-search-result`, `help-search-empty` | The search page, its box, each hit (`data-help-type` is `article` or `faq`), and the no-match state |

## Browse help like a user or synthetic agent

The panel is built for accessibility-tree navigation, so Playwright scripts and synthetic agents
can browse help content without knowing slugs:

- The sidebar is a `navigation` landmark named **Help navigation**. Every article and page is a
  button named by its title, and the shown page has `aria-current="page"`.
- The page is a region named **Help content**.
- Search is a `searchbox` named **Search help**, with hits in a list named
  **Search results**.
- FAQs are in a list named **Frequently asked questions**. Each question is a button with
  `aria-expanded`, and its answer is a region named by the question.

```typescript
const sidebar = page.getByRole('navigation', { name: 'Help navigation' });
await sidebar.getByRole('button', { name: 'Search' }).click();
await page.getByRole('searchbox', { name: 'Search help' }).fill('access');
await page.getByRole('list', { name: 'Search results' }).getByRole('button').first().click();
```

On viewports narrower than 720px the sidebar starts collapsed; expand it with the
**Expand help navigation** button.

```typescript
import { expect, test } from '@playwright/test';

test('info icon opens the article for the page', async ({ page }) => {
  await page.goto('/apps/my-app/orders');
  await page.getByRole('button', { name: 'Help: Orders' }).click();

  await expect(page.getByTestId('help-article-title')).toHaveText('Working with orders');
});
```

Start `ffc mock-server` and the app from Playwright's `webServer` array, as described in
[Testing with Playwright](testing-with-playwright.md). The
[Mock API and Playwright cookbook](../../../../cookbooks/app-react-mock-playwright/README.md)
has a working example: one article per page, an info icon on every page heading, and tests for
each article, a missing article, and an unsupported page.

## Mock help service reference

The `help` service mirrors the Help API's article read and search routes. Every article includes
`content`, and `lastModified` is the markdown file's modification time.

| Route | Response |
| --- | --- |
| `GET /articles` | `{ totalCount, count, value: Article[] }` |
| `GET /articles/{articleIdentifier}` | One article by slug or id, or `404` |
| `GET /apps/{appKey}/articles` | Articles linked to the app, or not linked to any app |
| `GET /apps/{appKey}/articles/{articleIdentifier}` | One linked article, or `404` |
| `GET /faqs`, `GET /apps/{appKey}/faqs` | `{ totalCount, count, value: Faq[] }`, app routes filtered like articles |
| `GET /faqs/{faqIdentifier}`, `GET /apps/{appKey}/faqs/{faqIdentifier}` | One FAQ by slug or id, or `404` |
| `POST /search` with `{ "search": "terms" }` | `{ "@odata.count", value }` of articles (`type: 'Article'`) and FAQs (`type: 'FAQ'`), the Help index's content types, containing every term, ranked title/question > tags > summary > content/answer; other Azure AI Search options are ignored |

A `404` uses the Fusion API error shape:
`{ "error": { "code": "NotFound", "message": "Help article \"x\" was not found." } }`.

To serve help docs from a programmatic mock server, use `defineHelpArticlesMock` from
`@equinor/fusion-openapi-mock-server/presets/fusion`:

```typescript
import { createMockServer } from '@equinor/fusion-openapi-mock-server';
import { defineHelpArticlesMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';

const server = createMockServer();
server.use('fusion');
server.use([defineHelpArticlesMock({ dir: './docs' })]);
await server.start({ port: 4010 });
```

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Panel shows **Article not found** | The slug passed to `openArticle()` matches no `slug` frontmatter. Check spelling, and that the file is in the served folder (not a nested subfolder). |
| Panel shows **Help is not available** | No help docs were served. Check the startup log for the `serving … help article(s)` line; set `mockServer.helpDocs` or `--help-docs` if auto-detection did not find your folder; run the app with `--mock`. |
| No startup log line for help | No folder with articles or FAQs was detected, help docs are turned off, or a local `help.mock.ts` takes precedence. |
| Startup warns `skipping help docs auto-detection` | A detected docs folder has a file with invalid frontmatter; fix the file or set `mockServer.helpDocs`. |
| Mock server fails at startup | A configured help docs folder does not exist, or a document in it has invalid YAML frontmatter (the error names the file). |
| Panel shows **Failed to load help article** | The help service failed; the message names the cause, e.g. a file with invalid frontmatter. |
| Help button does nothing | The app is not running in the dev portal, or the button does not call `useHelpCenter()`. |
