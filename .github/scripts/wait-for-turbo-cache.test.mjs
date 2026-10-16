import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { resolveCacheSha, waitForTurboCache } from './wait-for-turbo-cache.mjs';

const sha = 'a'.repeat(40);
const key = `turbo-fusion-v1-Linux-lockfile-${sha}`;
const runUrl = 'https://github.com/test/repo/actions/runs/42';
const success = { id: 42, status: 'completed', conclusion: 'success', html_url: runUrl };
const producer = { name: 'Save pnpm and Turbo caches', status: 'completed', conclusion: 'success' };
const cache = { key, ref: 'refs/heads/main' };

function fixture({ runs = [success], jobs, caches = [cache], apiError } = {}) {
  let time = 0;
  let polls = 0;
  let currentRun;
  const calls = [];
  const sleeps = [];
  return {
    calls,
    sleeps,
    options: {
      sha,
      repository: 'test/repo',
      now: () => time,
      sleep: async (duration) => {
        sleeps.push(duration);
        time += duration;
      },
      log: () => {},
      api: async (path) => {
        calls.push(path);
        if (apiError) throw apiError;
        if (path.startsWith('/actions/workflows/')) {
          const run = runs[Math.min(polls++, runs.length - 1)];
          currentRun = run;
          return { workflow_runs: run ? [run] : [] };
        }
        if (path.startsWith('/actions/runs/')) {
          return {
            jobs:
              typeof jobs === 'function'
                ? jobs(path)
                : (jobs ?? [
                    { ...producer, status: currentRun.status, conclusion: currentRun.conclusion },
                  ]),
          };
        }
        return { actions_caches: typeof caches === 'function' ? caches(path) : caches };
      },
    },
  };
}

test('returns the exact main cache only after its prime succeeds', async () => {
  const { options, calls, sleeps } = fixture();
  assert.equal(await waitForTurboCache(options), key);
  assert.match(calls[0], new RegExp(`branch=main&head_sha=${sha}`));
  assert.match(calls[1], /\/actions\/runs\/42\/jobs/);
  assert.match(calls[2], /ref=refs\/heads\/main&key=turbo-fusion-v1-Linux-/);
  assert.deepEqual(sleeps, []);
});

test('waits for queued and running primes even when a cache is already present', async () => {
  const { options, calls, sleeps } = fixture({
    runs: [
      { status: 'queued', html_url: runUrl },
      { status: 'in_progress', html_url: runUrl },
      success,
    ],
  });
  assert.equal(await waitForTurboCache(options), key);
  assert.deepEqual(sleeps, [15_000, 15_000]);
  assert.equal(calls.filter((path) => path.startsWith('/actions/caches')).length, 1);
});

test('waits for a newly dispatched prime to become visible', async () => {
  const { options, sleeps } = fixture({ runs: [undefined, success] });
  assert.equal(await waitForTurboCache(options), key);
  assert.deepEqual(sleeps, [15_000]);
});

for (const conclusion of ['failure', 'cancelled', 'timed_out', 'skipped']) {
  test(`fails explicitly for a ${conclusion} prime and links to it`, async () => {
    const { options, calls } = fixture({ runs: [{ ...success, conclusion }] });
    await assert.rejects(waitForTurboCache(options), (error) => {
      assert.ok(error.message.includes(conclusion));
      assert.ok(error.message.includes(runUrl));
      return true;
    });
    assert.equal(calls.length, 2);
  });
}

test('rejects older commits, other operating systems, and PR-scoped caches', async () => {
  const { options, sleeps } = fixture({
    caches: [
      { key: 'turbo-fusion-v1-Linux-lockfile-older-sha', ref: 'refs/heads/main' },
      { key: key.replace('Linux', 'Windows'), ref: 'refs/heads/main' },
      { key, ref: 'refs/pull/1/merge' },
    ],
  });
  await assert.rejects(waitForTurboCache(options), /missing.*possibly evicted.*Rerun/);
  assert.equal(
    sleeps.reduce((sum, duration) => sum + duration, 0),
    60_000,
  );
});

for (const status of ['in_progress', 'completed']) {
  test(`uses a successful producer's cache while unrelated workflow jobs are ${status}`, async () => {
    const { options, sleeps } = fixture({
      runs: [{ ...success, status, conclusion: status === 'completed' ? 'failure' : null }],
      jobs: [
        { name: 'Save Playwright cache (macos-latest)', status, conclusion: 'failure' },
        producer,
      ],
    });
    assert.equal(await waitForTurboCache(options), key);
    assert.deepEqual(sleeps, []);
  });
}

test('fails immediately when the producer fails while unrelated jobs are running', async () => {
  const { options, sleeps } = fixture({
    runs: [{ ...success, status: 'in_progress', conclusion: null }],
    jobs: [{ ...producer, conclusion: 'failure' }],
  });
  await assert.rejects(waitForTurboCache(options), /Turbo cache producer.*failure/);
  assert.deepEqual(sleeps, []);
});

test('fails immediately when a completed workflow has no producer', async () => {
  const { options, sleeps } = fixture({ jobs: [] });
  await assert.rejects(waitForTurboCache(options), /without a successful Turbo cache producer/);
  assert.deepEqual(sleeps, []);
});

test('waits for the producer job to become visible', async () => {
  let queries = 0;
  const { options, sleeps } = fixture({
    runs: [{ ...success, status: 'in_progress' }],
    jobs: () => (++queries === 1 ? [] : [producer]),
  });
  assert.equal(await waitForTurboCache(options), key);
  assert.deepEqual(sleeps, [15_000]);
});

