---
id: dependencies
lane: dependencies
title: Dependencies
reportType: dependencies
summary: Review supplied dependency PRs and attempt bounded remediation in explicit PR mode.
modes: [report, issue, pr, maintenance]
validationProfiles: [none, dotnet, framework-context-selector, framework-portal-analytics]
requires: [context]
apmProfiles: [fusion-developer]
---
Use roughly 70% working confidence as a research-stopping heuristic, not a measured probability or proof.
It is not the output's confidence field, which is only high, medium or low.
Once concrete evidence supports a useful bounded recommendation or fix, stop exploring and disclose uncertainty.
Hard path, integrity, validation and publication gates remain unchanged; confidence never overrides them.

Review only the supplied dependency PRs. Start with their diffs, supplied comments/reviews/checks and direct
consumers. Reuse prior investigation; retrieve only missing evidence that could change the verdict or fix.
For maintenance output, complete ONE assigned task in this session. Read the repository's AGENTS.md,
CODEMAP.md, applicable instructions and existing harness. They define setup, validation and release artifacts;
there is no host-defined package-manager recipe or independent host rerun.
The host synchronizes the integration branch with Git first, without an agent or full application validation.
Only a real paused rebase conflict creates a synchronize task. Finish that rebase, check the conflict resolution
and clean Git state, and leave full application validation to the existing repository CI after publication.
For pull-request operation the integration branch is the real quality gate: its CI validates the combined
updates before anything reaches the default branch. Most Dependabot PRs are routine, so smell-test quickly
and default to MERGE. With mergePolicy "combined" (no integration branch configured) the host applies each
Dependabot update in turn to greenkeeper/dependencies, one pull request into the default branch. A worker
regenerates lockfiles, researches, migrates and runs focused checks; a coordinator decides verdict and changeset.
Both run as the fusion-repository-greenkeeper agent with the fusion-dependency-review and fusion-agent-content skills.
The host commits accepted updates with Dependabot trailers, resets rejected ones and never merges.
Reuse prior Greenkeeper comments and human discussion before researching again.
Patch/minor updates: skim release notes; without a declared breaking change, MERGE. Major or declared breaking
updates: check whether the changed APIs are used here; if not, MERGE. If our code is affected, run focused
tests/builds for the affected packages; if they fail, try a migration within scope and rerun them.
For mergePolicy "combined" the host owns all Git workflow: work in /candidate as applied, do not rebase, push or
use dependency-input, and report originalHead and baseHead exactly as supplied. The rest of this paragraph and
the /git-host paragraph below apply to integration-branch and synchronize operations.
Rebase onto the integration branch and regenerate lockfiles. Add the changeset to the Dependabot PR following the
repository's changeset rules; it is required for every MERGE affecting a published package, and the comment states
the changeset decision. MERGE requests
squash auto-merge into the integration branch, where GitHub's enforced rules still apply. Do not hold for
pending CI, unneeded checks or confidence alone. HOLD only for breaking changes that need human judgement,
or when focused checks still fail after a migration attempt; state what a human must decide.
Do not run the whole monorepo build/test suite in the sandbox.
The persistent local bare remote /git-host contains original history at refs/heads/dependency-input and the
target at refs/heads/dependency-base. Work in the mounted /candidate clone, leave the primary checkout unchanged
and push one clean validated candidate based on baseHead to the local ref refs/heads/greenkeeper/candidate.
Never push directly to GitHub. Retain the clone, commits and rebase state on failure for diagnosis and continuation.
Create validation worktrees from /candidate, not the prepared guidance checkout. Do not export GIT_DIR or
GIT_WORK_TREE into build/test commands: their child tools must discover the validation worktree and its local origin.
The sandbox has two CPUs, 4 GiB memory and 1,024 process/thread slots. Use the repository tool's supported
concurrency controls to bound full builds to at most two workers and run tests serially (one worker with file
parallelism disabled). A worker limit alone may not serialize browser/file execution. Preserve all required
projects, tests and assertions; limiting parallelism is not filtering.
For resource exhaustion, retain the failed attempt as diagnostics and retry the same checks with lower concurrency
within the task deadline. Never reinterpret an exhausted or killed process as passed validation.
Node/fullstack images include Chromium and its OS libraries in a read-only store; sandboxes set
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 so installs do not try to write there. If tests need another browser revision,
install it with PLAYWRIGHT_BROWSERS_PATH under /tmp. Inspect the repository's required browser version
and verify the installed runtime with its own browser launcher before attempting downloads. If matching image
prerequisites satisfy workflow setup, record that evidence and the equivalent setup precisely; do not claim an
OS-package installation ran. Missing prerequisites still block validation; do not attempt privileged OS changes.
Resolve intended source/manifests first and regenerate generated lockfiles with the repository package manager;
never invent versions or integrity hashes. Follow the repository's conflict policy; its unconditional manual
fallback remains binding until the repository adopts an exception. Do not expand the task or skip commits.
Return the dependency-task JSON from the act prompt, including exact commands/outcomes, changed files,
research/verdict/confidence and limitations. Record diagnostic commands separately from final acceptance checks:
an ancestry predicate's exit 1 means rebase needed, not failed validation. A failed check you ran means HOLD and
no publishable candidate; checks deliberately left to integration-branch CI are recorded as not-run with the reason.
The host trusts this evidence for comments and merge decisions.
Failed or not-run checks must remain explicit. Do not push to GitHub, comment, retarget, approve or merge.

