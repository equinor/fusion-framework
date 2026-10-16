import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { setTimeout } from 'node:timers/promises';

/**
 * Waits for the Linux producer job and its exact main-commit cache, independently
 * of unrelated jobs in the priming workflow.
 * Older cache entries are deliberately never accepted.
 */
export async function waitForTurboCache({
  api,
  sha,
  repository,
  now = Date.now,
  sleep = setTimeout,
  log = console.log,
}) {
  const deadline = now() + 600_000;
  const workflowUrl = `https://github.com/${repository}/actions/workflows/prime-pnpm-cache.yml`;
  let runUrl = workflowUrl;
  let cacheDeadline;
  const timeoutError = () =>
    new Error(`Timed out waiting 10 minutes for the Turbo cache for ${sha}: ${runUrl}`);
  const request = async (path) => {
    const remaining = deadline - now();
    if (remaining <= 0) throw timeoutError();
    const signal = AbortSignal.timeout(remaining);
    try {
      const result = await api(path, signal);
      if (now() >= deadline) throw timeoutError();
      return result;
    } catch (error) {
      if (now() >= deadline || signal.aborted) throw timeoutError();
      throw new Error(`Cannot check Turbo cache readiness: ${error.message}. ${runUrl}`, {
        cause: error,
      });
    }
  };

  while (now() < deadline) {
    const { workflow_runs: runs } = await request(
      `/actions/workflows/prime-pnpm-cache.yml/runs?branch=main&head_sha=${sha}&per_page=1`,
    );
    const run = runs[0];
    if (run) {
      runUrl = run.html_url;
      let producer;
      for (let page = 1; ; page++) {
        const { jobs } = await request(`/actions/runs/${run.id}/jobs?per_page=100&page=${page}`);
        producer = jobs.find(({ name }) => name === 'Save pnpm and Turbo caches');
        if (producer || jobs.length < 100) break;
      }
      if (producer?.status === 'completed' && producer.conclusion !== 'success') {
        throw new Error(`Turbo cache producer for ${sha} ${producer.conclusion}: ${runUrl}`);
      }
      if (producer?.status === 'completed') {
        // A finished producer cannot recreate an evicted cache; allow only a short
        // visibility grace period instead of spending the full priming deadline.
        cacheDeadline ??= now() + 60_000;
        for (let page = 1; ; page++) {
          const { actions_caches: caches } = await request(
            `/actions/caches?ref=refs/heads/main&key=turbo-fusion-v1-Linux-&per_page=100&page=${page}`,
          );
          const cache = caches.find(
            ({ key, ref }) =>
              ref === 'refs/heads/main' &&
              key.startsWith('turbo-fusion-v1-Linux-') &&
              key.endsWith(`-${sha}`),
          );
          if (cache) {
            log(`Using ${cache.key} from ${runUrl}`);
            return cache.key;
          }
          if (caches.length < 100) break;
        }
        if (now() >= cacheDeadline) {
          throw new Error(
            `Turbo cache for ${sha} is missing after its producer succeeded (possibly evicted). Rerun the priming workflow: ${runUrl}`,
          );
        }
        log(`Waiting for the exact Turbo cache for ${sha} to become visible: ${runUrl}`);
      } else {
        if (run.status === 'completed') {
          throw new Error(
            `Cache priming for ${sha} ${run.conclusion} without a successful Turbo cache producer. Rerun the priming workflow: ${runUrl}`,
          );
        }
        log(
          `Waiting for the Turbo cache producer for ${sha} (${producer?.status ?? 'not yet visible'}): ${runUrl}`,
        );
      }
    } else {
      log(`Waiting for a cache priming run for ${sha}: ${runUrl}`);
    }
    await sleep(
      Math.min(15_000, Math.max(0, Math.min(deadline, cacheDeadline ?? deadline) - now())),
    );
  }
  throw timeoutError();
}

/** Pins the main commit whose cache is eligible for this PR, including dispatched checks. */
export async function resolveCacheSha(event, api) {
  const pr =
    event.pull_request ??
    (event.inputs?.pr_number ? await api(`/pulls/${event.inputs.pr_number}`) : undefined);
  if (!pr) throw new Error('Waiting for a PR cache requires a pull request or pr_number input.');
  if (pr.base.ref === 'main') return pr.base.sha;
  const main = await api('/commits/main');
  return main.sha;
}

async function main() {
  const { GITHUB_REPOSITORY: repository, GH_TOKEN: token } = process.env;
  if (!repository || !token) throw new Error('GITHUB_REPOSITORY and GH_TOKEN are required.');
  const api = async (path, signal) => {
    const response = await fetch(
      `${process.env.GITHUB_API_URL ?? 'https://api.github.com'}/repos/${repository}${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(30_000)])
          : AbortSignal.timeout(30_000),
      },
    );
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status} for ${path}; actions: read is required.`);
    }
    return response.json();
  };
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const sha = await resolveCacheSha(event, api);
  const key = await waitForTurboCache({ api, sha, repository });
  appendFileSync(process.env.GITHUB_OUTPUT, `key=${key}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  });
}
