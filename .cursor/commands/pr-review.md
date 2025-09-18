# PR Review Command

## Overview
Comprehensive automated PR review tool that analyzes code changes, validates functionality, and provides constructive feedback. Supports both interactive PR selection and direct PR input via number or URL.

## Prerequisites
- **pnpm** must be available (not npm)
- **GitHub CLI** (`gh` command) must be installed
- **Current directory**: Must be in the fusion-framework repository root
- **Node.js and TypeScript** environment

## Command Formatting Guidelines
- **Always use backticks** for GitHub CLI commands: `` `gh pr view [PR_NUMBER]` ``
- **Multi-line commands** use backslash continuation: `` `gh api \` ``
- **Consistent placeholders**: Use `[PR_NUMBER]` not `<PULL_NUMBER>`
- **Code blocks** for command examples: ```bash ... ```
- **Escape backticks in body content**: Use `` \` `` inside `--body` parameters
- **Example**: `--body "## Code Example \`const foo = 1\`"`
- **For line comments with diffs**: Escape backticks in code blocks
- **Example**: `-f body="\`\`\`diff\n- const foo = 123\n+ const foo = 321\n\`\`\`"`

## Workflow Steps Overview

| Step | Action | Purpose | Status |
|------|--------|---------|--------|
| [0](#0-optional-direct-pr-input-skip-step-1) | Direct PR Input | Skip listing, process specific PR | Optional |
| [1](#1-list-and-select-pr) | List & Select PR | Choose PR to review | Required (if step 0 not used) |
| [2](#2-checkout-pr) | Checkout PR | Switch to PR branch for analysis | Required |
| [3](#3-research-impact) | Research Impact | Analyze package changes and dependencies | Required |
| [4](#4-validate-pr-body) | Validate PR Body | Check PR description accuracy and self-review | Required |
| [5](#5-analyze-code) | Analyze Code | Review code quality and documentation | Required |
| [6](#6-analyze-changesets) | Analyze Changesets | Validate versioning and migration guides | Required |
| [7](#7-validate-code) | Validate Code | Run build, tests, and type checking | Required |
| [8](#8-post-feedback) | Post Feedback | Add GitHub comments and make decision | Required |

**🤔 User Confirmation**: At each decision point, always ask user for confirmation (y/n) when in doubt

**Key Decision Points:**
- **Step 0 vs 1**: Use direct input if you know the PR number/URL
- **Step 3**: Analyze package impact and breaking changes
- **Step 4**: Validate PR body accuracy and self-review completion
- **Step 5**: Review code quality, documentation, and best practices
- **Step 6**: Validate changeset format and semver
- **Step 7**: Ensure code builds, tests pass, and no errors
- **Step 8**: Provide constructive feedback and make PR decision

**🤔 Always Ask User**: When in doubt about any decision, ask user for confirmation (y/n)

## Detailed Workflow Steps

### 0. Optional: Direct PR Input (Skip Step 1)
**USAGE**: If you already know the PR number or URL, you can skip the listing step.

**ACCEPTED INPUTS**:
- PR number: `1234` or `#1234`
- PR URL: `https://github.com/owner/repo/pull/1234`
- Full PR URL: `https://github.com/equinor/fusion-framework/pull/1234`

**VALIDATION**:
1. Extract PR number from input
2. Verify PR exists: `gh pr view [PR_NUMBER] --json number,title,author,state`
3. Confirm PR is open: Check `state` equals `"OPEN"`

**IF VALID**: Proceed directly to step 2 (Checkout PR)
**IF INVALID**: Fall back to step 1 (List and Select)

**USAGE EXAMPLES**:
```bash
# Using PR number
/pr-review 1234

# Using PR number with hash
/pr-review #1234

# Using full GitHub URL
/pr-review https://github.com/equinor/fusion-framework/pull/1234
```

**ERROR HANDLING**:
- **Invalid PR number**: "PR #1234 not found or not accessible"
- **PR is closed**: "PR #1234 is not open (state: CLOSED/MERGED)"
- **Invalid URL format**: "Invalid PR URL format. Expected: https://github.com/owner/repo/pull/1234"

### 1. List and Select PR
**COMMAND**: `gh pr list --state open --json number,title,author,createdAt`

**FILTERING**:
- **Default**: Exclude dependabot PRs (`--author "!dependabot[bot]"`)
- **Include dependabot**: Use `--include-dependabot` flag

