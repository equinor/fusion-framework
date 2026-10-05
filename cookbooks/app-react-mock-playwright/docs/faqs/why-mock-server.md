---
slug: faq-why-mock-server
appKey: fusion-framework-cookbook-app-react-mock-playwright
question: Why does the app talk to a mock server?
sortOrder: 1
linkedArticle: getting-started
tags:
  - mock-server
---

`ffc app dev --mock` points service discovery at `ffc mock-server`, so every API call gets a
deterministic response, with **no live services** and no real sign-in.
