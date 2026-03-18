import type { Observable } from 'rxjs';

export interface RuntimeExecutionContext {
  outDir: string;
  url: string;
}

/** CLI option set for the `copilot app eval` command. */
export interface CopilotEvalOptions {
  /** Port for the local app dev server. */
  port: string;
  /** Host address for the local app dev server. */
  host: string;
  /** Skip server start and use an already-running URL. */
  url?: string;
  /** Show detailed output from the dev server and agent-browser. */
  verbose: boolean;
  /** LLM model override (e.g. "claude-sonnet-4"). */
  model?: string;
  /** Reasoning effort: low, medium, high, xhigh. */
  reasoning?: 'low' | 'medium' | 'high' | 'xhigh';
  /** Output directory override for run artifacts. */
  output?: string;
  /** Open a headed browser for interactive MSAL login. */
  login: boolean;
  /** Specific eval to run (name or file path). */
  eval?: string;
  /** Observable that emits on SIGINT for graceful shutdown. */
  shutdown$?: Observable<string>;
}

// ── Eval plan types ─────────────────────────────────────────────────────────

/** A logical test step that groups related criteria under one scenario. */
export interface PlanStep {
  /** Short scenario description (e.g. "Open the landing page"). */
  scenario: string;
  /** Acceptance criteria to verify (e.g. ["Header shows Hello Fusion", ...]). */
  criteria: string[];
  /** What constitutes a pass for each criterion (same order as criteria). */
  pass: string[];
  /** What constitutes a fail for each criterion (same order as criteria). */
  fail: string[];
}

/** Structured plan produced by Phase 1. */
export interface Plan {
  /** Brief summary of the feature under test. */
  summary: string;
  /** Ordered acceptance criteria to execute. */
  steps: PlanStep[];
}

/** Result of executing a single {@link PlanStep}. */
export interface StepResult {
  /** The criterion that was tested. */
  criterion: string;
  /** Whether the criterion passed. */
  ok: boolean;
  /** Agent's observation or explanation. */
  note: string;
  /** Evidence artifact filenames collected during this step. */
  evidence: string[];
}

/** Structured verdict produced by the Copilot agent at the end of an eval session. */
export interface Verdict {
  /** Whether all acceptance criteria passed. */
  pass: boolean;
  /** Overall summary explaining the pass/fail outcome. */
  reasoning: string;
  /** Per-criterion results with evidence references. */
  steps: StepResult[];
  /** Optional UX observations and improvement suggestions based on what was seen. */
  ux?: string[];
}