**OUTPUT FORMAT**: Display PRs grouped by type:
```
🚀 FEATURE PRs
- PR #XXXX: [title] by @author (created X days ago)
- PR #YYYY: [title] by @author (created X days ago)

🐛 BUG FIX PRs  
- PR #ZZZZ: [title] by @author (created X days ago)
- PR #AAAA: [title] by @author (created X days ago)

📚 DOCUMENTATION PRs
- PR #BBBB: [title] by @author (created X days ago)

🔧 DEPENDABOT PRs (if --include-dependabot)
- PR #CCCC: [title] by @author (created X days ago)
```

**IMPORTANT RULES**:
- ❌ **Do NOT fetch detailed information** - only show the basic list
- ❌ **Do NOT run `gh pr view` commands** - wait for user selection
- ✅ **Wait for user to select** which PR to review
- ✅ **Then checkout** using `gh pr checkout [PR_NUMBER]`

### 2. Checkout PR
**COMMAND**: `gh pr checkout [PR_NUMBER]`

**VALIDATION**:
1. Verify checkout was successful
2. Confirm we're on the correct branch
3. Check if branch is up to date with origin

**IF CHECKOUT FAILS**:
- Check if PR exists and is accessible
- Verify branch permissions
- Try fetching latest changes: `git fetch origin`

### 3. Research Impact
**ANALYZE PR CHANGES**: Use `gh pr view [PR_NUMBER] --json title,body,files`

**RESEARCH TASKS**:
1. **Package Analysis**:
   - Check for package.json changes
   - Identify added/removed/updated packages
   - Verify package existence and versions
   - Check for breaking changes in dependencies

2. **Dependency Verification**:
   ```bash
   # Check direct dependencies
   pnpm list --depth=0
   
   # Trace dependency usage
   pnpm why <package-name>
   
   # Check for security vulnerabilities
   pnpm audit
   ```

3. **Changelog Analysis**:
   - Check if packages have changelogs
   - Review release notes for breaking changes
   - Identify new features and bug fixes

4. **Impact Assessment**:
   - Determine which packages will be affected
   - Check for compilation packages that need updates
   - Identify potential breaking changes

**INTERNAL ANALYSIS ONLY**: 
- Document findings internally for use in final review
- Do not post research comments to the PR
- Save analysis results for step 8 (Post Feedback)

### 4. Validate PR Body
**PR BODY VALIDATION**:

1. **Get PR Information**:
   ```bash
   gh pr view [PR_NUMBER] --json title,body,author
   ```

2. **Validate PR Description**:
   - **Accuracy Check**: Does the PR body accurately describe what the code actually does?
   - **Completeness**: Does it explain the changes, rationale, and impact?
   - **Clarity**: Is the description clear and understandable?

3. **Check for Self-Review**:
   - Look for evidence of self-review in the PR body
   - Check if author has tested their changes
   - Verify if breaking changes are documented
   - Look for migration guides if applicable

4. **Validation Criteria**:
   - **Description Matches Code**: PR body accurately reflects actual changes (✅/❌)
   - **Self-Review Evidence**: Author has done basic self-review (✅/❌)
   - **Breaking Changes**: Documented if present (✅/❌)
   - **Testing**: Evidence of testing or validation (✅/❌)
   
   **PASS CRITERIA**: All 4 criteria must be ✅
   **FAIL CRITERIA**: Any criteria is ❌

**DECISION POINT**:
- **If PR body is inadequate**: 
  - Ask user: "PR body is inadequate. Should I reject this PR and ask author to improve it? (y/n)"
  - If user confirms: Post rejection message using the template below and end review
  - If user says no: Continue with code analysis anyway
- **If PR body is good**: Continue with code analysis

**REJECTION MESSAGE** (if PR body is inadequate):
```bash
gh pr review [PR_NUMBER] --request-changes --body "## 📝 PR Body Needs Improvement

Hey! The code changes look good, but we need a bit more detail in the PR description before we can review it properly.

### What's Working Well
- [Acknowledge any positive aspects of the code]
- [Good implementation approach]

### Issues Found
- [List specific issues with PR body]
- [Missing self-review evidence]
- [Inaccurate description of changes]

### Required Actions
- [ ] Update PR description to accurately reflect changes
- [ ] Complete self-review checklist
- [ ] Document any breaking changes
- [ ] Add testing evidence

### Next Steps
Could you update the PR body and request review again? This will help us understand your changes better and speed up the review process.

**Need help?** Feel free to ask questions about the PR template or self-review process! 🤝"
```

