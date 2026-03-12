# Issue authoring assets

`fusion-issue-authoring` is the top-level orchestrator skill.

Type-specific fallback templates are owned by specialist skills:

- `skills/fusion-issue-author-bug/assets/issue-templates/`
- `skills/fusion-issue-author-feature/assets/issue-templates/`
- `skills/fusion-issue-author-user-story/assets/issue-templates/`
- `skills/fusion-issue-author-task/assets/issue-templates/`

GraphQL fallback query assets for MCP gaps are available in:

- `skills/fusion-issue-authoring/assets/graphql/issue_lookup.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/issue_types_list.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/issue_type_update.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/sub_issue_write.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/sub_issue_remove.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/sub_issue_reprioritize.github.graphql`
- `skills/fusion-issue-authoring/assets/graphql/linkage_verify.github.graphql`