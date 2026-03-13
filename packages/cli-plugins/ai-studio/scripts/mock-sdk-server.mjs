#!/usr/bin/env node

import { createServer } from 'node:http';

const port = Number.parseInt(process.env.FUSION_AI_STUDIO_SDK_MOCK_PORT ?? '8799', 10);
const route = process.env.FUSION_AI_STUDIO_SDK_MOCK_ROUTE ?? '/sdk';

const server = createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== route) {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: false, message: 'Not found' }));
    return;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  const bodyText = Buffer.concat(chunks).toString('utf8');
  let payload = {};
  try {
    payload = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    response.writeHead(400, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        ok: false,
        message: 'Invalid JSON payload.',
        assistantText: 'The SDK mock server could not parse the request body.',
      }),
    );
    return;
  }

  const prompt = typeof payload.prompt === 'string' ? payload.prompt : '';
  const model = typeof payload.model === 'string' ? payload.model : 'unknown';
  const agent = typeof payload.agent === 'string' ? payload.agent : 'default';

  response.writeHead(200, { 'content-type': 'application/json' });
  response.end(
    JSON.stringify({
      ok: true,
      message: 'SDK mock HTTP adapter completed the request.',
      assistantText: `HTTP mock processed prompt: ${prompt}`,
      progress: [
        `HTTP mock received request for agent ${agent}.`,
        `HTTP mock selected model ${model}.`,
      ],
      operations: [
        {
          operation: 'detail',
          kind: 'info',
          message: 'HTTP mock generated a synthetic timeline operation.',
        },
        {
          operation: 'edit',
          kind: 'info',
          target: 'src/App.tsx',
          message: 'HTTP mock prepared an edit for src/App.tsx',
          additions: 1,
          deletions: 0,
        },
      ],
      tokens: ['HTTP ', 'mock ', 'processed ', 'prompt: ', prompt],
    }),
  );
});

server.listen(port, () => {
  console.log(`ai-studio mock SDK server listening on http://localhost:${port}${route}`);
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
