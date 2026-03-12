import type { ConnectionState, MessageRole } from './types.js';

export const SYSTEM_MESSAGE_FILTER_STORAGE_KEY = 'fusion.ai-dev.show-system-messages';

export const resolveAiDevSocketUrl = (): string => {
  const env = import.meta as ImportMeta & {
    readonly env: Record<string, string | boolean | undefined>;
  };

  const configured =
    typeof env.env.FUSION_SPA_AI_DEV_WS_URL === 'string'
      ? env.env.FUSION_SPA_AI_DEV_WS_URL.trim()
      : '';

  if (configured.length > 0) {
    return configured;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8787/ws`;
};

export const getRoleLabel = (role: MessageRole): string => {
  if (role === 'user') {
    return 'Prompt';
  }

  if (role === 'assistant') {
    return 'Assistant';
  }

  return 'System';
};

export const getStatusText = (state: ConnectionState): string => {
  if (state === 'connected') {
    return 'Connected';
  }

  if (state === 'connecting') {
    return 'Connecting';
  }

  return 'Disconnected';
};
