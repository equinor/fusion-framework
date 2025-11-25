---
type: template
name: dependabot-research-comment
description: Template for posting research findings as comments on Dependabot PRs
---

## Dependency Research

### 📦 Updates Summary
- **Package**: {{package_name}}
- **Current Version**: {{package_version_current}}
- **Target Version**: {{package_version_target}}
- **Update Type**: {{update_type}} (MAJOR/MINOR/PATCH)
- **Usage in Project**: {{package_usage_in_project}}

### Key Changes
{{release_changes}}

### Assessment
- **Security**: {{security_assessment_status}}
- **Breaking Changes**: {{breaking_changes_status}}
- **Compatibility**: {{compatibility_analysis_status}}

<!-- Include assessment summary only if there are concerns -->
{{#if assessment_summary}}
### ⚠️ Assessment Summary
{{assessment_summary}}
{{/if}}

### Recommendations
{{recommendations}}

---

🤖 *Research complete! Dependency insights delivered for your review.*

