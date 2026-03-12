import type { FileOperation } from '@equinor/fusion-framework-cli-plugin-live-ai-core';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';
export type MessageTone = 'default' | 'error' | 'success';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly ts: number;
  readonly tone?: MessageTone;
}

export interface PendingChangeSet {
  readonly changeSetId: string;
  readonly files: FileOperation[];
}
