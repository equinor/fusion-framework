import { readFileSync } from 'node:fs';

/**
 * Represents the payload structure for various GitHub webhook events.
 *
 * This type covers common fields found in GitHub event payloads, such as push, pull request,
 * workflow, and release events. All properties are optional to accommodate the differences
 * between event types.
 *
 * @remarks only some are mapped to the GitHub API event types.
 *
 * @property after - The SHA of the most recent commit on the ref after the event.
 * @property head_commit - Information about the head commit, including its SHA.
 * @property ref - The Git ref (branch or tag) that triggered the event.
 * @property workflow - The name of the workflow (for workflow-related events).
 * @property action - The action performed (e.g., "opened", "closed", "created").
 * @property repository - Information about the repository where the event occurred.
 * @property pull_request - Details about the pull request (for pull request events).
 * @property release - Details about the release (for release events).
 * @property sender - Information about the user who triggered the event.
 */
type GithubEventPayload = {
  after?: string;
  head_commit?: { id?: string };
  ref?: string;
  workflow?: string;
  action?: string;
  repository?: {
    owner?: {
      login?: string;
      avatar_url?: string;
    };
    name?: string;
    license?: { name?: string };
    homepage?: string;
  };
  pull_request?: {
    number?: number;
    title?: string;
    head?: { sha?: string; ref?: string };
    created_at?: string;
    updated_at?: string;
    html_url?: string;
  };
  release?: {
    tag_name?: string;
    name?: string;
    body?: string;
    draft?: boolean;
    prerelease?: boolean;
    created_at?: string;
    published_at?: string;
    html_url?: string;
  };
  sender?: {
    login?: string;
    avatar_url?: string;
  };
};

/**
 * Represents metadata and contextual information related to GitHub Actions workflows,
 * pull requests, commits, releases, and associated actors.
 *
 * @property pull_request - Information about the pull request associated with the workflow run.
 * @property pull_request.number - The pull request number.
 * @property pull_request.title - The title of the pull request.
 * @property pull_request.user - The user who created the pull request.
 * @property pull_request.user.login - The login name of the pull request creator.
 * @property pull_request.head - The head commit information of the pull request.
 * @property pull_request.head.sha - The SHA of the head commit.
 * @property pull_request.head.ref - The reference name of the head commit.
 * @property pull_request.created_at - The creation timestamp of the pull request.
 * @property pull_request.updated_at - The last update timestamp of the pull request.
 * @property pull_request.html_url - The URL to view the pull request on GitHub.
 * @property actor - The GitHub username of the actor who triggered the workflow.
 * @property runId - The unique identifier of the workflow run.
 * @property runUrl - The URL to view the workflow run on GitHub.
 * @property repository - The full name of the repository (e.g., "owner/repo").
 * @property after - The SHA of the commit after the workflow run.
 * @property head_commit - Information about the head commit.
 * @property head_commit.id - The SHA of the head commit.
 * @property ref - The Git reference (e.g., "refs/heads/main").
 * @property release - Information about the release associated with the workflow run.
 * @property release.tag_name - The tag name of the release.
 * @property release.name - The name of the release.
 * @property release.body - The body or description of the release.
 * @property release.draft - Indicates if the release is a draft.
 * @property release.prerelease - Indicates if the release is a prerelease.
 * @property release.created_at - The creation timestamp of the release.
 * @property release.published_at - The publication timestamp of the release.
 * @property release.html_url - The URL to view the release on GitHub.
 * @property workflow - The name of the workflow.
 * @property action - The name of the action being executed.
 */
export type GithubAnnotations = GithubEventPayload & {
  workflow?: string;
  action?: string;
  eventName: string;
  actor?: string;
  runId?: string;
  runUrl?: string;
};

/**
 * Resolves GitHub Actions-specific annotation variables from environment variables.
 *
 * This function extracts relevant workflow and repository information from GitHub Actions environment variables.
 * It constructs a set of annotation variables that can be used for reporting or logging purposes in CI/CD pipelines.
 *
 * @returns {Record<string, string>} An object containing GitHub Actions annotation variables such as eventName, actor,
 * payload, runId, repository, and runUrl. If a variable is not found, its value defaults to 'unknown'.
 *
 * Environment variables used by this function (see: https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables):
 *   - GITHUB_EVENT_NAME: Name of the event that triggered the workflow
 *   - GITHUB_ACTOR: Username of the person or app that initiated the workflow
 *   - GITHUB_RUN_ID: Unique identifier for the workflow run
 *   - GITHUB_REPOSITORY: Repository in the format owner/repo
 *   - GITHUB_SERVER_URL: Base URL of the GitHub server (defaults to https://github.com)
 *   - GITHUB_EVENT_PATH: Path to the event payload file (JSON)
 *   - GITHUB_WORKFLOW: Name of the workflow
 *
 * Notes for maintainers:
 *   - The event payload can be large; consider truncating or parsing if only specific fields are needed.
 *   - If reading the payload fails, the function returns a fallback string. Adjust error handling as needed for your use case.
 *   - If you need additional GitHub Actions context, refer to the official documentation and add new variables here.
 *   - The payload and other fields may contain sensitive information. Use caution when logging or exposing these values.
 *
 * Extending this function:
 *   - To add more annotations, extract additional environment variables as needed and include them in the returned object.
 *   - For custom workflows or self-hosted runners, verify that all required environment variables are available.
 */
export const resolveGithubAnnotations = (): GithubAnnotations => {
  // Extract event name from environment
  const eventName = process.env.GITHUB_EVENT_NAME || 'unknown';
  // Extract actor (user who triggered the workflow)
  const actor = process.env.GITHUB_ACTOR || 'unknown';
  // Extract run ID
  const runId = process.env.GITHUB_RUN_ID || 'unknown';
  // Extract repository in the format owner/repo
  const repository = process.env.GITHUB_REPOSITORY || 'unknown';

  // Extract workflow name
  const workflow = process.env.GITHUB_WORKFLOW || 'unknown';

  // Extract server URL (defaults to public GitHub if not set)
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';

  // Construct a direct URL to the workflow run if all required parts are available
  let runUrl = 'unknown';
  if (serverUrl && repository !== 'unknown' && runId !== 'unknown') {
    // Remove trailing slash from serverUrl if present, then build the run results URL
    runUrl = `${serverUrl.replace(/\/$/, '')}/${repository}/actions/runs/${runId}`;
  }
  // Aggregate all annotation variables into a single object for easy consumption
  const annotations: GithubAnnotations = {
    eventName,
    actor,
    runId,
    runUrl,
    workflow,
  };

  // Apply event payload to annotations
  if (process.env.GITHUB_EVENT_PATH) {
    try {
      const rawPayload = readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8');
      Object.assign(annotations, JSON.parse(rawPayload));
    } catch {
      console.error('Failed to parse GitHub event payload');
    }
  }
  // Return the resolved annotation variables
  return annotations;
};

export default resolveGithubAnnotations;
