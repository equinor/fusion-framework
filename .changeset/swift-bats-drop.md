---
'@equinor/fusion-framework-cli': patch
---

fix log loop

```bash
if (msg.match(/^Failed to load url \/assets/)) {
RangeError: Maximum call stack size exceeded
    at String.match (<anonymous>)
```
