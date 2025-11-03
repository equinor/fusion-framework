import { readFile, appendFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IncomingMessage } from 'node:http';

export const readFileContents = async (filePath: string): Promise<string> => {
  const absolutePath = resolve(filePath);
  try {
    if (!existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }
    const data = await readFile(absolutePath, 'utf-8');
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};

export const readBody = async (req: IncomingMessage): Promise<string> => {
  return new Promise((resolve, reject) => {
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

export const appendFileContents = async (filePath: string, content: string): Promise<void> => {
  const absolutePath = resolve(filePath);

  try {
    if (!existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }
    await appendFile(absolutePath, `${content}\n`, 'utf8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write to file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};

export const clearFileContents = async (filePath: string): Promise<void> => {
  const absolutePath = resolve(filePath);

  try {
    if (!existsSync(absolutePath)) {
      throw new Error(`File does not exist: ${absolutePath}`);
    }
    await writeFile(absolutePath, '', { encoding: 'utf8' });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to write to file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
