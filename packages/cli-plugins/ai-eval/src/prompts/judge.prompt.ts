import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { Proof } from '../types.js';

/**
 * Reads a screenshot file from disk and returns a base64 data URL string.
 * Returns `null` if the file cannot be read.
 */
function screenshotToDataUrl(filePath: string): string | null {
  try {
    const ext = extname(filePath).slice(1).toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const data = readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
  } catch {
    return null;
  }
}

/**
 * Builds the Judge message pair for a complete story run.
 *
 * The Judge receives only sanitised {@link Proof} records — DOM snapshot and
 * screenshot per step — along with the original user story. It has no knowledge
 * of how evidence was collected (tool calls, retries, navigation order). The
 * Judge evaluates each criterion independently and returns a structured
 * {@link Verdict}.
 *
 * Returns LangChain {@link BaseMessage} instances directly so multimodal
 * image content parts are preserved end-to-end without any intermediate
 * string casting.
 *
 * @param proofs - Sanitised proof records, one per plan step (never contains toolCalls).
 * @param storyMarkdown - The original user story Markdown (for criteria and non-goals context).
 * @returns A two-element tuple: [SystemMessage, HumanMessage].
 */
export function buildJudgeMessages(proofs: Proof[], storyMarkdown: string): [SystemMessage, HumanMessage] {
  const system = new SystemMessage(`You are an independent acceptance test judge for a Fusion Framework web application.

Fusion Framework context:
Applications run inside a dev-portal shell that provides outer chrome (header, navigation bar, sidebar, bookmarks panel). The application under test is mounted inside a <main data-app-key="..."> element. Everything outside that element is portal infrastructure — ignore it entirely when evaluating all criteria.

You will be given:
1. A user story describing the acceptance criteria.
2. A set of evidence records — one per criterion — each containing a DOM snapshot and a screenshot.

Your task is to evaluate whether each criterion is met based ONLY on the evidence provided.

Rules:
1. Evaluate each criterion independently using the DOM snapshot and screenshot in its evidence record.
2. Cite specific DOM elements, text content, or visual observations in your reasoning.
3. Do NOT assume anything about how the evidence was collected. Do not reference navigation steps, tool calls, or agent behavior.
4. Do NOT penalise for behavior explicitly listed in the ## Non-goals section.
5. Use PASS when the evidence clearly satisfies the criterion.
6. Use FAIL ONLY when the evidence contains a positive observation that directly contradicts the criterion — for example: wrong text is present, a prohibited element exists, or an error message is shown. FAIL requires proof of non-compliance.
7. Use INCONCLUSIVE when evidence is insufficient to confirm OR deny the criterion. "No data" is always INCONCLUSIVE, never FAIL.
8. COLOR AND STYLE RULE: CSS styles are NOT present in DOM accessibility snapshots. However, a screenshot IS attached for each step — use it for visual evidence of background color, layout, and styling. If a screenshot is available and shows the expected color/style clearly, use PASS. Only mark INCONCLUSIVE if neither the snapshot nor the screenshot provides sufficient visual evidence.
9. NO-ERRORS RULE: If the DOM snapshot shows no error messages or exception indicators, treat "no errors visible" criteria as PASS. Absence of error indicators IS sufficient evidence.
10. The overall result is PASS only if all criteria pass. FAIL if any criterion fails. INCONCLUSIVE otherwise.
11. The summary should be a 1–3 sentence human-readable overview of the run.`);

  // Build multimodal user message: text header + interleaved screenshot images per step.
  type ContentPart =
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string; detail: 'high' } };

  const contentParts: ContentPart[] = [
    {
      type: 'text',
      text: `Evaluate this user story against the collected evidence.\n\n## User Story\n\n${storyMarkdown}\n\n## Evidence`,
    },
  ];

  for (let i = 0; i < proofs.length; i++) {
    const p = proofs[i];
    const evidenceText = `
--- Evidence ${i + 1} ---
Criterion: ${p.criterion}
Description: ${p.description}
Step ID: ${p.stepId}

DOM Snapshot:
${p.snapshot}`;

    contentParts.push({ type: 'text', text: evidenceText });

    if (p.screenshotPath) {
      const dataUrl = screenshotToDataUrl(p.screenshotPath);
      if (dataUrl) {
        contentParts.push({
          type: 'image_url',
          image_url: { url: dataUrl, detail: 'high' },
        });
      } else {
        contentParts.push({ type: 'text', text: '[Screenshot could not be loaded]' });
      }
    } else {
      contentParts.push({ type: 'text', text: '[No screenshot available]' });
    }
  }

  const user = new HumanMessage({ content: contentParts });

  return [system, user];
}
