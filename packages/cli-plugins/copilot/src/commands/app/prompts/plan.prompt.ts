import type { RuntimeExecutionContext } from '../types.js';

/**
 * Creates the planning prompt that turns a feature specification into
 * a structured test plan.
 *
 * The agent produces a `plan.json` with one step per atomic acceptance
 * criterion, each containing browser actions, pass evidence, and fail evidence.
 *
 * @param query - The feature specification / eval content to plan against
 * @param ctx - Runtime context with output directory and app URL
 * @returns The fully interpolated planning prompt string
 */
export const createPlanPrompt = (query: string, ctx: RuntimeExecutionContext): string => {
  return `
Create a test plan for this feature specification:

${query}

Application URL: ${ctx.url}

Save the plan using write_file with path "plan.json".

JSON structure:

{
  "summary": "One-sentence description of what is being tested",
  "steps": [
    {
      "scenario": "A logical user scenario (e.g. 'Open the landing page')",
      "criteria": ["First thing to verify", "Second thing to verify"],
      "pass": ["What pass looks like for first", "What pass looks like for second"],
      "fail": ["What fail looks like for first", "What fail looks like for second"]
    }
  ]
}

Rules:
- Group related criteria under one step when they share the same scenario
  (e.g. same page, same state). Do NOT create separate steps for things
  that can be verified in a single browser visit.
- Only create multiple steps when there is a distinct user action between them
  (navigation, click, form submission, etc.).
- Do NOT include HOW to test — no actions, selectors, or tool calls.
- passEvidence and failEvidence describe what a human would see.
- Keep criteria directly traceable to the spec. Do NOT invent criteria.
  `.trim();
};