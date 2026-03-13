import type {
  TaskOperationEvent,
  TaskStageEvent,
  TaskStatusEvent,
} from '@equinor/fusion-framework-cli-plugin-ai-studio';

export type RunFeedbackKind = 'info' | 'warning' | 'error';
export type RunFeedbackStateStatus = 'idle' | 'running' | 'done' | 'error';

export interface RunFeedbackStatusEntry {
  readonly id: string;
  readonly type: 'status';
  readonly kind: RunFeedbackKind;
  readonly phase: TaskStatusEvent['phase'];
  readonly message: string;
}

export interface RunFeedbackStageEntry {
  readonly id: string;
  readonly type: 'stage';
  readonly kind: RunFeedbackKind;
  readonly stage: TaskStageEvent['stage'];
  readonly message: string;
}

export interface RunFeedbackLogEntry {
  readonly id: string;
  readonly type: 'log';
  readonly kind: RunFeedbackKind;
  readonly message: string;
}

export interface RunFeedbackOperationEntry {
  readonly id: string;
  readonly type: 'operation';
  readonly kind: RunFeedbackKind;
  readonly operation: TaskOperationEvent['operation'];
  readonly target?: string;
  readonly message: string;
  readonly additions?: number;
  readonly deletions?: number;
}

export type RunFeedbackEntry =
  | RunFeedbackStatusEntry
  | RunFeedbackStageEntry
  | RunFeedbackLogEntry
  | RunFeedbackOperationEntry;

export interface RunFeedbackState {
  readonly status: RunFeedbackStateStatus;
  readonly entries: RunFeedbackEntry[];
}

/**
 * Appends a run feedback entry while keeping the latest status entry compact.
 * Consecutive status updates replace each other so the simple UI stays one line.
 * @param entries - Current run feedback entries.
 * @param nextEntry - Next entry to append.
 * @param maxEntries - Maximum number of retained entries.
 * @returns Updated feedback entries.
 */
export function appendRunFeedbackEntry(
  entries: RunFeedbackEntry[],
  nextEntry: RunFeedbackEntry,
  maxEntries = 24,
): RunFeedbackEntry[] {
  const nextEntries = [...entries];
  const previousEntry = nextEntries.at(-1);

  if (nextEntry.type === 'status' && previousEntry?.type === 'status') {
    nextEntries[nextEntries.length - 1] = nextEntry;
  } else {
    nextEntries.push(nextEntry);
  }

  return nextEntries.slice(-maxEntries);
}
