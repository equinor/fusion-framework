---
"@equinor/fusion-framework-dev-portal": minor
---

Add a help side sheet that opens when an app calls `useHelpCenter()`, shaped like production Fusion Help so people, Playwright tests, and synthetic agents can browse help content locally. It reads from the `help` service, for example local help docs served by `ffc mock-server`.

- A collapsible sidebar lists the current app's articles (`GET /apps/{appKey}/articles`) between the production pages (Search, FAQs, Release Notes, App Governance, …). The shown page is marked with `aria-current="page"`.
- Articles render their title, last updated date, summary, and markdown content (`GET /articles/{slug}`).
- Every help event from the app resets and refetches the shown page, even for an identical request; browsing in the sidebar keeps page state.
- `openHelp()` shows an index of all articles. Frequently Asked Questions (and `openFaqs()`) lists the app's FAQs (`GET /apps/{appKey}/faqs`) as expandable questions with markdown answers and a link to each FAQ's article.
- Search (and `openSearch(term)`) searches articles and FAQs with `POST /search`. An FAQ hit opens the FAQ page with that answer expanded.
- Unknown slugs show a not-found message, a discovery response without a `help` service shows a help-unavailable message, failed discovery requests and other failures show an error with the service's own message, and production-only pages show "not supported in the dev portal".
- A labelled navigation landmark, a search box, and stable `data-testid`s (`help-nav-article`, `help-article-title`, `help-search-result`, `help-not-found`, `help-unsupported`, …) support accessibility-tree navigation.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2151