**INTERNAL ANALYSIS ONLY**: 
- Document PR body validation findings
- Do not post validation comments to the PR
- Save analysis results for step 8 (Post Feedback)

### 5. Analyze Code
**CODE REVIEW TASKS**:

1. **TypeScript Documentation**:
   - Check for TSDoc comments on exported functions/classes
   - Verify parameter and return type documentation
   - Ensure IntelliSense-friendly documentation

2. **Inline Comments**:
   - Review complex operations for explanatory comments
   - Check for magic numbers and constants
   - Verify side effects are documented

3. **Code Quality**:
   - Check for best practices adherence
   - Review error handling patterns
   - Verify consistent coding style
   - Check for proper type usage

4. **File Analysis**:
   ```bash
   # Get changed files
   gh pr view [PR_NUMBER] --json files --jq '.files[].path'
   
   # Analyze each changed file
   # Check for proper imports/exports
   # Verify function signatures
   # Review class structures
   ```

**CODE QUALITY CHECKS**:
- **Function Documentation**: All exported functions have TSDoc comments
- **Complex Logic**: Inline comments explain non-obvious operations
- **Error Handling**: Proper error handling and validation
- **Type Safety**: Correct TypeScript usage
- **Performance**: No obvious performance issues
- **Security**: No security vulnerabilities

**INTERNAL ANALYSIS ONLY**: 
- Document findings internally for use in final review
- Do not post code analysis comments to the PR
- Save analysis results for step 8 (Post Feedback)

### 6. Analyze Changesets
**CHANGESET VALIDATION**:

1. **Check for Changesets**:
   ```bash
   # List changeset files
   ls .changeset/*.md
   
   # Check if changesets exist for affected packages
   ```

2. **Validate Changeset Format**:
   - Check YAML frontmatter structure
   - Verify package names are correct
   - Ensure version types are appropriate (patch/minor/major)

3. **Semantic Versioning**:
   - Verify semver is correctly applied
   - Check if breaking changes have major version bumps
   - Ensure backward compatible changes use patch/minor

4. **Migration Guides**:
   - Check for migration guides on breaking changes
   - Verify migration steps are clear and complete
   - Ensure examples are provided where needed

**CHANGESET REQUIREMENTS**:
- **All affected packages** must have changesets (✅/❌)
- **Breaking changes** require major version bumps (✅/❌)
- **Migration guides** required for breaking changes (✅/❌)
- **Clear descriptions** of what changed and why (✅/❌)

**PASS CRITERIA**: All 4 requirements must be ✅
**FAIL CRITERIA**: Any requirement is ❌

**DECISION POINT**:
- **If changesets are inadequate**: 
  - Ask user: "Changesets are inadequate. Should I reject this PR and ask author to fix them? (y/n)"
  - If user confirms: Post rejection message using the template below and end review
  - If user says no: Continue with code validation anyway
- **If changesets are good**: Continue with code validation

**REJECTION MESSAGE** (if changesets are inadequate):
```bash
gh pr review [PR_NUMBER] --request-changes --body "## 📜 Changeset Issues Found

Hey! The code changes look solid, but we need to add some changesets before we can merge this.

### What's Working Well
- [Acknowledge positive aspects of the code]
- [Good implementation quality]

### Issues Found
- [List specific changeset issues]
- [Missing changesets for affected packages]
- [Incorrect semver versioning]
- [Missing migration guides for breaking changes]

### Required Actions
- [ ] Create changesets for all affected packages
- [ ] Use correct semantic versioning (patch/minor/major)
- [ ] Add migration guides for breaking changes
- [ ] Ensure changeset descriptions are clear and complete

### Next Steps
Could you add the changesets and request review again? They help us track version changes and communicate updates to users.

**Need help?** Check out our [changeset guide](contributing/changeset.md) or ask questions! 📚"
```

**INTERNAL ANALYSIS ONLY**: 
- Document findings internally for use in final review
- Do not post changeset analysis comments to the PR
- Save analysis results for step 8 (Post Feedback)

### 7. Validate Code
**MANDATORY VALIDATION SEQUENCE** (must be run in this exact order):

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Build Project**:
   ```bash
   pnpm build
   ```

3. **Type Checking**:
   ```bash
   pnpm check:errors
   ```

4. **Run Tests**:
   ```bash
   pnpm vitest run
   ```

**VALIDATION CRITERIA**:
- ✅ **Install**: All dependencies install successfully
- ✅ **Build**: Project builds without errors
- ✅ **Type Check**: No TypeScript errors
- ✅ **Tests**: All tests pass

