import type { IncomingMessage } from 'node:http';

/**
 * Reads a JSON POST request body for the analytics log endpoint.
 * @param req - Incoming request whose body should be read.
 * @returns The request body, or an empty string for unsupported requests.
 */
export const readBody = async (req: IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Ignore non-JSON requests because only analytics POST bodies should be logged.
    if (req.method !== 'POST' || !req.headers['content-type']?.includes('application/json')) {
      resolve('');
      return;
    }

    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
};
