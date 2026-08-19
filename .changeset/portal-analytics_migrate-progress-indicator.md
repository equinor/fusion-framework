---
"portal-analytics": patch
---

Replace the deprecated `@equinor/fusion-react-progress-indicator` dependency with EDS's
`Progress.Star` (`@equinor/eds-core-react`) in `EquinorLoader`. The loading text is now
rendered as a visible `Typography` caption alongside an `aria-label` on the spinner,
matching EDS's own accessible loading-indicator pattern.
