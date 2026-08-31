import type { IncomingMessage } from 'node:http';

/**
 * Reads a request body fully and parses it as JSON, or `undefined` for an empty body.
 *
 * @param req - The incoming request to read the body from.
 * @returns The parsed JSON body, or `undefined` when the body was empty.
 */
export async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  // A request body arrives as a stream of Buffer chunks; override payloads are always small.
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  // No chunks read: treat as an empty body rather than an empty JSON string.
  if (chunks.length === 0) return undefined;
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
}
