---
"@equinor/fusion-framework-docs": patch
---

Align the event module's vue-press documentation with its `docs/` folder: `README.md` and the
new `docs/{configuration,observable-patterns,lifecycle,testing}.md` pages now `@include` the
package's own docs instead of duplicating content, matching the `http`/`module` pattern.

The event module's React bindings page moves from `event/react.md` to `react/event/README.md`,
alongside `react/router/`, and is now an `@include` of `@equinor/fusion-framework-react-module-event`'s
README. The sidebar is updated to match.
