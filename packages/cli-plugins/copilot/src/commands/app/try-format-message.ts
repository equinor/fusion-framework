import type { Plan, StepResult, Verdict } from './types.js';
import { formatPlan } from './format-plan.js';
import { formatStepResult } from './format-step-result.js';
import { formatVerdict } from './format-verdict.js';

/**
 * Attempts to detect the JSON shape of an assistant message and format it.
 *
 * Returns `null` when the content is not a recognised structure, so the
 * caller can fall back to plain-text rendering.
 *
 * @param content - Raw assistant message content, expected to be a JSON string.
 * @returns A formatted string for a recognised plan, step result, or verdict, or `null` otherwise.
 */
export function tryFormatMessage(content: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.trim());
  } catch {
    return null;
  }
  // Only object shapes can be matched against the recognised message formats
  if (!parsed || typeof parsed !== 'object') return null;

  // Verdict: { pass, reasoning, steps[] }
  if ('pass' in parsed && 'steps' in parsed && Array.isArray((parsed as Verdict).steps)) {
    return formatVerdict(parsed as Verdict);
  }

  // Plan: { summary, steps[] }
  if ('summary' in parsed && 'steps' in parsed && Array.isArray((parsed as Plan).steps)) {
    return formatPlan(parsed as Plan);
  }

  // Step result: { criterion, ok, note }
  if ('criterion' in parsed && 'ok' in parsed && 'note' in parsed) {
    return formatStepResult(parsed as StepResult);
  }

  // No recognised shape matched; caller should fall back to plain-text rendering
  return null;
}
