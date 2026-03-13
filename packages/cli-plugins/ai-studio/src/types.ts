/**
 * File write operation in a proposed change set.
 */
export interface WriteOperation {
  /** Operation discriminator. */
  type: 'write';
  /** File path relative to the configured root directory. */
  path: string;
  /** New file content that will be written on apply. */
  newText: string;
  /** Unified diff patch used for UI display. */
  patch: string;
}

/**
 * Supported change set operations.
 */
export type FileOperation = WriteOperation;

/**
 * Proposed set of changes associated with a chat request.
 */
export interface ChangeSet {
  /** Unique change set identifier. */
  id: string;
  /** Chat session identifier. */
  sessionId: string;
  /** ISO timestamp for proposal creation. */
  createdAt: string;
  /** File operations included in the proposal. */
  files: FileOperation[];
}

/**
 * Request: send a chat prompt to the server.
 */
export interface ChatSendRequest {
  type: 'chat.send';
  sessionId: string;
  message: string;
  mode?: string;
  agent?: string;
  model?: string;
}

/**
 * Request: apply a previously proposed change set.
 */
export interface ChangesApplyRequest {
  type: 'changes.apply';
  sessionId: string;
  changeSetId: string;
}

/**
 * Request: reject and discard a proposed change set.
 */
export interface ChangesRejectRequest {
  type: 'changes.reject';
  sessionId: string;
  changeSetId: string;
}

/**
 * Client -> server WebSocket request union.
 */
export type ClientRequest = ChatSendRequest | ChangesApplyRequest | ChangesRejectRequest;

/**
 * Event emitted while assistant text is streaming.
 */
export interface AssistantTokenEvent {
  type: 'assistant.token';
  sessionId: string;
  token: string;
}

/**
 * Event emitted when a change set has been proposed.
 */
export interface ChangesProposedEvent {
  type: 'changes.proposed';
  sessionId: string;
  changeSetId: string;
  files: FileOperation[];
}

/**
 * Event emitted when a change set has been applied.
 */
export interface ChangesAppliedEvent {
  type: 'changes.applied';
  sessionId: string;
  changeSetId: string;
}

/**
 * Event emitted when a change set has been rejected.
 */
export interface ChangesRejectedEvent {
  type: 'changes.rejected';
  sessionId: string;
  changeSetId: string;
}

/**
 * Generic server log event.
 */
export interface LogEvent {
  type: 'log';
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
}

/**
 * Compact status event for the simple progress UI.
 */
export interface TaskStatusEvent {
  type: 'task.status';
  sessionId: string;
  phase:
    | 'submitted'
    | 'reasoning'
    | 'loading'
    | 'processing'
    | 'analyzing'
    | 'refining'
    | 'applying';
  message: string;
}

/**
 * Task stage event for tracking work progress.
 */
export interface TaskStageEvent {
  type: 'task.stage';
  sessionId: string;
  stage: 'reasoning' | 'loading' | 'processing' | 'analyzing' | 'refining' | 'applying';
  message: string;
}

/**
 * Task operation event for timeline actions.
 */
export interface TaskOperationEvent {
  type: 'task.operation';
  sessionId: string;
  operation: 'glob' | 'list' | 'search' | 'read' | 'edit' | 'detail';
  kind?: 'info' | 'warning' | 'error';
  target?: string;
  message: string;
  additions?: number;
  deletions?: number;
}

/**
 * Error event sent to the client.
 */
export interface ErrorEvent {
  type: 'error';
  message: string;
}

/**
 * Event emitted when server finishes handling one prompt.
 */
export interface DoneEvent {
  type: 'done';
  sessionId: string;
}

/**
 * Configuration event with available runtime options.
 */
export interface ConfigEvent {
  type: 'config';
  agents: string[];
  models: string[];
}

/**
 * Server -> client event union.
 */
export type ServerEvent =
  | AssistantTokenEvent
  | ChangesProposedEvent
  | ChangesAppliedEvent
  | ChangesRejectedEvent
  | LogEvent
  | TaskStatusEvent
  | TaskStageEvent
  | TaskOperationEvent
  | ErrorEvent
  | DoneEvent
  | ConfigEvent;

/**
 * Start options for the write server.
 */
export interface StartServerOptions {
  /** Optional explicit root. If omitted, root is inferred from current working directory. */
  root?: string;
  /** WebSocket port to bind. Defaults to 8787. */
  port?: number;
  /** If true, write JSONL audit logs under .live-ai/sessions. */
  persistAuditLog?: boolean;
}

/**
 * Running server handle.
 */
export interface LiveAiServer {
  /** Root directory used for all safe file operations. */
  root: string;
  /** Bound WebSocket port. */
  port: number;
  /** Stops the running server. */
  close: () => Promise<void>;
}
