## Why

The skill `fusion-skill-self-report-bug` has been deprecated upstream.

## Current behavior

The deprecated skill `fusion-skill-self-report-bug` is still installed locally.

## New behavior

- Removes `fusion-skill-self-report-bug` from installed skills
- Updates lock file to remove the entry

## References

- Workflow run: https://github.com/equinor/fusion-framework/actions/runs/26876456176

## Reviewer focus

- Confirm `fusion-skill-self-report-bug` is no longer referenced in project configuration
- Verify the skill and lock file removal is correct
