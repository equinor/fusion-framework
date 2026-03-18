import type { RuntimeExecutionContext } from '../types.js';

/**
 * Creates the execution prompt for a single test step.
 *
 * The agent receives one plan step and executes its actions against the
 * running application using browser tools, collecting evidence artifacts
 * into the evidence directory.
 *
 * @param actions - The action strings to execute in order
 * @param ctx - Runtime context with output directory and app URL
 * @returns The fully interpolated execution prompt string
 */
export const createExecuteStepPrompt = (
  actions: string[],
  ctx: RuntimeExecutionContext,
): string => {
  return `
You are now EXECUTING one test step using real browser tools.

ACTIONS: ${JSON.stringify(actions, null, 2)}

APPLICATION URL: ${ctx.url}
EVIDENCE DIRECTORY: ${ctx.outDir}/evidence

Execute the "actions" array in order using the available browser tool calls.
Collect rich evidence at every stage — especially on failure.

Evidence rules (mandatory):
- Before important actions: screenshot --annotate evidence/step-{criterion-slug}-before.png
- After the step (always): screenshot --full --annotate evidence/step-{criterion-slug}-after.png
- On any failure or suspicion:
    errors > evidence/step-{criterion-slug}-errors.log
    console > evidence/step-{criterion-slug}-console.log
    snapshot -i --json > evidence/step-{criterion-slug}-snapshot.json
- Use descriptive, unique filenames
  Examples: step-login-button-missing-screenshot.png, step-dashboard-url.txt

Important patterns:
- Start most steps with: snapshot -i --annotate → use @eN refs for element stability
- After navigation: wait --load networkidle or wait --url "**/pattern*"
- On failure (non-zero exit, timeout, missing element, JS error): capture extra evidence
- If flaky (timing, network): take 2–3 extra screenshots ~1 s apart

When done, your work will be evaluated against the step's passEvidence and failEvidence.
Do NOT output markdown or explanations — only use browser tool calls and collect evidence.
  `.trim();
};
