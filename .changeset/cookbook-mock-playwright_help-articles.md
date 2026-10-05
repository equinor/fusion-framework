---
"@equinor/fusion-framework-cookbook-app-react-mock-playwright": patch
---

Add a local help scenario: one help article per page in `docs/articles`, FAQs in `docs/faqs` that link to those articles, a `HelpInfoButton` info icon next to every page heading that opens that page's article with `useHelpCenter().openArticle(slug)`, a page that also opens a missing article and the FAQs page, buttons for `openHelp()` and `openSearch(term)`, and Playwright tests that click every info icon, browse every article from the sidebar, expand FAQs, search articles and FAQs, and check the dev portal's not-found and not-supported states.

Refs: https://github.com/equinor/fusion-core-tasks/issues/2154
