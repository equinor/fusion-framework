import { z } from 'zod';

// ---------------------------------------------------------------------------
// Plan — output of the Planner phase
// ---------------------------------------------------------------------------

/**
 * A single verifiable step extracted from the user story by the Planner.
 *
 * Each step maps to one Given/When/Then scenario and becomes the unit of work
 * for the Explorer and Judge.
 */
export const PlanStepSchema = z.object({
  /** Unique step identifier (e.g. "step-1"). */
  id: z.string(),
  /** The exact acceptance criterion text this step verifies. */
  criterion: z.string(),
  /** Plain-English instruction for the Explorer (what to navigate to and check). */
  description: z.string(),
  /** Likely app route to start from (best-effort, Explorer may navigate further). */
  route: z.string().optional(),
  /** Whether the step requires visual inspection of a screenshot. */
  visual: z.boolean().optional(),
});

export type PlanStep = z.infer<typeof PlanStepSchema>;

/**
 * Structured plan produced by the Planner from a user story Markdown file.
 *
 * Written to `plan.json` immediately so runs can be inspected if they fail
 * mid-way.
 */
export const PlanSchema = z.object({
  /** Who the user is (extracted from the As a… preamble). */
  persona: z.string(),
  /** What the user is trying to achieve (from the story headline). */
  goal: z.string(),
  /** Ordered list of verification steps derived from the Scenarios section. */
  steps: z.array(PlanStepSchema),
});

export type Plan = z.infer<typeof PlanSchema>;

// ---------------------------------------------------------------------------
// Evidence — full internal record produced by the Explorer phase
// ---------------------------------------------------------------------------

/**
 * Raw evidence collected by the Explorer for a single plan step.
 *
 * Contains audit metadata (`toolCalls`, `toolCallCount`) that is deliberately
 * stripped before the Judge ever sees the record. Use {@link sanitiseEvidence}
 * to produce a {@link Proof} from an `Evidence`.
 *
 * Written to `evidence/step-N.json` on disk — never sent to the Judge.
 */
export const EvidenceSchema = z.object({
  /** Matches the corresponding {@link PlanStep.id}. */
  stepId: z.string(),
  /** Ordered list of agent-browser tool names called during exploration (audit only). */
  toolCalls: z.array(z.string()),
  /** Total number of browser tool calls made (audit only). */
  toolCallCount: z.number(),
  /** Full accessible DOM tree captured at the end of exploration. */
  snapshot: z.string(),
  /** Filesystem path of the written screenshot file (audit only). */
  screenshotPath: z.string().optional(),
});

export type Evidence = z.infer<typeof EvidenceSchema>;

// ---------------------------------------------------------------------------
// Proof — sanitised record seen by the Judge
// ---------------------------------------------------------------------------

/**
 * Sanitised evidence record passed to the Judge.
 *
 * Contains only what the Judge is allowed to know: the criterion, the DOM
 * snapshot, and the screenshot. Tool call history and intermediate observations
 * are explicitly absent to enforce the blind-judge guarantee.
 *
 * Written to `proof/step-N.json` on disk.
 *
 * @see {@link sanitiseEvidence} for the deterministic conversion from {@link Evidence}.
 */
export const ProofSchema = z.object({
  /** Matches the corresponding {@link PlanStep.id}. */
  stepId: z.string(),
  /** The acceptance criterion this proof addresses (from the plan). */
  criterion: z.string(),
  /** Plain-English description of what the Explorer was asked to verify. */
  description: z.string(),
  /** Full accessible DOM tree — the primary evidence for the Judge. */
  snapshot: z.string(),
  /** Path to the screenshot file in the run evidence folder. */
  screenshotPath: z.string().optional(),
  // toolCalls, toolCallCount — deliberately absent
});

export type Proof = z.infer<typeof ProofSchema>;

// ---------------------------------------------------------------------------
// Verdict — structured output of the Judge phase
// ---------------------------------------------------------------------------

/** Result value for an individual criterion or the overall run. */
export const ResultSchema = z.enum(['PASS', 'FAIL', 'INCONCLUSIVE']);
export type Result = z.infer<typeof ResultSchema>;

/**
 * Per-criterion judgment produced by the Judge.
 */
export const VerdictCriterionSchema = z.object({
  /** The acceptance criterion text (mirrors {@link Proof.criterion}). */
  criterion: z.string(),
  /** Pass/fail/inconclusive result for this criterion. */
  result: ResultSchema,
  /**
   * Reasoning that cites observable DOM or screenshot evidence.
   * Must not reference how evidence was collected (tool calls, retries, etc.).
   */
  reasoning: z.string(),
});

export type VerdictCriterion = z.infer<typeof VerdictCriterionSchema>;

/**
 * Structured verdict produced by the Judge for a complete user story run.
 *
 * Written to `verdict.json`. The `result` field drives the CLI exit code:
 * - `PASS` → exit 0
 * - `FAIL` → exit 1
 * - `INCONCLUSIVE` → exit 2
 */
export const VerdictSchema = z.object({
  /** Overall result for the story run. */
  result: ResultSchema,
  /** Human-readable summary of the entire run. */
  summary: z.string(),
  /** Per-criterion judgments. */
  criteria: z.array(VerdictCriterionSchema),
  /** Criterion texts for all failing criteria (convenience field). */
  failingCriteria: z.array(z.string()),
  /** Criterion texts for all inconclusive criteria (convenience field). */
  ambiguousCriteria: z.array(z.string()),
});

export type Verdict = z.infer<typeof VerdictSchema>;

// ---------------------------------------------------------------------------
// Sanitisation — deterministic Evidence → Proof conversion
// ---------------------------------------------------------------------------

/**
 * Converts a full {@link Evidence} record into a sanitised {@link Proof}.
 *
 * This is a **deterministic function with no model call**. It strips all audit
 * metadata (`toolCalls`, `toolCallCount`, `screenshotPath`) and copies only the
 * fields the Judge is permitted to see. The information flow is strictly
 * one-way: there is no inverse of this function.
 *
 * @param evidence - Full evidence record produced by the Explorer.
 * @param step - The plan step that generated this evidence (supplies `criterion` and `description`).
 * @returns A sanitised {@link Proof} safe to pass to the Judge.
 */
export function sanitiseEvidence(evidence: Evidence, step: PlanStep): Proof {
  return {
    stepId: evidence.stepId,
    criterion: step.criterion,
    description: step.description,
    snapshot: evidence.snapshot,
    ...(evidence.screenshotPath ? { screenshotPath: evidence.screenshotPath } : {}),
  };
}
