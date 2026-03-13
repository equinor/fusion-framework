import { undo, done } from '@equinor/eds-icons';
import { Button, Icon } from '@equinor/eds-core-react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { resolveAiDevSocketUrl } from './constants.js';
import { useAiDevSocket, useChatState } from './hooks/index.js';
import type {
  RunFeedbackKind,
  RunFeedbackLogEntry,
  RunFeedbackOperationEntry,
  RunFeedbackStageEntry,
  RunFeedbackState,
  RunFeedbackStatusEntry,
} from './runFeedback.js';
import { appendRunFeedbackEntry } from './runFeedback.js';
import { Styled } from './styles.js';
import { Header, Timeline, Composer } from './components/index.js';

Icon.add({ undo, done });

/**
 * Live AI chat panel for the dev portal.
 * Orchestrates WebSocket connection, state management, and UI component composition.
 */
interface AiDevChatPanelProps {
  readonly onClose?: () => void;
}

export function AiDevChatPanel(props: AiDevChatPanelProps): JSX.Element {
  const socketUrl = useMemo(() => resolveAiDevSocketUrl(), []);
  const chatState = useChatState();
  const sessionIdRef = useRef(`session-${crypto.randomUUID()}`);
  const feedbackEntryIdRef = useRef(0);
  const [composerValue, setComposerValue] = useState('');
  const [runFeedback, setRunFeedback] = useState<RunFeedbackState>({
    status: 'idle',
    entries: [],
  });

  const createFeedbackEntryId = useCallback((): string => {
    feedbackEntryIdRef.current += 1;
    return `feedback-${feedbackEntryIdRef.current}`;
  }, []);

  const appendStatusFeedback = useCallback(
    (entry: Omit<RunFeedbackStatusEntry, 'id'>): void => {
      setRunFeedback((current) => ({
        ...current,
        entries: appendRunFeedbackEntry(current.entries, {
          ...entry,
          id: createFeedbackEntryId(),
        }),
      }));
    },
    [createFeedbackEntryId],
  );

  const appendStageFeedback = useCallback(
    (entry: Omit<RunFeedbackStageEntry, 'id'>): void => {
      setRunFeedback((current) => ({
        ...current,
        entries: appendRunFeedbackEntry(current.entries, {
          ...entry,
          id: createFeedbackEntryId(),
        }),
      }));
    },
    [createFeedbackEntryId],
  );

  const appendLogFeedback = useCallback(
    (kind: RunFeedbackKind, message: string): void => {
      const entry: Omit<RunFeedbackLogEntry, 'id'> = { type: 'log', kind, message };

      setRunFeedback((current) => ({
        ...current,
        entries: appendRunFeedbackEntry(current.entries, {
          ...entry,
          id: createFeedbackEntryId(),
        }),
      }));
    },
    [createFeedbackEntryId],
  );

  const appendOperationFeedback = useCallback(
    (entry: Omit<RunFeedbackOperationEntry, 'id'>): void => {
      setRunFeedback((current) => ({
        ...current,
        entries: appendRunFeedbackEntry(current.entries, {
          ...entry,
          id: createFeedbackEntryId(),
        }),
      }));
    },
    [createFeedbackEntryId],
  );

  // Agent and model selection
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');

  // WebSocket connection
  const { sendRequest } = useAiDevSocket({
    socketUrl,
    onConnectionStateChange: setConnectionState,
    onConfigReceived: (agents, models) => {
      setAvailableAgents(agents);
      setAvailableModels(models);
      setSelectedAgent(agents[0] || '');
      setSelectedModel(models[0] || '');
    },
    onAssistantToken: (token) => {
      chatState.setStreamingText(token);
    },
    onChangesProposed: (changeSetId, files) => {
      chatState.setPendingChangeSet({ changeSetId, files });
      chatState.appendMessage(
        'system',
        `Proposed ${files.length} file change${files.length === 1 ? '' : 's'}. Review the diff, then apply or reject it.`,
        'success',
      );
    },
    onChangesApplied: (changeSetId) => {
      const hadPendingChangeSet = Boolean(chatState.pendingChangeSet);
      chatState.setPendingChangeSet(null);
      if (hadPendingChangeSet) {
        chatState.appendMessage('system', `Applied change set ${changeSetId}.`, 'success');
      }
      setRunFeedback((current) => ({
        ...current,
        status: current.status === 'error' ? 'error' : 'done',
      }));
    },
    onChangesRejected: (changeSetId) => {
      const hadPendingChangeSet = Boolean(chatState.pendingChangeSet);
      chatState.setPendingChangeSet(null);
      if (hadPendingChangeSet) {
        chatState.appendMessage('system', `Rejected change set ${changeSetId}.`);
      }
    },
    onLogMessage: (level, message) => {
      if (level === 'error') {
        appendLogFeedback('error', message);
        setRunFeedback((current) => ({
          ...current,
          status: 'error',
        }));
        return;
      }

      if (level === 'warn') {
        appendLogFeedback('warning', message);
      }
    },
    onTaskStatus: (phase, message) => {
      appendStatusFeedback({
        type: 'status',
        kind: 'info',
        phase,
        message,
      });
    },
    onTaskStage: (stage, message) => {
      appendStageFeedback({
        type: 'stage',
        kind: 'info',
        stage,
        message,
      });
    },
    onTaskOperation: (operationEvent) => {
      appendOperationFeedback({
        type: 'operation',
        kind: operationEvent.kind ?? 'info',
        operation: operationEvent.operation,
        target: operationEvent.target,
        message: operationEvent.message,
        additions: operationEvent.additions,
        deletions: operationEvent.deletions,
      });
    },
    onError: (message) => {
      chatState.setIsWaitingForResponse(false);
      chatState.appendMessage('system', message, 'error');
      appendLogFeedback('error', message);
      setRunFeedback((current) => ({
        ...current,
        status: 'error',
      }));
    },
    onDone: (finalText) => {
      chatState.flushAssistantMessage(finalText);
      chatState.setIsWaitingForResponse(false);
      setRunFeedback((current) => ({
        ...current,
        status: current.status === 'error' ? 'error' : 'done',
      }));
    },
  });

  // Handlers
  const handleSubmit = useCallback((): void => {
    const prompt = composerValue.trim();
    if (!prompt || chatState.isWaitingForResponse) {
      return;
    }

    const sent = sendRequest({
      type: 'chat.send',
      sessionId: sessionIdRef.current,
      message: prompt,
      mode: selectedModel,
      agent: selectedAgent,
      model: selectedModel,
    });

    if (!sent) {
      return;
    }

    chatState.appendMessage('user', prompt);
    setRunFeedback({
      status: 'running',
      entries: [
        {
          id: createFeedbackEntryId(),
          type: 'status',
          kind: 'info',
          phase: 'submitted',
          message: 'Sending request',
        },
      ],
    });
    setComposerValue('');
    chatState.setIsWaitingForResponse(true);
    chatState.setStreamingText('');
  }, [chatState, composerValue, createFeedbackEntryId, selectedAgent, selectedModel, sendRequest]);

  const handleApplyChangeSet = useCallback((): void => {
    if (!chatState.pendingChangeSet) {
      return;
    }

    sendRequest({
      type: 'changes.apply',
      sessionId: sessionIdRef.current,
      changeSetId: chatState.pendingChangeSet.changeSetId,
    });
  }, [chatState.pendingChangeSet, sendRequest]);

  const handleRejectChangeSet = useCallback((): void => {
    if (!chatState.pendingChangeSet) {
      return;
    }

    sendRequest({
      type: 'changes.reject',
      sessionId: sessionIdRef.current,
      changeSetId: chatState.pendingChangeSet.changeSetId,
    });
  }, [chatState.pendingChangeSet, sendRequest]);

  const handleComposerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const showRunFeedback =
    runFeedback.status !== 'idle' &&
    runFeedback.status !== 'done' &&
    (runFeedback.entries.length > 0 || Boolean(chatState.pendingChangeSet));

  return (
    <Styled.Root aria-label="Fusion AI Dev chat panel">
      <Header
        connectionState={connectionState}
        socketUrl={socketUrl}
        showSystemMessages={chatState.showSystemMessages}
        hiddenSystemMessageCount={chatState.hiddenSystemMessageCount}
        onToggleSystemMessages={() => chatState.setShowSystemMessages((x) => !x)}
        onClose={() => props.onClose?.()}
      />

      <Timeline
        messages={chatState.visibleMessages}
        streamingText={chatState.streamingText}
        runFeedback={
          !showRunFeedback
            ? null
            : {
                status: runFeedback.status,
                entries: runFeedback.entries,
              }
        }
        pendingChangeSet={chatState.pendingChangeSet}
      />

      <Styled.ActionLine>
        <Styled.ActionLineText>
          Files changed: {chatState.pendingChangeSet?.files.length ?? 0}
        </Styled.ActionLineText>
        <Styled.ActionLineActions>
          <Button
            variant="ghost"
            onClick={chatState.handleClear}
            style={{ minHeight: 24, padding: '0 6px', fontSize: '0.72rem' }}
          >
            Clear
          </Button>
          {chatState.pendingChangeSet ? (
            <>
              <Button
                variant="ghost_icon"
                title="Keep changes"
                onClick={handleApplyChangeSet}
                style={{ minWidth: 24, minHeight: 24, padding: 2 }}
              >
                <Icon data={done} size={16} />
              </Button>
              <Button
                variant="ghost_icon"
                title="Undo changes"
                onClick={handleRejectChangeSet}
                style={{ minWidth: 24, minHeight: 24, padding: 2 }}
              >
                <Icon data={undo} size={16} />
              </Button>
            </>
          ) : null}
        </Styled.ActionLineActions>
      </Styled.ActionLine>

      <Composer
        value={composerValue}
        selectedAgent={selectedAgent}
        selectedModel={selectedModel}
        availableAgents={availableAgents}
        availableModels={availableModels}
        isDisabled={connectionState !== 'connected' || chatState.isWaitingForResponse}
        isButtonDisabled={
          connectionState !== 'connected' || chatState.isWaitingForResponse || !composerValue.trim()
        }
        onAgentChange={setSelectedAgent}
        onModelChange={setSelectedModel}
        onChange={setComposerValue}
        onKeyDown={handleComposerKeyDown}
        onSubmit={handleSubmit}
      />
    </Styled.Root>
  );
}

export default AiDevChatPanel;
