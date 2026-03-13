# Self Review Checklist

As a **contributor**, you must complete these checks before requesting review.

## Before Requesting Review
- [ ] **Local Checks**: Run `pnpm test && pnpm build && pnpm -w check`
- [ ] **Changeset**: Create if this affects consumers ([how-to](./changeset.md))
- [ ] **Manual Testing**: Verify the change works as expected
- [ ] **PR Quality**: Add description and link related issues

## Code Quality Check
- [ ] **Readability**: Code is clear and understandable
- [ ] **Documentation**: Functions, hooks, components, classes, and named arrow functions have TSDoc that captures intent
- [ ] **Intent**: Iterator blocks, decision gates, RxJS chains, and complex decisions explain why they exist
- [ ] **README/Docs**: User-facing changes update package README and `docs/` when needed
- [ ] **Tests**: New functionality is tested
- [ ] **Breaking Changes**: Documented if present

## Ready?
All checks pass, changeset created if needed, change tested and documented.