**DECISION POINT**:
- **If validation fails**: 
  - Ask user: "Code validation failed. Should I reject this PR and ask author to fix issues? (y/n)"
  - If user confirms: Post rejection message using the template below and end review
  - If user says no: Continue with final feedback anyway
- **If validation passes**: Continue with final feedback

**REJECTION MESSAGE** (if validation fails):
```bash
gh pr review [PR_NUMBER] --request-changes --body "## 🔧 Code Validation Failed

Hey! The code changes look good, but we've got some validation issues that need fixing before we can merge this.

### What's Working Well
- [Acknowledge positive aspects of the code]
- [Good implementation approach]

### Validation Results
- **Install**: [✅ Success / ❌ Failed with errors]
- **Build**: [✅ Success / ❌ Failed with errors]
- **Type Check**: [✅ Success / ❌ Failed with errors]
- **Tests**: [✅ All passed / ❌ X failed, Y passed]

### Issues Found
- [List specific validation errors]
- [Build failures and fixes needed]
- [Test failures and solutions]

### Required Actions
- [ ] Fix all build errors
- [ ] Resolve all TypeScript errors
- [ ] Fix failing tests
- [ ] Ensure all validation passes

### Next Steps
Could you fix these validation issues and request review again? This ensures the code is ready for production.

**Need help?** Feel free to ask questions about the errors or check our [development guide](contributing/development.md)! 🛠️"
```

**INTERNAL ANALYSIS ONLY**: 
- Document findings internally for use in final review
- Do not post validation comments to the PR
- Save analysis results for step 8 (Post Feedback)

### 8. Post Feedback
**GITHUB INTEGRATION**:

**FORMATTING REMINDER**: 
- Use backticks for GitHub CLI commands: `` `gh pr view [PR_NUMBER]` ``
- Escape backticks in body content: `` \` `` inside `--body` parameters
- For line comments with diffs: Escape backticks in code blocks
- Use consistent `[PR_NUMBER]` placeholders

1. **Line-Specific Comments**:
   ```bash
   # Add line-specific comment using GitHub API
   gh api \
     --method POST \
     -H "Accept: application/vnd.github+json" \
     /repos/OWNER/REPO/pulls/[PR_NUMBER]/comments \
     -f body="Your comment here" \
     -f commit_id=COMMIT_SHA \
     -f path=path/to/file.ext \
     -f line=LINE_NUMBER \
     -f side=LEFT  # or RIGHT for the compare branch
   ```

2. **PR Decision Commands**:
   ```bash
   # Approve PR
   gh pr review [PR_NUMBER] --approve --body "## ✅ Approved
   
   Great work on this PR! The changes are well-implemented and follow our coding standards.
   
   ### Highlights
   - [Specific positive aspects]
   - [Code quality improvements]
   - [Good documentation]
   
   Ready to merge! 🚀"
   
   # Request changes
   gh pr review [PR_NUMBER] --request-changes --body "## ⚠️ Changes Requested
   
   Hey! The PR looks good overall but needs a few tweaks before we can merge it.
   
   ### What's Working Well
   - [Acknowledge positive aspects]
   
   ### Issues to Address
   - [Specific issues with clear explanations]
   - [Actionable steps to fix each issue]
   
   ### Next Steps
   - [ ] [Specific action 1]
   - [ ] [Specific action 2]
   
   Let me know if you need any help with these changes! 👍"
   
   # General comment (no approval/rejection)
   gh pr comment [PR_NUMBER] --body "## 💬 General Feedback
   
   Nice work! Here's some additional feedback:
   
   ### Observations
   - [Specific observations about the code]
   - [Suggestions for improvement]
   
   ### Questions
   - [Any questions about the implementation]
   
   Keep up the great work! 🎉"
   ```

3. **Decision Logic**:
   - **Accept**: All validation passed + good code quality + proper changesets + good PR body
   - **Request Changes**: Minor issues that can be addressed (documentation, small fixes)
   - **Reject**: Critical issues that require major rework (validation failures, missing changesets, poor PR body)
   - **Always ask user**: When in doubt about any decision, ask user for confirmation (y/n)

**FEEDBACK TONE**:
- Always polite and encouraging
- Constructive and actionable
- Professional and helpful
- Focus on improvement, not criticism
- Acknowledge positive aspects even in rejections
- Use emojis sparingly for warmth and clarity
- Offer help and resources when appropriate
- Be specific about what needs to be improved
- **Always ask user for confirmation when in doubt** (y/n)

**POST FINAL COMMENT**:
```bash
gh pr comment [PR_NUMBER] --body "## 📋 PR Review Summary (PR #[PR_NUMBER])

