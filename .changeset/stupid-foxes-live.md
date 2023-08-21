---
'@equinor/fusion-framework-cli': minor
---

Remove emotion decencies from CLI

align CLI with EDS and use style components instead of emotion 🥲
prevent conflict of react types dependent on both emotion and eds

- remove @emotion/*
- convert emotion to styled-components
- fix styling of cli
  - convert main placeholder to grid
  - remove unnecessary styling from header
  - set dynamic width of context selector (min 25rem)
