import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import type { RuntimeExecutionContext } from '../types.js';

/** Text file extensions that are safe to embed in the prompt. */
const TEXT_EXTENSIONS = new Set(['.txt', '.json', '.jsonl', '.log', '.html', '.csv']);

/**
 * Reads `executions.jsonl` and all text evidence files from the run directory
 * and returns them as a single string block suitable for prompt embedding.
 *
 * Binary files (screenshots) are listed by name but not inlined.
 *
 * @param outDir - The run output directory containing executions.jsonl and evidence/
 * @returns Formatted string with execution records and text evidence
 */
function collectEvidence(outDir: string): string {
  const parts: string[] = [];

  // ── executions.jsonl ──
  const execPath = join(outDir, 'executions.jsonl');
  if (existsSync(execPath)) {
    parts.push('### executions.jsonl', readFileSync(execPath, 'utf-8').trim());
  } else {
    parts.push('### executions.jsonl', '(file not found)');
  }

  // ── evidence/ directory ──
  const evidenceDir = join(outDir, 'evidence');
  if (existsSync(evidenceDir)) {
    const files = readdirSync(evidenceDir).sort();
    for (const file of files) {
      const ext = extname(file).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext)) {
        const content = readFileSync(join(evidenceDir, file), 'utf-8').trim();
        parts.push(`### evidence/${file}`, content);
      } else {
        parts.push(`### evidence/${file}`, `(binary file — ${ext} screenshot)`);
      }
    }
  }

  return parts.join('\n\n');
}

/**
 * Creates the final-verdict prompt for the judge phase.
 *
 * The judge reviews ALL step executions and evidence holistically, then writes
 * a single `verdict.json` with an overall pass/fail decision. This differs
 * from the per-step evaluate prompt which assesses one criterion at a time.
 *
 * Execution records and text evidence files are embedded directly in the prompt
 * so the model does not need file-reading tools or SDK attachment resolution.
 *
 * @param ctx - Runtime context containing the output directory and app URL
 * @returns The fully interpolated judge prompt string
 */
export const createJudgePrompt = (ctx: RuntimeExecutionContext): string => {
  const evidence = collectEvidence(ctx.outDir);

  return `
All test steps have been executed. You are now the JUDGE.

Review the evidence below and any screenshots using read_file, then produce a final verdict.

<evidence>
${evidence}
</evidence>

To inspect screenshots, use read_file with paths like "evidence/step-hello-fusion-header.jpg".
Images are returned as inline vision content you can see.

Save your verdict using write_file with path "verdict.json".
You MUST call write_file. Do NOT output the JSON as a message.

Evaluation rules — apply exactly:
1. Auto-fail a criterion if:
   - Any "Uncaught", TypeError, or ReferenceError appears in console/errors during that step
   - The page shows an error, HTTP 500, white screen, or spinner lasting >15 s
   - The expected element, text, or URL never appeared
   - An explicit assertion (is visible, get text, get count) returned a failing result
2. A criterion passes only when:
   - All passEvidence conditions are clearly confirmed in screenshots (use read_file to view them), console, or URL
   - No critical functional deviation is present
3. Be lenient on:
   - Console warnings, deprecations, analytics 404s
   - Cosmetic shifts <5 px or layout differences that do not hide content
   - Minor visual differences without functional impact

Overall "pass" = true ONLY if every criterion is "ok": true.

Output ONLY this JSON — no markdown fences, no prose:

{
  "pass": boolean,
  "reasoning": "One-paragraph summary explaining the overall pass/fail outcome",
  "steps": [
    {
      "criterion": "...",
      "ok": true | false | "blocked" | "flaky",
      "note": "Evidence-based verdict for this criterion"
    }
  ],
  "ux": [
    "Short UX observation or improvement suggestion based on what you saw in the screenshots and evidence"
  ]
}

The "ux" array is for observations about the user experience that go beyond
pass/fail — things a product owner or designer would want to know:
- Accessibility issues (contrast, missing labels, keyboard traps)
- Loading performance (slow renders, layout shifts, flash of unstyled content)
- Visual polish (alignment, spacing, truncation, responsive issues)
- Interaction hints (unclear affordances, missing hover states, confusing flow)
- Content quality (typos, unclear copy, missing help text)
Only include genuine observations from the evidence. Skip "ux" if nothing stands out.

If evidence for a criterion is missing or ambiguous, fail it.
  `.trim();
};