test('paginates jobs to find the Turbo producer', async () => {
  const { options } = fixture({
    jobs: (path) =>
      path.endsWith('page=1')
        ? Array.from({ length: 100 }, () => ({ name: 'Other job' }))
        : [producer],
  });
  assert.equal(await waitForTurboCache(options), key);
});

test('times out after exactly 10 minutes for a missing prime and links to the workflow', async () => {
  const { options, sleeps } = fixture({ runs: [undefined] });
  await assert.rejects(
    waitForTurboCache(options),
    /Timed out waiting 10 minutes.*actions\/workflows\/prime-pnpm-cache.yml/,
  );
  assert.equal(sleeps.length, 40);
  assert.equal(
    sleeps.reduce((sum, duration) => sum + duration, 0),
    600_000,
  );
});

test('times out for an unfinished prime with its run link', async () => {
  const { options } = fixture({ runs: [{ status: 'in_progress', html_url: runUrl }] });
  await assert.rejects(waitForTurboCache(options), (error) => error.message.includes(runUrl));
});

test('waits for cache visibility after successful priming', async () => {
  let queries = 0;
  const { options, sleeps } = fixture({ caches: () => (++queries === 1 ? [] : [cache]) });
  assert.equal(await waitForTurboCache(options), key);
  assert.deepEqual(sleeps, [15_000]);
});

test('paginates cache results instead of treating the first page as exhaustive', async () => {
  const { options } = fixture({
    caches: (path) =>
      path.endsWith('page=1')
        ? Array.from({ length: 100 }, () => ({ key: 'other', ref: 'refs/heads/main' }))
        : [cache],
  });
  assert.equal(await waitForTurboCache(options), key);
});

test('surfaces GitHub API failures instead of falling back to an older cache', async () => {
  const error = new Error('GitHub API 403');
  const { options } = fixture({ apiError: error });
  await assert.rejects(waitForTurboCache(options), (failure) => {
    assert.equal(failure.cause, error);
    assert.match(failure.message, /GitHub API 403.*actions\/workflows\/prime-pnpm-cache.yml/);
    return true;
  });
});

test('does not report a short API timeout as a 10-minute cache wait', async () => {
  const error = new DOMException('Request timed out', 'TimeoutError');
  const { options } = fixture({ apiError: error });
  await assert.rejects(waitForTurboCache(options), (failure) => {
    assert.equal(failure.cause, error);
    assert.doesNotMatch(failure.message, /Timed out waiting 10 minutes/);
    return true;
  });
});

test('includes API request time in the 10-minute deadline', async () => {
  let time = 0;
  await assert.rejects(
    waitForTurboCache({
      repository: 'test/repo',
      sha,
      now: () => time,
      api: async (_path, signal) => {
        assert.ok(signal instanceof AbortSignal);
        time = 600_000;
        return { workflow_runs: [success] };
      },
    }),
    /Timed out waiting 10 minutes/,
  );
});

test('pins the event base SHA for PRs targeting main', async () => {
  assert.equal(
    await resolveCacheSha({ pull_request: { base: { ref: 'main', sha } } }, async () => {
      assert.fail('Main-targeting PRs must not resolve a newer main commit.');
    }),
    sha,
  );
});

test('uses the dispatched PR main base rather than the dispatch workflow SHA', async () => {
  const calls = [];
  assert.equal(
    await resolveCacheSha({ inputs: { pr_number: 456 } }, async (path) => {
      calls.push(path);
      return { base: { ref: 'main', sha } };
    }),
    sha,
  );
  assert.deepEqual(calls, ['/pulls/456']);
});

test('resolves dispatched PR checks and pins main once for stacked PRs', async () => {
  const calls = [];
  const result = await resolveCacheSha({ inputs: { pr_number: 123 } }, async (path) => {
    calls.push(path);
    return path === '/pulls/123' ? { base: { ref: 'feature/parent' } } : { sha };
  });
  assert.equal(result, sha);
  assert.deepEqual(calls, ['/pulls/123', '/commits/main']);
});

test('rejects dispatches without a PR number', async () => {
  await assert.rejects(
    resolveCacheSha({}, async () => {}),
    /pr_number/,
  );
});

test('all PR jobs require an exact restore and Windows cannot use the Linux cache', () => {
  const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
  const pr = read('../workflows/pr.yml');
  const visual = read('../workflows/visual-checks.yml');
  const setup = read('../actions/node-setup/action.yml');
  assert.equal(pr.match(/wait-for-turbo-cache: 'true'/g)?.length, 3);
  assert.match(pr, /actions: read/);
  assert.match(visual, /actions: read/);
  assert.match(visual, /cache-turbo: \$\{\{ runner.os == 'Linux' && 'true' \|\| 'false' \}\}/);
  assert.match(visual, /wait-for-turbo-cache: 'true'/);
  const exact = setup
    .split('- name: Restore exact PR Turbo cache')[1]
    .split('- name: Restore Turbo cache')[0];
  assert.match(exact, /key: \$\{\{ steps.turbo-cache-ready.outputs.key \}\}/);
  assert.match(exact, /fail-on-cache-miss: true/);
  assert.doesNotMatch(exact, /restore-keys:/);
  assert.match(setup, /if: inputs.cache-turbo == 'true' && inputs.wait-for-turbo-cache != 'true'/);
});
