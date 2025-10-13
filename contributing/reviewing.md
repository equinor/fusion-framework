---
title: reviewing
---

# Code Review Checklist

As a **reviewer**, you must ensure these requirements are met before approving any PR.

## Critical Checks (Blockers)
- [ ] **Changeset**: Present for any consumer-affecting changes
- [ ] **CI Status**: All checks pass (build, test, lint, type-check)
- [ ] **Issue Scope**: Changes align with referenced issue(s)
- [ ] **Breaking Changes**: Properly documented and versioned

## Quality Review
- [ ] **Tests**: New functionality has adequate test coverage
- [ ] **Documentation**: Public APIs have TSDoc comments
- [ ] **Code Quality**: Readable, follows established patterns
- [ ] **Security**: No obvious vulnerabilities

## Tips
- Start with changeset and CI status
- Check tests to understand expected behavior
- Focus on logic first, style second
- Be specific in feedback
  