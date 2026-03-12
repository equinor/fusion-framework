# Changelog

## 0.1.1 - 2026-03-11

### patch

- [#73](https://github.com/equinor/fusion-skills/pull/73) [`c0070d2`](https://github.com/equinor/fusion-skills/commit/c0070d26e874e01aeef3d79f35fb2c3fb0198dcc) - Require the dependency review research and verdict outputs to use the Bip Bop title prefix.


  - align the advisor guidance with the required PR comment title format
  - update the research and verdict templates to start with the Bip Bop heading prefix

## 0.1.0 - 2026-03-10

### minor

- [#69](https://github.com/equinor/fusion-skills/pull/69) [`9503fd8`](https://github.com/equinor/fusion-skills/commit/9503fd8b9fdf1fd509d8cc765e316a57004addc9) - Add experimental dependency review skill


  - Structured research template for dependency update PRs
  - Helper advisors for research, security, code quality, impact, source control, and verdict synthesis
  - Multi-lens review analysis: security, code quality, impact
  - Reusable verdict template with recommendation, rationale, confidence, and follow-up
  - Review tracker/checklist asset for consistent dependency PR triage
  - GitHub MCP retrieval of existing PR comments and review threads before analysis
  - Minimal follow-up questions and candidate dependency PR listing when the target PR is unclear
  - Focused advisor/reference files for target-PR selection and detailed workflow sequencing
  - High-confidence evaluation coverage for dependency review
  - Advisor-driven source guidance, confidence rules, remediation handoff, and safe PR patching flow
  - Mandatory PR research checkpoint comments before mutation and final verdict comments before merge or decision
  - Evaluation prompt for dependency review validation
  - Explicit maintainer confirmation before any merge action

  resolves equinor/fusion-core-tasks#523
