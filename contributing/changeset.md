# Changeset

this repo uses [changeset](https://github.com/changesets/changesets) for versioning and keeping change logs up to date.

## Benefits of the Changeset Approach
The changeset approach in Changesets brings several benefits to your versioning and release management workflow:

- Granular Control: By defining changes at the package level, Changesets allows for granular control over versioning. Different packages can have different versions based on their respective changes, providing flexibility and precision.
- Clear Documentation: Changesets encourage developers to provide summaries of their changes, helping document modifications effectively. This documentation serves as a valuable resource for the project and facilitates collaboration within teams.
- Consistent Versioning: Changesets follow semantic versioning principles, ensuring that version numbers convey the significance of the changes made. This consistency improves communication, compatibility, and the overall stability of your packages.
- Automated Release Process: Changesets automates the versioning and release process, reducing manual effort and the likelihood of human error. With a few simple commands, you can calculate new versions and publish the updated packages seamlessly.
- Easy Collaboration: By providing a standardized approach to managing changes, Changesets facilitates collaboration among team members. Everyone can easily understand and work with the changesets, ensuring a shared understanding of the project’s evolution.

The changeset-centered workflow in Changesets brings clarity, efficiency, and reliability to your versioning and release management process.

## How to write a changeset

All PR should have a changeset if it changes code in any of the Fusion Framework packages. Changeset can be done from the PR UI or manually.

1. Create a new file in the `.changesets` folder with the name of the package you want to change (use random human readable names by default for these files to avoid collisions when generating them. e.g., `happy-sock-monster.md`).
2. Add all affected packages to markdown metadata (front matter) using the format "PACKAGE_NAME": VERSION_TAG (e.g., `"@equinor/fusion-query": patch`).
3. Write a brief description of the change(s).
4. Add sections for each package that was changed.
5. Explain in detailed why and what changes made to the package.
6. Explain in detail how a consumer should update their code
7. [optional] Include code blocks with examples of how to use new features or migrate breaking changes.
8. [optional] Include mermaid diagrams to illustrate the flow of the change.

> as a reviewer it is important to make __SURE__ these changelogs are in place before approving the PR!

**When deciding on a version tag, consider:**

* `major` version when making incompatible library changes
* `minor` version when adding functionality in a backward compatible manner
* `patch` version when making backward compatible bug fixes

### Creating changeset from scratch

### Example

```md
  ---
  "@equinor/fusion-query": patch
  ---

  **@equinor/fusion-query:**

  Changed functionality of `Query.query` to accept a new argument `invalidate`.

  - Updated `Query.query` to accept an optional `invalidate` argument that allows developers to specify whether the query should be invalidated before executing.
  - Added support for `invalidate` in the `Query.query` method to enable more granular control over query execution.
  - Enhanced the `Query.query` method to accept a boolean value for `invalidate`, with `false` as the default value.
  - Updated the `Query.query` method to invalidate the query before executing if the `invalidate` argument is set to `true`.

  ```ts
  /** Example of using the new `invalidate` argument in `Query.query` */
  import { Query } from '@equinor/fusion-query';

  const query = new Query();
  query.query({ invalidate: true });
  ```

  ```tsx
  /** Example of using the new `useQuery` hook */
  import { useQuery } from '@equinor/fusion-query';

  const myHook = () => {
    const { data, error, isLoading } = useQuery({ invalidate: true });
  };
  ```
```

### Creating from shell

```sh
pnpm changeset
```

### From Bot

when creating a PR to our repo, a [changeset bot](https://github.com/apps/changeset-bot) will run on the PR. Changesets can be created directly from the UI