<!-- WORKFLOW_STATE: REVIEW_COMPLETE -->

### Overall Assessment
**Status**: [✅ APPROVED / ⚠️ CHANGES REQUESTED / ❌ REJECTED]

### Summary
[Brief summary of the PR and review findings]

### Strengths
- [List positive aspects of the PR]
- [Highlight good practices and quality work]

### Areas for Improvement
- [List specific areas that need attention]
- [Provide constructive suggestions]

### Action Items
- [ ] [List specific actions required]
- [ ] [Clear, actionable tasks]

### Next Steps
- [Clear next steps for the PR author]
- [Timeline expectations if applicable]

### Process Log
- ✅ Step 8: Post Feedback completed
- ✅ All review steps completed

**Review completed by**: AI Assistant  
**Review date**: [current date]

**Questions?** Feel free to ask if you need clarification on any feedback! 🤝"
```

## Workflow State Markers

The command uses internal state tracking (no intermediate PR comments):

- **Impact Analysis**: Documented internally
- **PR Body Validation**: Documented internally
- **Code Analysis**: Documented internally  
- **Changeset Analysis**: Documented internally
- **Code Validation**: Documented internally
- **Final Review**: Single comprehensive comment posted

## Error Handling

### Common Issues
- **PR not found**: Verify PR number and permissions
- **Checkout fails**: Check branch permissions and existence
- **Build fails**: Document specific errors and provide fixes
- **Tests fail**: Analyze failures and provide solutions
- **Changeset issues**: Guide on proper changeset format

### Recovery Strategies
- **Network issues**: Retry commands with exponential backoff
- **Permission issues**: Check GitHub CLI authentication
- **Build issues**: Provide specific fix instructions
- **Test failures**: Analyze and provide targeted solutions

## Success Criteria

- [ ] PR checked out successfully
- [ ] Impact analysis completed
- [ ] Code quality reviewed
- [ ] Changesets validated
- [ ] Code builds and tests pass
- [ ] Constructive feedback provided
- [ ] Clear PR decision made
- [ ] GitHub comments posted

## Quick Reference

### Direct PR Input
```bash
# Skip PR listing and go directly to review
/pr-review 1234                                    # PR number
/pr-review #1234                                   # PR number with hash
/pr-review https://github.com/owner/repo/pull/1234 # Full URL
```

### List PRs
```bash
# List PRs excluding dependabot
/pr-review --list

# List all PRs including dependabot
/pr-review --list --include-dependabot
```

### Validation Commands
```bash
# Full validation sequence
pnpm install && pnpm build && pnpm check:errors && pnpm vitest run

# Individual validation steps
pnpm install    # Install dependencies
pnpm build      # Build project
pnpm check:errors  # Type checking
pnpm vitest run # Run tests
```

### GitHub Integration
```bash
# Approve PR
gh pr review [PR_NUMBER] --approve --body "## ✅ Approved

Great work on this PR! The changes are well-implemented and follow our coding standards.

### Highlights
- [Specific positive aspects]
- [Code quality improvements]
- [Good documentation]

Ready to merge! 🚀"

# Request changes
gh pr review [PR_NUMBER] --request-changes --body "## ⚠️ Changes Requested

Hey! The PR looks good overall but needs a few tweaks before we can merge it.

### What's Working Well
- [Acknowledge positive aspects]

### Issues to Address
- [Specific issues with clear explanations]
- [Actionable steps to fix each issue]

### Next Steps
- [ ] [Specific action 1]
- [ ] [Specific action 2]

Let me know if you need any help with these changes! 👍"

# General comment (no approval/rejection)
gh pr comment [PR_NUMBER] --body "## 💬 General Feedback

Nice work! Here's some additional feedback:

### Observations
- [Specific observations about the code]
- [Suggestions for improvement]

### Questions
- [Any questions about the implementation]

Keep up the great work! 🎉"

# Add line-specific comment using GitHub API
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/OWNER/REPO/pulls/[PR_NUMBER]/comments \
  -f body="Your comment here" \
  -f commit_id=COMMIT_SHA \
  -f path=path/to/file.ext \
  -f line=LINE_NUMBER \
  -f side=LEFT  # or RIGHT for the compare branch
```