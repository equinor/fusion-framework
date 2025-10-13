# Self Review Checklist

As a **contributor**, you must complete these checks before requesting review.

## Before Requesting Review
- [ ] **Local Checks**: Run `pnpm test && pnpm build && pnpm -w check`
- [ ] **Changeset**: Create if this affects consumers ([how-to](./changeset.md))
- [ ] **Manual Testing**: Verify the change works as expected
- [ ] **PR Quality**: Add description and link related issues

## Code Quality Check
- [ ] **Readability**: Code is clear and understandable
- [ ] **Documentation**: Public APIs have TSDoc comments
- [ ] **Tests**: New functionality is tested
- [ ] **Breaking Changes**: Documented if present

## Ready?
All checks pass, changeset created if needed, change tested and documented.