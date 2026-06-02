import { createCommand } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { withOptions, type AiOptions } from '@equinor/fusion-framework-cli-plugin-ai-base/command-options';
import { setupFramework } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { judge } from './agent/index.js';
import { type Proof, ProofSchema } from './types.js';
import { z } from 'zod';

// On-disk proof format: snapshot may be a path reference rather than inline content
const DiskProofSchema = ProofSchema.extend({
  snapshotPath: z.string().optional(),
}).partial({ snapshot: true });

function loadProofs(proofsPath: string): Proof[] {
  const raw = JSON.parse(readFileSync(proofsPath, 'utf-8'));
  const diskProofs = z.array(DiskProofSchema).parse(raw);
  return diskProofs.map((p) => {
    const snapshot = p.snapshot ?? (p.snapshotPath && existsSync(p.snapshotPath)
      ? readFileSync(p.snapshotPath, 'utf-8')
      : '');
    return ProofSchema.parse({ ...p, snapshot });
  });
}

// ---------------------------------------------------------------------------
// Command definition
// ---------------------------------------------------------------------------

const _command = createCommand('judge')
  .argument('<run-dir>', 'Path to a previous eval run directory (contains proofs.json and the story .md file)')
  .description(
    'Re-run only the Judge phase on a previous eval run.\n\n' +
      'Reads proofs.json and the story .md from the run directory and writes\n' +
      'a new verdict.json in the same directory. Useful for iterating on the\n' +
      'judge prompt without re-running the browser exploration.',
  );

withOptions(_command, { includeChat: true });

_command.action(async (runDir: string, options: AiOptions & { verbose?: boolean }) => {
  const absDir = resolve(runDir);

  // Locate proofs.json
  const proofsPath = join(absDir, 'proofs.json');
  if (!existsSync(proofsPath)) {
    console.error(`Error: proofs.json not found in ${absDir}`);
    process.exit(1);
  }

  // Locate the story .md — look for it two levels up (eval-results/{story}/{run}/ → {story}.md)
  // The user can also pass the run dir directly if they have the story nearby.
  // Strategy: look for any .md file in the parent of the run dir matching the story name.
  let storyMarkdown: string | undefined;
  const storyName = absDir.split('/').at(-2); // eval-results/{storyName}/{runId}
  const candidatePaths = [
    join(absDir, 'story.md'),
    join(absDir, '..', `${storyName}.md`),
    join(absDir, '..', '..', `${storyName}.md`),
  ];
  for (const candidate of candidatePaths) {
    if (existsSync(candidate)) {
      storyMarkdown = readFileSync(candidate, 'utf-8');
      break;
    }
  }

  if (!storyMarkdown) {
    console.error(
      `Error: Could not find the story .md file. Looked in:\n${candidatePaths.map((p) => `  ${p}`).join('\n')}`,
    );
    process.exit(1);
  }

  // Parse proofs — load snapshot content from yml files if referenced by path
  let proofs: Proof[];
  try {
    proofs = loadProofs(proofsPath);
  } catch (err) {
    console.error(`Error: Failed to parse proofs.json: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log(`\n⚖️  Fusion AI Judge — re-judging ${proofs.length} proof(s) from ${absDir}`);

  const framework = await setupFramework(options);
  const model = framework.ai.useModel(options.chatModel);

  const verdict = await judge(proofs, storyMarkdown, model, { verbose: options.verbose });

  const verdictPath = join(absDir, 'verdict.json');
  writeFileSync(verdictPath, JSON.stringify(verdict, null, 2), 'utf-8');

  const icon = verdict.result === 'PASS' ? '✅' : verdict.result === 'FAIL' ? '❌' : '❓';
  console.log(`\n${icon} Result: ${verdict.result}`);
  console.log(`   ${verdict.summary}`);

  if (verdict.failingCriteria.length > 0) {
    console.log('   Failing criteria:');
    for (const c of verdict.failingCriteria) {
      console.log(`     • ${c}`);
    }
  }

  if (verdict.ambiguousCriteria.length > 0) {
    console.log('   Inconclusive criteria:');
    for (const c of verdict.ambiguousCriteria) {
      console.log(`     • ${c}`);
    }
  }

  console.log(`\n   Verdict written → ${verdictPath}`);

  process.exit(verdict.result === 'PASS' ? 0 : verdict.result === 'FAIL' ? 1 : 2);
});

export { _command as judgeCommand };
