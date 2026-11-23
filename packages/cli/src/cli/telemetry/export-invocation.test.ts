import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import { createServer, type Server } from 'node:https';
import type { AddressInfo } from 'node:net';
import { hostname, tmpdir } from 'node:os';
import { join } from 'node:path';
import { getCACertificates, setDefaultCACertificates } from 'node:tls';
import { gunzipSync } from 'node:zlib';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { exportInvocation, type InvocationRecord } from './export-invocation.js';

type Envelope = {
  name: string;
  iKey: string;
  tags: Record<string, string>;
  data: { baseType: string; baseData: Record<string, unknown> };
};

const record: InvocationRecord = {
  traceId: '0af7651916cd43dd8448eb211c80319c',
  spanId: 'b7ad6b7169203331',
  version: '1.2.3',
  command: 'app build',
  commandKind: 'builtin',
  optionNames: ['--env', '--token'],
  exitCode: 0,
  outcome: 'success',
  startTime: Date.UTC(2026, 0, 1, 12, 0, 0),
  endTime: Date.UTC(2026, 0, 1, 12, 0, 2),
  os: 'linux',
  arch: 'x64',
  nodeVersion: '24.0.0',
  ci: false,
  fusionEnvironment: 'ci',
  machineId: 'f'.repeat(64),
};

const servers: Server[] = [];

/** Throwaway localhost certificate; the Azure SDK pipeline only sends over TLS. */
const createCertificate = (): { key: Buffer; cert: Buffer } | undefined => {
  const dir = mkdtempSync(join(tmpdir(), 'ffc-telemetry-'));
  try {
    execFileSync(
      'openssl',
      [
        'req',
        '-x509',
        '-newkey',
        'rsa:2048',
        '-nodes',
        '-days',
        '1',
        '-subj',
        '/CN=localhost',
        '-addext',
        'subjectAltName=IP:127.0.0.1',
        '-keyout',
        join(dir, 'key.pem'),
        '-out',
        join(dir, 'cert.pem'),
      ],
      { stdio: 'ignore' },
    );
    return { key: readFileSync(join(dir, 'key.pem')), cert: readFileSync(join(dir, 'cert.pem')) };
  } catch {
    return undefined;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const tls = createCertificate();
const defaultCertificates = getCACertificates('default');

beforeAll(() => {
  // Trust the throwaway certificate in addition to the defaults; validation stays enabled.
  if (tls) setDefaultCACertificates([...defaultCertificates, tls.cert.toString()]);
});

afterAll(() => {
  setDefaultCACertificates(defaultCertificates);
});

/** Starts a fake ingestion endpoint; `respond` false leaves requests hanging. */
const startIngestion = async (respond = true): Promise<{ url: string; envelopes: Envelope[] }> => {
  const envelopes: Envelope[] = [];
  const server = createServer({ ...tls }, (req: IncomingMessage, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const text = (
        req.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body
      ).toString();
      const parsed: Envelope | Envelope[] = JSON.parse(text);
      envelopes.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      // Leave the connection open to exercise the export timeout path.
      if (!respond) return;
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ itemsReceived: 1, itemsAccepted: 1, errors: [] }));
    });
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { url: `https://127.0.0.1:${port}/`, envelopes };
};

const connectionString = (endpoint: string): string =>
  `InstrumentationKey=00000000-0000-0000-0000-000000000000;IngestionEndpoint=${endpoint}`;

afterEach(async () => {
  // Close every test server, including endpoints intentionally left hanging.
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

describe.skipIf(!tls)('exportInvocation', () => {
  it('sends exactly one safe request for the invocation and nothing else', async () => {
    const ingestion = await startIngestion();

    const result = await exportInvocation(record, {
      connectionString: connectionString(ingestion.url),
      timeoutMs: 5000,
    });

    expect(result).toBe('settled');
    expect(ingestion.envelopes).toHaveLength(1);
    const [envelope] = ingestion.envelopes;
    expect(envelope.data.baseType).toBe('RequestData');
    expect(envelope.tags['ai.operation.id']).toBe(record.traceId);
    expect(envelope.tags['ai.operation.name']).toBe('fusion-framework-cli app build');
    expect(envelope.tags['ai.cloud.role']).toBe('fusion-framework-cli');
    expect(envelope.tags['ai.cloud.roleInstance']).toBe(record.machineId);
    expect(envelope.tags['ai.location.ip']).toBe('0.0.0.0');
    expect(JSON.stringify(envelope)).not.toContain(hostname());
    expect(envelope.data.baseData).toMatchObject({
      id: record.spanId,
      success: true,
      duration: '00:00:02.000',
      properties: {
        tool: 'fusion-framework-cli',
        cliVersion: '1.2.3',
        command: 'app build',
        commandKind: 'builtin',
        options: '--env,--token',
        exitCode: '0',
        outcome: 'success',
        os: 'linux',
        arch: 'x64',
        nodeVersion: '24.0.0',
        ci: 'false',
        fusionEnvironment: 'ci',
        machineId: record.machineId,
      },
    });
    expect(Object.keys(envelope.data.baseData.properties as object).sort()).toEqual(
      [
        'arch',
        'ci',
        'cliVersion',
        'command',
        'commandKind',
        'exitCode',
        'fusionEnvironment',
        'machineId',
        'nodeVersion',
        'options',
        'os',
        'outcome',
        'tool',
      ].sort(),
    );
  });

  it('marks failed invocations with the exception type only', async () => {
    const ingestion = await startIngestion();

    await exportInvocation(
      { ...record, exitCode: 1, outcome: 'failure', exceptionType: 'TypeError' },
      { connectionString: connectionString(ingestion.url), timeoutMs: 5000 },
    );

    expect(ingestion.envelopes[0].data.baseData).toMatchObject({
      success: false,
      properties: { exitCode: '1', outcome: 'failure', exceptionType: 'TypeError' },
    });
  });

  it('gives up within the time bound when the endpoint never answers', async () => {
    const ingestion = await startIngestion(false);
    const started = Date.now();

    await expect(
      exportInvocation(record, {
        connectionString: connectionString(ingestion.url),
        timeoutMs: 300,
      }),
    ).resolves.toBe('timedOut');

    expect(Date.now() - started).toBeLessThan(1000);
  });

  it('resolves quietly when the endpoint is unreachable', async () => {
    const ingestion = await startIngestion();
    const url = ingestion.url;
    await new Promise((resolve) => servers.pop()?.close(resolve));

    const result = await exportInvocation(record, {
      connectionString: connectionString(url),
      timeoutMs: 1000,
    });

    // SDK retries may still be pending when the bound elapses.
    expect(['settled', 'timedOut']).toContain(result);
  });

  it('skips export for an invalid connection string', async () => {
    await expect(
      exportInvocation(record, { connectionString: 'not-a-connection-string', timeoutMs: 1000 }),
    ).resolves.toBe('settled');
  });

  it('restores the environment after creating the exporter', async () => {
    delete process.env.APPLICATION_INSIGHTS_NO_STATSBEAT;
    await exportInvocation(record, { connectionString: 'not-a-connection-string', timeoutMs: 100 });
    expect(process.env.APPLICATION_INSIGHTS_NO_STATSBEAT).toBeUndefined();
  });
});
