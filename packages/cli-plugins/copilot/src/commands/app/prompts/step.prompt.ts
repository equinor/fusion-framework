import type { PlanStep, RuntimeExecutionContext } from '../types.js';

/**
 * Creates the execution prompt for a single test step.
 *
 * The agent autonomously verifies all criteria for the scenario,
 * takes evidence, and records results.
 *
 * @param step - The plan step with scenario and criteria
 * @param ctx - Runtime context with output directory and app URL
 * @returns The fully interpolated prompt string
 */
export const createStepPrompt = (step: PlanStep, ctx: RuntimeExecutionContext): string => {
  const slug = slugify(step.scenario);
  const criteriaBlock = step.criteria
    .map((c, i) => `${i + 1}. ${c}\n   Pass: ${step.pass[i] ?? ''}\n   Fail: ${step.fail[i] ?? ''}`)
    .join('\n');

  return `
Scenario: ${step.scenario}

Verify ALL of these criteria:
${criteriaBlock}

Use browser tools to verify. Take a screenshot when done:
  browser_screenshot path="evidence/step-${slug}.jpg" annotate=true

Then for EACH criterion, append ONE JSON line using append_file with path "executions.jsonl":
{"criterion": "...", "ok": true|false, "note": "what you observed", "evidence": ["evidence/step-${slug}.jpg"]}
  `.trim();
};

/**
 * Converts text to a URL-safe slug for filenames.
 *
 * @param text - The text to slugify
 * @returns Lowercase hyphenated string safe for filenames
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}
