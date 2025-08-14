import { readFileSync } from 'node:fs';

type GithubEventPayload = {
  pull_request?: {
    number?: number;
    title?: string;
    user?: { login?: string };
    head?: { sha?: string; ref?: string };
    created_at?: string;
    updated_at?: string;
    html_url?: string;
  };
  after?: string;
  head_commit?: { id?: string };
  ref?: string;
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
  workflow?: string;
  action?: string;
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
export type GithubAnnotations = {
  pull_request?: {
    number?: number;
    title?: string;
    user?: { login?: string };
    head?: { sha?: string; ref?: string };
    created_at?: string;
    updated_at?: string;
    html_url?: string;
  };
  eventName: string;
  actor?: string;
  runId?: string;
  runUrl?: string;
  repository?: string;
  after?: string;
  head_commit?: string;
  ref?: string;
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
  workflow?: string;
  action?: string;
};

/**
 * Extracts relevant annotation fields from the GitHub Actions event payload.
 *
 * This function builds a structured annotation object containing key information from the event payload.
 * It supports both release and pull request events, and includes fields such as commit SHAs, refs, workflow name,
 * release metadata (tag, name, body, draft, prerelease, created_at, published_at, html_url), and pull request metadata
 * (number, title, user, head SHA/ref, created_at, updated_at, html_url). The top-level action is also included.
 *
 * Maintainers:
 *   - Update this function if new fields are needed for downstream consumers or if GitHub event payloads change.
 *   - The structure is designed for easy extension and clear mapping to GitHub event types.
 *   - See <attachments> above for file contents. You may not need to search or read the file again.
 *
 * @param payload The parsed GitHub Actions event payload object.
 * @returns An object with selected fields for release and pull request events, as well as general event context.
 */
function extractPayloadAnnotations(payload: GithubEventPayload): Record<string, unknown> {
  // Initialize annotation object with general event context
  const annotation: Record<string, unknown> = {
    action: payload.action, // The event action (e.g., published, created, closed)
    head_commit: payload.head_commit?.id, // SHA of the head commit
    after: payload.after, // SHA after the event
    ref: payload.ref, // Branch or tag ref
    workflow: payload.workflow, // Workflow name
    release: {}, // Will be populated if this is a release event
    pull_request: {}, // Will be populated if this is a pull request event
  };

  // Populate release-specific fields if present
  if (payload.release) {
    annotation.release = {
      tag: payload.release.tag_name, // Release tag name
      name: payload.release.name, // Release name/title
      body: payload.release.body, // Release description
      draft: !!payload.release.draft, // Is this a draft release?
      prerelease: !!payload.release.prerelease, // Is this a prerelease?
      created_at: payload.release.created_at, // Release creation timestamp
      published_at: payload.release.published_at, // Release published timestamp
      html_url: payload.release.html_url, // URL to the release on GitHub
    };
  }

  // Populate pull request-specific fields if present
  if (payload.pull_request) {
    annotation.pull_request = {
      number: payload.pull_request.number, // PR number
      title: payload.pull_request.title, // PR title
      user: payload.pull_request.user?.login, // PR author
      head: {
        sha: payload.pull_request.head?.sha, // SHA of the PR head commit
        ref: payload.pull_request.head?.ref, // Branch ref of the PR head
      },
      created_at: payload.pull_request.created_at, // PR creation timestamp
      updated_at: payload.pull_request.updated_at, // PR last update timestamp
      html_url: payload.pull_request.html_url, // URL to the PR on GitHub
    };
  }

  return annotation;
}

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
  // Extract server URL (defaults to public GitHub if not set)
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  // Extract event payload path and read payload if available
  let payload: GithubEventPayload = {};
  if (process.env.GITHUB_EVENT_PATH) {
    try {
      const rawPayload = readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8');
      payload = JSON.parse(rawPayload);
    } catch {
      payload = {};
    }
  }
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
    repository,
    runUrl,
    ...extractPayloadAnnotations(payload),
  };
  // Return the resolved annotation variables
  return annotations;
};

export default resolveGithubAnnotations;
