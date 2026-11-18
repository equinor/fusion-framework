import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => vi.unstubAllEnvs());

describe('production bootstrap', () => {
  it.each(['../src/html/webkit/bootstrap-feature-compatibility.ts', '../dist/html/bootstrap.js'])(
    'does not activate OTLP from %s when only the dev-server variable is supplied',
    async (entry) => {
      vi.stubEnv('NODE_ENV', 'production');
      vi.stubEnv('FUSION_DEV_SERVER_OTLP_ENDPOINT', 'http://localhost:4318');
      const result = await build({
        configFile: false,
        build: {
          write: false,
          minify: false,
          target: 'esnext',
          rollupOptions: {
            input: fileURLToPath(new URL(entry, import.meta.url)),
            external: /^@equinor\//,
          },
        },
        logLevel: 'silent',
      });
      // Inspect final output chunks rather than a background watcher.
      // The watch-build API returns an event emitter without complete chunk contents.
      if ('on' in result) {
        throw new Error('Unexpected watch build');
      }
      const outputs = Array.isArray(result) ? result : [result];
      let code = '';
      let entryCode = '';
      // Include every generated chunk so detached OTLP code cannot escape the assertion.
      for (const output of outputs) {
        // Each output can contain executable chunks and non-executable assets.
        for (const chunk of output.output) {
          // Only JavaScript can configure telemetry at runtime.
          if (chunk.type === 'chunk') {
            code += chunk.code;
            // Parser-safety assertions apply to the public entry, not its lazy native chunk.
            if (chunk.isEntry) {
              entryCode += chunk.code;
            }
          }
        }
      }
      expect(code.includes('OtlpAdapter'), 'OTLP adapter is absent').toBe(false);
      expect(code.includes('BatchLogRecordProcessor'), 'OTLP processor is absent').toBe(false);
      expect(code.includes('enableDevServerTracing'), 'browser tracing setup is absent').toBe(
        false,
      );
      expect(code.includes('WebTracerProvider'), 'browser tracer SDK is absent').toBe(false);
      expect(code.includes('/@fusion-telemetry/v1/logs'), 'dev-server route is absent').toBe(false);
      // The public entry must stay parseable while the selected branch loads lazily.
      expect(
        entryCode,
        'bootstrap dispatcher must not require explicit resource syntax',
      ).not.toMatch(/^\s*(?:await\s+)?using\s+\w+\s*=/m);
    },
  );
});
