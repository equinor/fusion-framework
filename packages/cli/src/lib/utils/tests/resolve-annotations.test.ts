import { beforeEach, describe, expect, it, vi } from 'vitest';
import { version } from '../../../version.js';

vi.mock('../resolve-github-annotations.js', () => ({
  resolveGithubAnnotations: vi.fn(),
}));

vi.mock('../resolve-devops-annotations.js', () => ({
  resolveDevopsAnnotations: vi.fn(),
}));

vi.mock('../resolve-git-branch.js', () => ({
  resolveGitBranch: vi.fn(),
}));

import { resolveAnnotations } from '../resolve-annotations.js';
import { resolveGithubAnnotations } from '../resolve-github-annotations.js';
import { resolveDevopsAnnotations } from '../resolve-devops-annotations.js';
import { resolveGitBranch } from '../resolve-git-branch.js';

const mockResolveGithubAnnotations = vi.mocked(resolveGithubAnnotations);
const mockResolveDevopsAnnotations = vi.mocked(resolveDevopsAnnotations);
const mockResolveGitBranch = vi.mocked(resolveGitBranch);

describe('resolveAnnotations', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    vi.stubEnv('GITHUB_ACTIONS', 'false');
  });

  it('includes the current branch for local builds', () => {
    mockResolveGitBranch.mockReturnValue('feature/local-branch');

    expect(resolveAnnotations()).toEqual({
      cliVersion: version,
      source: 'local',
      reason: 'manual',
      branch: 'feature/local-branch',
    });
  });

  it('should have undefined branch for local builds outside git', () => {
    mockResolveGitBranch.mockReturnValue(undefined);

    expect(resolveAnnotations()).toEqual({
      cliVersion: version,
      source: 'local',
      reason: 'manual',
      branch: undefined,
    });
  });

  it('keeps pull request branch resolution in GitHub Actions', () => {
    vi.stubEnv('GITHUB_ACTIONS', 'true');
    mockResolveGithubAnnotations.mockReturnValue({
      eventName: 'pull_request',
      workflow: 'test-workflow',
      runId: '123',
      runUrl: 'https://github.com/org/repo/actions/runs/123',
      actor: 'octocat',
      sender: { login: 'octocat', avatar_url: 'https://avatars.githubusercontent.com/u/1' },
      repository: {
        name: 'repo',
        homepage: 'https://repo.example.com',
        license: { name: 'MIT' },
        owner: { login: 'org', avatar_url: 'https://avatars.githubusercontent.com/u/2' },
      },
      head_commit: { id: 'head-commit' },
      pull_request: {
        head: { ref: 'feature/pr-branch', sha: 'pr-sha' },
        html_url: 'https://github.com/org/repo/pull/1',
      },
    });

    expect(resolveAnnotations()).toMatchObject({
      cliVersion: version,
      source: 'github',
      reason: 'pull_request',
      workflow: 'test-workflow',
      runId: '123',
      runUrl: 'https://github.com/org/repo/actions/runs/123',
      actor: 'octocat',
      sender_login: 'octocat',
      branch: 'feature/pr-branch',
      commitId: 'pr-sha',
      htmlUrl: 'https://github.com/org/repo/pull/1',
      repository: 'repo',
    });
  });

  it('extracts branch from GitHub push refs', () => {
    vi.stubEnv('GITHUB_ACTIONS', 'true');
    vi.stubEnv('GITHUB_REF', 'refs/heads/main');
    mockResolveGithubAnnotations.mockReturnValue({
      eventName: 'push',
      workflow: 'build',
      runId: '456',
      runUrl: 'https://github.com/org/repo/actions/runs/456',
      actor: 'octocat',
      head_commit: { id: 'push-sha' },
      repository: { name: 'repo' },
    });

    expect(resolveAnnotations()).toMatchObject({
      cliVersion: version,
      source: 'github',
      reason: 'push',
      branch: 'main',
      commitId: 'push-sha',
      repository: 'repo',
    });
  });

  it('does not treat tag refs as branches in GitHub Actions', () => {
    vi.stubEnv('GITHUB_ACTIONS', 'true');
    vi.stubEnv('GITHUB_REF', 'refs/tags/v1.0.0');
    mockResolveGithubAnnotations.mockReturnValue({
      eventName: 'release',
      workflow: 'release',
      runId: '789',
      runUrl: 'https://github.com/org/repo/actions/runs/789',
      actor: 'octocat',
      repository: { name: 'repo' },
      release: {
        tag_name: 'v1.0.0',
        html_url: 'https://github.com/org/repo/releases/tag/v1.0.0',
      },
    });

    const annotations = resolveAnnotations();

    expect(annotations).toMatchObject({
      cliVersion: version,
      source: 'github',
      reason: 'release',
      tag: 'v1.0.0',
      htmlUrl: 'https://github.com/org/repo/releases/tag/v1.0.0',
    });
    expect(annotations.branch).toBeUndefined();
  });

  it('passes through Azure DevOps branch annotations', () => {
    vi.stubEnv('SYSTEM_TEAMPROJECT', 'fusion');
    mockResolveDevopsAnnotations.mockReturnValue({
      reason: 'Manual',
      repository: 'fusion-framework',
      project: 'fusion',
      orgUrl: 'https://dev.azure.com/org/',
      runId: '42',
      runUrl: 'https://dev.azure.com/org/project/_build/results?buildId=42',
      actor: 'devops-username',
      branch: 'refs/heads/main',
      commitId: 'devops-sha',
      pipelineName: 'build-app',
    });

    expect(resolveAnnotations()).toEqual({
      cliVersion: version,
      source: 'azure_devops',
      reason: 'Manual',
      repository: 'fusion-framework',
      runId: '42',
      runUrl: 'https://dev.azure.com/org/project/_build/results?buildId=42',
      actor: 'devops-username',
      branch: 'refs/heads/main',
      commitId: 'devops-sha',
      workflow: 'build-app',
    });
  });
});
