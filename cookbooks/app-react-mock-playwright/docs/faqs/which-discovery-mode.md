---
slug: faq-which-discovery-mode
appKey: fusion-framework-cookbook-app-react-mock-playwright
question: Which serviceDiscovery mode should my mock use?
sortOrder: 2
linkedArticle: existing-service-override
tags:
  - service-discovery
---

| Situation | Mode |
| --- | --- |
| The service already exists in discovery | `'merge'` |
| The service is not registered yet | `'new'` |
| Your app owns the URL | `false` |
