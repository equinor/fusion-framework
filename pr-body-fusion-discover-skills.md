## Why

The skill `fusion-discover-skills` has been deprecated upstream.

## Current behavior

The deprecated skill `fusion-discover-skills` is still installed locally.

## New behavior

- Removes `fusion-discover-skills` from installed skills
- Updates lock file to remove the entry

## References

- Workflow run: https://github.com/equinor/fusion-framework/actions/runs/26876456176

## Reviewer focus

- Confirm `fusion-discover-skills` is no longer referenced in project configuration
- Verify the skill and lock file removal is correct
