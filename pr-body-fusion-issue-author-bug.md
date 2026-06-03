## Why

The skill `fusion-issue-author-bug` has been deprecated upstream.

## Current behavior

The deprecated skill `fusion-issue-author-bug` is still installed locally.

## New behavior

- Removes `fusion-issue-author-bug` from installed skills
- Updates lock file to remove the entry

## References

- Workflow run: https://github.com/equinor/fusion-framework/actions/runs/26876456176

## Reviewer focus

- Confirm `fusion-issue-author-bug` is no longer referenced in project configuration
- Verify the skill and lock file removal is correct
