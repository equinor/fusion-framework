---
"@equinor/fusion-framework-module": minor
---

__Feat(module): add semver__

In some cases other modules might require features in sibling modules
```ts
if (modules.context.version.satisfies('>=7.2')) {
  // do some code
} else {
  throw Error('this feature requires ContextModule of 7.2 or higher, please update depencies')
}
```

Usage:
- log telemetry about module usage and outdated application
- debug code runtime by knowing version of implementation
- write inter-opt when breaking changes accour

