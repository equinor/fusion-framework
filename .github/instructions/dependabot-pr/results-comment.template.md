---
type: template
name: dependabot-results-comment
description: Template for posting validation results as comments on Dependabot PRs
---

## Validation Results

### ✅ Build Status
- **Status**: {{build_status}}
{{#if build_warnings}}
- **Warnings**: {{build_warnings}}
{{/if}}

### ✅ Test Status
- **Status**: {{test_status}}
- **Tests Passed**: {{tests_passed}}
{{#if test_failures}}
- **Test Failures**: {{test_failures}}
{{/if}}

### ✅ Linting Status
- **Status**: {{linting_status}}
{{#if linting_violations}}
- **Violations**: {{linting_violations}}
{{/if}}

### 📝 Changeset Status
{{#if changeset_created}}
- **Changeset Created**: ✅
- **Package**: {{changeset_package}}
- **Version Bump**: {{changeset_version_bump}}
{{else}}
- **Changeset Created**: ❌ ({{changeset_reason}})
{{/if}}

### 🔄 Branch Status
- **Rebased**: {{rebase_status}}
- **Conflicts**: {{conflicts_status}}

### 📋 Summary
{{validation_summary}}

### Next Steps
{{next_steps}}

---

🤖 *Validation complete! Ready for review and merge.*

