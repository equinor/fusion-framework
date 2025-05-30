import resolveGithubAnnotations from './resolve-github-annotations.js';
import resolveDevopsAnnotations from './resolve-devops-annotations.js';

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
export const resolveAnnotations = (): Record<string, string> => {
  // Check if running in GitHub Actions environment
  // If so, delegate to the GitHub-specific annotation resolver
  if (process.env.GITHUB_ACTIONS) {
    return resolveGithubAnnotations();
  }
  // Check if running in Azure DevOps environment
  // If so, delegate to the Azure DevOps-specific annotation resolver
  if (process.env.SYSTEM_TEAMPROJECT) {
    return resolveDevopsAnnotations();
  }
  // Fallback: No known CI/CD environment detected
  // Return an empty object to indicate no annotations are available
  return {};
};
