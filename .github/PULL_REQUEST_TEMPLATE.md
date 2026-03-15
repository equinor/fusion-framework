<!--
Remove all HTML comments before submitting. Replace placeholders with actual content.
-->

**Why is this change needed?**
<!-- Problem this solves or reason for change. Be specific. -->

**What is the current behavior?**
<!-- How things work currently, including any issues. -->

**What is the new behavior?**
<!-- What will change after this PR is merged. -->

**What is the intended behavior or invariant?**
<!-- Explain the contract this change introduces or preserves. State the non-obvious rule, threshold, lifecycle expectation, stream behavior, or render assumption reviewers should protect. -->

**Does this PR introduce a breaking change?**
<!-- Yes/No. If yes, describe what breaks and how to migrate. -->

**Impact assessment:**
<!-- 
- Breaking changes: Will this break existing code? (Yes/No)
- Version bump: Patch/Minor/Major (based on changeset)
- Consumer impact: What do consumers need to know?
- Downstream impact: Does this affect other packages in the monorepo?
-->

**Review guidance:**
<!-- Special considerations, areas of concern, specific things to verify, or focus areas for review. -->

**Additional context**
<!-- Implementation details, known limitations, edge cases, related docs. -->

**Related issues**
<!-- Remove if none. Use `closes: #123` or `ref: #456` / `ref: [AB#12345](url)`. -->

### Checklist

- [ ] Confirm completion of the [self-review checklist](https://github.com/equinor/fusion-framework/blob/main/contributing/self-review.md)
- [ ] Confirm TSDoc captures intent for functions, hooks, components, classes, and named arrow functions
- [ ] Confirm iterator blocks, decision gates, RxJS chains, and complex decisions explain why they exist
- [ ] Confirm React logic and derived values are resolved before markup when applicable
- [ ] Confirm README/docs are updated for user-facing changes
- [ ] Confirm changes to target branch validation
  - _Included files validated_
  - _No new linting warnings_
  - _Not a duplicate PR ([check existing](https://github.com/equinor/fusion-framework/pulls))_
- [ ] Confirm adherence to [code of conduct](https://github.com/equinor/fusion-framework/blob/main/CODE_OF_CONDUCT.md)

