---
"@equinor/fusion-openapi-mock-server": minor
---

Add `defineHelpArticlesMock` and `readHelpArticles` to `@equinor/fusion-openapi-mock-server/presets/fusion`. `defineHelpArticlesMock({ dir })` serves local help article markdown files (the frontmatter files `fhelp` syncs to Fusion Help) as a mock `help` service with the Help API's article read routes: `GET /articles`, `GET /articles/{articleIdentifier}`, `GET /apps/{appKey}/articles`, and `GET /apps/{appKey}/articles/{articleIdentifier}`. It also serves FAQs (`fhelp` FAQ files with `slug` and `question` frontmatter, read from a `faqs` subfolder) on `GET /faqs`, `GET /faqs/{faqIdentifier}` and the app-scoped variants, exported as `readHelpFaqs`. `POST /search` is a simple term search over articles and FAQs that returns the Help API's `{ '@odata.count', value }` shape, with the Help index content types `type: 'Article' | 'FAQ'`; it is exported as `searchHelpDocs`. Articles are looked up by slug or a stable slug-derived UUID, and `lastModified` comes from the file's modification time. Files are re-read on every request so edits show up without a restart, and unknown slugs return a `404` Fusion API error. Markdown without `slug` and `title` frontmatter, and release notes (`publishedDate`), are not served as articles.

```typescript
import { defineHelpArticlesMock } from '@equinor/fusion-openapi-mock-server/presets/fusion';

server.use([defineHelpArticlesMock({ dir: './docs' })]);
```

Refs: https://github.com/equinor/fusion-core-tasks/issues/2152
