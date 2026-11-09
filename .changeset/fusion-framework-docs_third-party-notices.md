---
"@equinor/fusion-framework-docs": patch
---

Publish licence notices for the third-party code the documentation site serves. Every build now emits `third-party-licenses.txt` with each bundled package's name, version, licence, source URL and licence text, and the site footer links to it.

Also bump `mermaid` from 12.2.0 to 12.3.0. Its `elkjs` layout dependency is now licensed `EPL-2.0 OR GPL-3.0-or-later`; the site uses it under EPL-2.0.

Resolves #5975
