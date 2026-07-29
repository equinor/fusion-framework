import { mkdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Creates a timestamped, run-specific output directory for eval artifacts.
 *
 * @param title - Human label used as the directory name prefix (slugified)
 * @param baseDir - Optional parent directory override
 * @returns Absolute path to the newly created directory
 */
export function createRunDir(title: string, baseDir?: string): string {
  const now = new Date();
  // Zero-pad each time component so the directory name sorts and reads consistently
  const time = [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join('');
  const ms = String(now.getUTCMilliseconds()).padStart(3, '0');
  const slug = title.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-');
  const parent = baseDir ? resolve(baseDir) : resolve('.tmp', 'copilot');
  const dir = join(parent, `${slug}_${time}${ms}`);
  mkdirSync(dir, { recursive: true });
  console.log(`📁 Run dir: ${relative(process.cwd(), dir)}`);
  return dir;
}
