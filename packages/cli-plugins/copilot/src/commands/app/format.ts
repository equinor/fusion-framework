import chalk from 'chalk';

import type { Plan, StepResult, Verdict } from './types.js';

// ── Plan ────────────────────────────────────────────────────────────────────

/** Renders a structured plan as a human-readable summary. */
export function formatPlan(plan: Plan): string {
  const lines = [
    '',
    chalk.bold(`📋 ${plan.summary}`),
    '',
    ...plan.steps.flatMap((s, si) => [
      `  ${chalk.dim(`${si + 1}.`)} ${s.scenario}`,
      ...s.criteria.map((c) => chalk.dim(`     • ${truncate(c, 70)}`)),
    ]),
    '',
  ];
  return lines.join('\n');
}

// ── Step result (execution line) ────────────────────────────────────────────

/** Renders a single step execution result. */
export function formatStepResult(result: StepResult): string {
  const icon = statusIcon(result.ok);
  const files = result.evidence.length ? chalk.dim(` [${result.evidence.join(', ')}]`) : '';
  return `  ${icon}  ${result.criterion}\n${chalk.dim(`     ${result.note}`)}${files}`;
}

// ── Verdict ─────────────────────────────────────────────────────────────────

/** Renders the final verdict as a full-width coloured report. */
export function formatVerdict(verdict: Verdict): string {
  const bar = '═'.repeat(60);
  const banner = verdict.pass
    ? chalk.bgGreen.black.bold(' ✅ PASS ')
    : chalk.bgRed.white.bold(' ❌ FAIL ');

  const lines = [
    '',
    bar,
    `  ${banner}`,
    bar,
    '',
    ...verdict.steps.map(
      (s) => `  ${statusIcon(s.ok)}  ${s.criterion}\n${chalk.dim(`     ${s.note}`)}`,
    ),
    '',
    chalk.dim(`  ${verdict.reasoning}`),
    '',
  ];

  if (verdict.ux && verdict.ux.length > 0) {
    lines.push(chalk.bold('  💡 UX Feedback'), '');
    for (const hint of verdict.ux) {
      lines.push(chalk.yellow(`  • ${hint}`));
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── Dispatcher ──────────────────────────────────────────────────────────────

/**
 * Attempts to detect the JSON shape of an assistant message and format it.
 *
 * Returns `null` when the content is not a recognised structure, so the
 * caller can fall back to plain-text rendering.
 */
export function tryFormatMessage(content: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content.trim());
  } catch {
    return null;
  }
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

  return null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function statusIcon(ok: boolean | string): string {
  if (ok === true) return chalk.green('✔');
  if (ok === false) return chalk.red('✖');
  return chalk.yellow('⚠'); // "blocked", "flaky", etc.
}

function truncate(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
