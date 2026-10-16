---
"@equinor/fusion-framework-react-router": patch
---

Reject source-only sitemap metadata whose property reads, destructuring or spreads may invoke getters and mutate selected values, including getters on anonymous inline receivers. Match reads to their actual receivers so unrelated uninvoked getters do not reject safe nested reads or data spreads.
