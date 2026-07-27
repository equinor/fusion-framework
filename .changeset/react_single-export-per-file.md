---
"@equinor/fusion-framework-react": patch
"@equinor/fusion-framework-react-router": patch
"@equinor/fusion-framework-react-app": patch
"@equinor/fusion-framework-react-module-context": patch
"@equinor/fusion-framework-react-module": patch
"@equinor/fusion-framework-react-module-event": patch
"@equinor/fusion-framework-react-components-bookmark": patch
---

Internal: split multi-export files into one export per file and convert pure interop re-exports to `export { X } from 'y'` syntax, per `fusion-lint`'s `single-export-per-file` rule. Also removed `modules/event/src/EventProvider.tsx`, a fully dead duplicate of `eventContext.ts`/`useEventProvider.ts`/`useModulesEventProvider.ts` with no remaining consumers. No behavior changes.
