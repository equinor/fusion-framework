# Welcome to Fusion Framework contributing guide <!-- omit in toc -->

Thank you for investing your time in contributing to our project! 

Read our [Code of Conduct](./CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

To get an overview of the project, read the [README](README.md). 
Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Getting started

### Issues

#### Create a new issue

If you spot a problem with the docs, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments). If a related issue doesn't exist, you can open a new issue using a relevant [issue form](https://github.com/equinor/fusion-framework/issues/new/choose).

#### Solve an issue

Scan through our [existing issues](https://github.com/equinor/fusion-framework/issues) to find one that interests you. You can narrow down the search using `labels` as filters. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Make changes locally

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Install or update to **Node.js**, at the version specified in `.node-version`. For more information, see [the development guide](contributing/development.md).

3. Create a working branch and start with your changes!

### Commit your update

Your commits should adhere to [conventional commit specification](https://www.conventionalcommits.org/en/v1.0.0/) and follow a linear history.

```sh
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

> [!CAUTION] 
> ☠️ do __not__ include files in your commit which are outside the `scope` of the commit!

> [!IMPORTANT]
> Don't forget to [self-review](contributing/self-review.md) to speed up the review process⚡️.

> [!TIP]
> Rebase your commits 😍
> 
> The important part is to provide a good history.
> Git should not be used as a 'backup'. Commit frequency should not be determined by a time etc.
>
> Be smart and think how you would have wanted to visit the history at a later time.

### Pull Request

__Before open a new PR:__

- all affected packages has matching [changesets](./contributing/changeset.md)
- make sure the the code build `pnpm build`
- make sure the code lints `pnpm lint`
- make sure tests passes `pnpm test run`

When you're finished with the changes, create a pull request.
> [!WARNING]
> All PR should be created as __draft__
- Select a matching pull request template.
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.

> __when all checks are green, publish the PR__

_pull request that trigger `ready_for_review` will post to our Teams channel_

Once you submit your PR, a Fusion Core team member will review your proposal. We may ask questions or request additional information.

- We may ask for changes to be made before a PR can be merged, either using [suggested changes](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/incorporating-feedback-in-your-pull-request) or pull request comments. You can apply suggested changes directly through the UI. You can make any other changes in your fork, then commit them to your branch.
- As you update your PR and apply changes, mark each conversation as [resolved](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/commenting-on-a-pull-request#resolving-conversations).
- If you run into any merge issues, checkout this [git tutorial](https://github.com/skills/resolve-merge-conflicts) to help you resolve merge conflicts and other issues.

> [!WARNING]
> when a pull request review requests changes, the pull request is moved back to __draft__
>
> _When a pull request is moved back to draft, it is __the creator__ responsibility to request a re-review_

> [!CAUTION]
> when a pull request review is accepted, the creator is normally responsible for merging in the code.

> [!TIP]
> Set your PR to "auto-merge"


### Your PR is merged!

Congratulations 🎉 The Fusion team thanks you 😘

## Windows

This code base can be developed on Windows, however a few potential gotchas need to be kept in mind:

1. Regular Expressions: Windows uses `\r\n` for line endings, while Unix-based systems use `\n`. Therefore, when working on Regular Expressions, use `\r?\n` instead of `\n` in order to support both environments. The Node.js [`os.EOL`](https://nodejs.org/api/os.html#os_os_eol) property can be used to get an OS-specific end-of-line marker.
2. Paths: Windows systems use `\` for the path separator, which would be returned by `path.join` and others. You could use `path.posix`, `path.posix.join` etc and the [slash](https://ghub.io/slash) module, if you need forward slashes - like for constructing URLs - or ensure your code works with either.
3. Bash: Not every Windows developer has a terminal that fully supports Bash, so it's generally preferred to write [scripts](/script) in JavaScript instead of Bash.
4. Filename too long error: There is a 260 character limit for a filename when Git is compiled with `msys`. While the suggestions below are not guaranteed to work and could cause other issues, a few workarounds include:
    - Update Git configuration: `git config --system core.longpaths true`
    - Consider using a different Git client on Windows