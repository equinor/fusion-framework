import { useEffect, useRef, useCallback } from 'react';
import type {
  FileOperation,
  ServerEvent,
  TaskOperationEvent,
  TaskStageEvent,
  TaskStatusEvent,
} from '@equinor/fusion-framework-cli-plugin-live-ai-core';
import type { ConnectionState } from '../types.js';

export interface UseAiDevSocketOptions {
  readonly socketUrl: string;
  readonly onConnectionStateChange: (state: ConnectionState) => void;
  readonly onConfigReceived: (agents: string[], models: string[]) => void;
  readonly onAssistantToken: (token: string) => void;
  readonly onChangesProposed: (changeSetId: string, files: FileOperation[]) => void;
  readonly onChangesApplied: (changeSetId: string) => void;
  readonly onChangesRejected: (changeSetId: string) => void;
  readonly onLogMessage: (level: string, message: string) => void;
  readonly onTaskStatus: (phase: TaskStatusEvent['phase'], message: string) => void;
  readonly onTaskStage: (stage: TaskStageEvent['stage'], message: string) => void;
  readonly onTaskOperation: (event: TaskOperationEvent) => void;
  readonly onError: (message: string) => void;
  readonly onDone: (finalText: string) => void;
}

/**
 * Hook that manages WebSocket connection to live-ai server.
 * Handles all socket events and notifies parent via callbacks.
 */
export function useAiDevSocket(options: UseAiDevSocketOptions): {
  socket: WebSocket | null;
  sendRequest: (request: Record<string, unknown>) => boolean;
} {
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const streamingBufferRef = useRef('');
  // Keep a stable ref to latest options so callbacks never go stale
  // without causing the socket effect to restart on every render.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sendRequest = useCallback((request: Record<string, unknown>): boolean => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      optionsRef.current.onError('Live AI server is not connected.');
      optionsRef.current.onConnectionStateChange('disconnected');
      return false;
    }
    socket.send(JSON.stringify(request));
    return true;
  }, []);

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      if (disposed) {
        return;
      }

      optionsRef.current.onConnectionStateChange('connecting');
      const socket = new WebSocket(optionsRef.current.socketUrl);
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        if (disposed) {
          return;
        }
        optionsRef.current.onConnectionStateChange('connected');
      });

      socket.addEventListener('message', (event: MessageEvent<string>) => {
        if (disposed) {
          return;
        }

        const payload = JSON.parse(event.data) as ServerEvent;

        switch (payload.type) {
          case 'config': {
            optionsRef.current.onConfigReceived(payload.agents, payload.models);
            break;
          }
          case 'assistant.token': {
            streamingBufferRef.current += payload.token;
            optionsRef.current.onAssistantToken(streamingBufferRef.current);
            break;
          }
          case 'changes.proposed': {
            optionsRef.current.onChangesProposed(payload.changeSetId, payload.files);
            break;
          }
          case 'changes.applied': {
            optionsRef.current.onChangesApplied(payload.changeSetId);
            break;
          }
          case 'changes.rejected': {
            optionsRef.current.onChangesRejected(payload.changeSetId);
            break;
          }
          case 'log': {
            optionsRef.current.onLogMessage(payload.level, payload.message);
            break;
          }
          case 'task.status': {
            optionsRef.current.onTaskStatus(payload.phase, payload.message);
            break;
          }
          case 'task.stage': {
            optionsRef.current.onTaskStage(payload.stage, payload.message);
            break;
          }
          case 'task.operation': {
            optionsRef.current.onTaskOperation(payload);
            break;
          }
          case 'error': {
            optionsRef.current.onError(payload.message);
            break;
          }
          case 'done': {
            optionsRef.current.onDone(streamingBufferRef.current);
            streamingBufferRef.current = '';
            break;
          }
        }
      });

      socket.addEventListener('close', () => {
        if (disposed) {
          return;
        }

        socketRef.current = null;
        optionsRef.current.onConnectionStateChange('disconnected');
        if (reconnectTimerRef.current === null) {
          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectTimerRef.current = null;
            connect();
          }, 1500);
        }
      });

      socket.addEventListener('error', () => {
        socket.close();
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      socketRef.current?.close();
    };
    // Only restart the socket when the URL changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    socket: socketRef.current,
    sendRequest,
  };
}
