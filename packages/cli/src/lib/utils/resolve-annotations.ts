import { resolveGithubAnnotations } from './resolve-github-annotations.js';
import { resolveDevopsAnnotations } from './resolve-devops-annotations.js';

/**
 * Represents metadata annotations related to a release process.
 *
 * @property source - The origin or system that triggered the release.
 * @property reason - The reason or context for the release.
 * @property [repository] - The repository associated with the release, if applicable.
 * @property [actor] - The user or system that initiated the release.
 * @property [workflow] - The workflow or pipeline responsible for the release.
 * @property [runId] - The unique identifier for the workflow run.
 * @property [branch] - The branch from which the release was made.
 * @property [commitId] - The commit hash associated with the release.
 * @property [runUrl] - The URL to the workflow run details.
 * @property [htmlUrl] - The URL to the release or related resource in a web interface.
 * @property [tag] - The tag name associated with the release.
 */
export type ReleaseAnnotations = {
  source: string;
  reason: string;
  repository?: string;
  actor?: string;
  workflow?: string;
  runId?: string;
  branch?: string;
  commitId?: string;
  runUrl?: string;
  htmlUrl?: string;
  tag?: string;
};

/**
 * Resolves CI/CD environment-specific annotation variables.
 *
 * This function determines the current CI/CD runtime environment (GitHub Actions, Azure DevOps, or other)
 * and returns a set of annotation variables relevant to that environment. These annotations are typically
 * used for reporting build, test, or deployment results in a way that is compatible with the CI/CD provider's UI.
 *
 * @returns {Record<string, string>} An object containing annotation variables for the detected environment.
 * If no known environment is detected, returns an empty object.
 */
export const resolveAnnotations = (): ReleaseAnnotations | undefined => {
  // Check if running in GitHub Actions environment
  // If so, delegate to the GitHub-specific annotation resolver
  if (process.env.GITHUB_ACTIONS) {
    const annotation = resolveGithubAnnotations();
    const baseAnnotations = {
      source: 'github',
      reason: annotation.eventName,
      workflow: annotation.workflow,
      repository: annotation.repository,
      runId: annotation.runId,
      runUrl: annotation.runUrl,
      actor: annotation.actor,
      commitId: annotation.head_commit,
    } satisfies ReleaseAnnotations;

    console.log('Extracted GitHub annotations:', annotation);

    if (annotation.pull_request) {
      return {
        ...baseAnnotations,
        branch: annotation.pull_request.head?.ref,
        commitId: annotation.pull_request.head?.sha,
        htmlUrl: annotation.pull_request.html_url,
      } satisfies ReleaseAnnotations;
    }

    if (annotation.release) {
      return {
        ...baseAnnotations,
        tag: annotation.release.tag,
        htmlUrl: annotation.release.html_url,
      } satisfies ReleaseAnnotations;
    }

    return baseAnnotations;
  }

  // Check if running in Azure DevOps environment
  // If so, delegate to the Azure DevOps-specific annotation resolver
  if (process.env.SYSTEM_TEAMPROJECT) {
    const annotations = resolveDevopsAnnotations();
    return {
      source: 'azure_devops',
      reason: annotations.reason,
      repository: annotations.repository,
      runId: annotations.runId,
      runUrl: annotations.runUrl,
      actor: annotations.actor,
      branch: annotations.branch,
      commitId: annotations.commitId,
      workflow: annotations.pipelineName,
    } satisfies ReleaseAnnotations;
  }
  // Fallback: No known CI/CD environment detected
  // Return an empty object to indicate no annotations are available
  return undefined;
};
