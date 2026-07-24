# @equinor/fusion-framework-lint-rules

## 0.2.0

### Minor Changes

- b68e731: Initial release of `@equinor/fusion-framework-lint-rules`.

  Provides the first set of Fusion Framework lint rules:
  - `require-intent-comment` — control-flow statements and iterator calls must be preceded by an explanatory comment.
  - `require-tsdoc` — exported functions and class methods must have TSDoc comments. Object-literal shorthand methods (interface implementations) are exempt.
  - `require-component-tsdoc` — exported React components (PascalCase `const` arrow functions in `.tsx` files) must have TSDoc comments. Fills the gap left by `require-tsdoc`, which only covers `function` declarations.

### Patch Changes

- Updated dependencies [b68e731]
  - @equinor/fusion-framework-lint-core@0.2.0
