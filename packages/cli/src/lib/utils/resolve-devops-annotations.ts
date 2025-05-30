/**
 * Resolves Azure DevOps-specific annotation variables from environment variables.
 *
 * This function extracts relevant build and repository information from Azure DevOps environment variables.
 * It constructs a set of annotation variables that can be used for reporting or logging purposes in CI/CD pipelines.
 *
 * @returns {Record<string, string>} An object containing Azure DevOps annotation variables such as runId, repository,
 * project, orgUrl, actor, branch, commitId, and runUrl. If a variable is not found, its value defaults to 'unknown'.
 *
 * Environment variables used by this function (see: https://learn.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-pipelines&tabs=yaml):
 *   - BUILD_BUILDID: Unique build/run identifier
 *   - BUILD_REPOSITORY_NAME: Repository name
 *   - SYSTEM_TEAMPROJECT: Project name
 *   - SYSTEM_COLLECTIONURI: Organization URL
 *   - BUILD_REQUESTEDFOR: User who requested the build
 *   - BUILD_SOURCEBRANCH: Source branch name
 *   - BUILD_SOURCEVERSION: Commit SHA
 *
 * Notes for maintainers:
 *   - If any environment variable is missing, its value defaults to 'unknown'.
 *   - The runUrl is constructed only if orgUrl, project, and runId are available; otherwise, it is set to 'unknown'.
 *   - If you need additional Azure DevOps context, refer to the official documentation and add new variables here.
 *   - Some variables may contain sensitive information. Use caution when logging or exposing these values.
 *
 * Extending this function:
 *   - To add more annotations, extract additional environment variables as needed and include them in the returned object.
 *   - For custom pipelines or self-hosted agents, verify that all required environment variables are available.
 */
export const resolveAnnotations = (): Record<string, string> => {
  // Extract Azure DevOps build and repository information from environment variables
  const runId = process.env.BUILD_BUILDID || 'unknown'; // Unique build/run identifier
  const repository = process.env.BUILD_REPOSITORY_NAME || 'unknown'; // Repository name
  const project = process.env.SYSTEM_TEAMPROJECT || 'unknown'; // Project name
  const orgUrl = process.env.SYSTEM_COLLECTIONURI || 'unknown'; // Organization URL
  const actor = process.env.BUILD_REQUESTEDFOR || 'unknown'; // User who requested the build
  const branch = process.env.BUILD_SOURCEBRANCH || 'unknown'; // Source branch name
  const commitId = process.env.BUILD_SOURCEVERSION || 'unknown'; // Commit SHA

  // Construct a direct URL to the build results if all required parts are available
  let runUrl = 'unknown';
  if (orgUrl !== 'unknown' && project !== 'unknown' && runId !== 'unknown') {
    // Remove trailing slash from orgUrl if present, then build the run results URL
    runUrl = `${orgUrl.replace(/\/$/, '')}${project}/_build/results?buildId=${runId}`;
  }

  // Aggregate all annotation variables into a single object for easy consumption
  const annotations: Record<string, string> = {
    runId,
    repository,
    project,
    orgUrl,
    actor,
    branch,
    commitId,
    runUrl,
  };

  // Return the resolved annotation variables
  return annotations;
};

export default resolveAnnotations;
