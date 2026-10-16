// @vitest-environment node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

import { evaluateRouteRegistry } from '../build/evaluate-route-registry.js';

/** Runs a process and resolves with its output, rejecting on a non-zero exit. */
const run = promisify(execFile);

/**
 * Counts live worker handles, which must return to the baseline after every evaluation.
 *
 * @returns Number of active worker resources.
 */
const activeWorkers = (): number =>
  process.getActiveResourcesInfo().filter((resource) => resource.includes('Worker')).length;

describe('evaluateRouteRegistry', () => {
  it('returns a plain-data projection of the default export', async () => {
    const definition = await evaluateRouteRegistry(
      "export default [{ kind: 'route', path: 'a', file: '/a.tsx', handle: { route: { description: 'A', loader: () => 1 } }, extra: () => 1 }];",
    );

    expect(definition).toEqual([
      { kind: 'route', path: 'a', file: '/a.tsx', handle: { route: { description: 'A' } } },
    ]);
  });

  it('evaluates when the host process runs with ESM-only exec arguments', async () => {
    // Workers inherit execArgv, so an ESM host must not change how the worker body is parsed
    const source = new URL('../build/evaluate-route-registry.ts', import.meta.url).href;
    const script = `const { evaluateRouteRegistry } = await import(${JSON.stringify(source)});
console.log(JSON.stringify(await evaluateRouteRegistry("export default [{ kind: 'route' }];")));`;

    const { stdout } = await run(process.execPath, ['--input-type=module', '-e', script]);

    expect(JSON.parse(stdout)).toEqual([{ kind: 'route', handle: { route: {} } }]);
  });

  it('rejects with the thrown message and releases the worker', async () => {
    const baseline = activeWorkers();

    await expect(evaluateRouteRegistry("throw new Error('registry exploded');")).rejects.toThrow(
      'registry exploded',
    );
    expect(activeWorkers()).toBe(baseline);
  });

  it('terminates a registry that never finishes once the timeout elapses', async () => {
    const baseline = activeWorkers();
    const started = Date.now();

    await expect(evaluateRouteRegistry('while (true) {}', 200)).rejects.toThrow(
      'evaluation did not finish within 200 ms',
    );
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(activeWorkers()).toBe(baseline);
  });

  it('rejects when the registry exits the worker before reporting', async () => {
    const baseline = activeWorkers();

    await expect(evaluateRouteRegistry('process.exit(3);')).rejects.toThrow(
      'evaluation worker exited with code 3 before reporting',
    );
    await expect(evaluateRouteRegistry('await new Promise(() => {});', 2_000)).rejects.toThrow();
    expect(activeWorkers()).toBe(baseline);
  });
});