The remaining report/patch guidance applies to report, issue and pr modes, not maintenance.
Consult the pinned upstream release or source for specific compatibility questions, not an exhaustive audit
of the transitive dependency tree. Additional versions, broad builds and repeated searches need a concrete
unanswered question. Read-only upstream research and package retrieval are permitted.
Separate observed behavior, source-backed inference and unconfirmed concerns. Do not call a pre-existing issue
a newly introduced regression, or turn uncertainty alone into a confirmed defect. Distinguish compatible updates,
material blockers and security updates. If the concern is disproven, do not invent a fix.

For report or issue output, leave the checkout unchanged and propose evidence-backed next actions.
For patch output, attempt to remediate the supplied dependency PR's evidence-backed concern within the exact
allowed paths. A relevant pre-existing issue can be corrected without proving that this version introduced it.
Confirm the supplied PR head matches the assessed revision. Prefer the smallest justified correction; do not
make speculative upgrades merely to produce a patch. Use the package manager for lockfiles, never hand-edit
resolved versions or integrity hashes. Preserve unrelated resolutions and consumer cleanup/ownership semantics.
When source and regression-test paths are allowed, add focused regression coverage and run the relevant checks.
Demonstrate failure before the fix where practical; disclose when runtime reproduction remains unverified.
Do not substitute a dependency bump for source behavior that the dependency does not apply.

Time-box open-ended research to roughly the first quarter of the container deadline. Reserve time for focused
checks and complete delivery. Do not duplicate the full host validation profile merely to raise confidence:
the trusted host must still run it independently before accepting a patch. Report every failed or unrun check
honestly; a worker check is not host acceptance. Never weaken tests or claim that unexecuted checks passed.
Keep scratch downloads, scripts and reports under /tmp, not the primary checkout. Compare final changes with
the initial prepared baseline; remove only your scratch and restore your out-of-allowlist edits.
If the decision gate applies, return its issue-only handoff instead of forcing a patch.
If neither a justified fix nor an actionable decision handoff is possible, return failure with the concrete blocker,
not an empty successful patch. Tooling failures and missing evidence are not maintainer decisions.

For patch output, use the branch handoff to supply a separate proposed PR description: problem, actual changes,
source PR, exact check outcomes and unresolved risks for human review. Keep it distinct from the assessment;
follow installed PR-documentation guidance when available. Never push, comment, approve, retarget, integrate
or merge remote branches. The trusted host owns later publication; existing source PRs stay untouched.

For final summary authoring, explicitly select the dependencies assessment type with fusion-report-authoring.
This consumer-owned mapping does not replace dependency-review verdicts or authorize publication or merging.
