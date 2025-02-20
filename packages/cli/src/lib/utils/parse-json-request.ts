import { IncomingMessage } from 'node:http';

/**
 * Extracts and parses JSON data from an incoming HTTP request.
 *
 * @param req - The incoming HTTP request object.
 * @returns A promise that resolves to a record containing the parsed JSON data.
 * @throws Will reject the promise if there is an error during data reception or JSON parsing.
 */
export async function parseJsonFromRequest(req: IncomingMessage): Promise<Record<string, unknown>> {
  return await new Promise<Record<string, unknown>>((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk.toString()));
    req.on('end', () => resolve(JSON.parse(data)));
    req.on('error', reject);
  });
}

export default parseJsonFromRequest;
