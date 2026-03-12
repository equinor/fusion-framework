import { useCallback, useMemo, useRef, useState } from 'react';
import { resolveAiDevSocketUrl } from './constants.js';
import { useAiDevSocket, useChatState } from './hooks/index.js';
import { Styled } from './styles.js';
import { Header, Timeline, Composer } from './components/index.js';

interface RunFeedbackState {
  status: 'idle' | 'running' | 'done' | 'error';
  title: string;
  lines: string[];
  collapsed: boolean;
}

/**
 * Live AI chat panel for the dev portal.
 * Orchestrates WebSocket connection, state management, and UI component composition.
 */
export function AiDevChatPanel(): JSX.Element {
  const socketUrl = useMemo(() => resolveAiDevSocketUrl(), []);
  const chatState = useChatState();
  const sessionIdRef = useRef(`session-${crypto.randomUUID()}`);
  const [composerValue, setComposerValue] = useState('');
  const [runFeedback, setRunFeedback] = useState<RunFeedbackState>({
    status: 'idle',
    title: 'Waiting for request',
    lines: [],
    collapsed: false,
  });

  const appendFeedbackLine = useCallback((line: string): void => {
    setRunFeedback((current) => {
      const nextLines = [...current.lines, line].slice(-24);
      return {
        ...current,
        lines: nextLines,
      };
    });
  }, []);

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
      chatState.setPendingChangeSet(null);
      chatState.appendMessage('system', `Applied change set ${changeSetId}.`, 'success');
      setRunFeedback((current) => ({
        ...current,
        status: current.status === 'error' ? 'error' : 'done',
        title: `Completed. Applied ${changeSetId}.`,
        collapsed: true,
      }));
    },
    onChangesRejected: (changeSetId) => {
      chatState.setPendingChangeSet(null);
      chatState.appendMessage('system', `Rejected change set ${changeSetId}.`);
    },
    onLogMessage: (level, message) => {
      const label = level === 'error' ? 'Error' : level === 'warn' ? 'Warning' : 'Info';
      appendFeedbackLine(`${label}: ${message}`);
      if (level === 'error') {
        setRunFeedback((current) => ({
          ...current,
          status: 'error',
          title: 'Completed with errors',
          collapsed: true,
        }));
      }
    },
    onError: (message) => {
      chatState.setIsWaitingForResponse(false);
      chatState.appendMessage('system', message, 'error');
      setRunFeedback((current) => ({
        ...current,
        status: 'error',
        title: 'Run failed',
        lines: [...current.lines, `Error: ${message}`].slice(-24),
        collapsed: true,
      }));
    },
    onDone: () => {
      chatState.flushAssistantMessage();
      chatState.setIsWaitingForResponse(false);
      setRunFeedback((current) => ({
        ...current,
        status: current.status === 'error' ? 'error' : 'done',
        title: current.status === 'error' ? 'Completed with errors' : 'Completed successfully',
        collapsed: true,
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
      title: 'AI is working...',
      collapsed: false,
      lines: ['Info: Request sent. Waiting for assistant response...'],
    });
    setComposerValue('');
    chatState.setIsWaitingForResponse(true);
    chatState.setStreamingText('');
  }, [chatState, composerValue, selectedAgent, selectedModel, sendRequest]);

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

  return (
    <Styled.Root aria-label="Fusion AI Dev chat panel">
      <Header
        connectionState={connectionState}
        socketUrl={socketUrl}
        visibleMessagesCount={chatState.visibleMessages.length}
        selectedAgent={selectedAgent}
        selectedModel={selectedModel}
        availableAgents={availableAgents}
        availableModels={availableModels}
        showSystemMessages={chatState.showSystemMessages}
        hiddenSystemMessageCount={chatState.hiddenSystemMessageCount}
        onAgentChange={setSelectedAgent}
        onModelChange={setSelectedModel}
        onToggleSystemMessages={() => chatState.setShowSystemMessages((x) => !x)}
        onClear={chatState.handleClear}
      />

      <Timeline
        messages={chatState.visibleMessages}
        streamingText={chatState.streamingText}
        runFeedback={
          runFeedback.status === 'idle'
            ? null
            : {
                status: runFeedback.status,
                title: runFeedback.title,
                lines: runFeedback.lines,
                collapsed: runFeedback.collapsed,
              }
        }
        onToggleRunFeedback={() => {
          setRunFeedback((current) => ({
            ...current,
            collapsed: !current.collapsed,
          }));
        }}
        pendingChangeSet={chatState.pendingChangeSet}
        onApplyChangeSet={handleApplyChangeSet}
        onRejectChangeSet={handleRejectChangeSet}
      />

      <Composer
        value={composerValue}
        isDisabled={connectionState !== 'connected' || chatState.isWaitingForResponse}
        isButtonDisabled={
          connectionState !== 'connected' || chatState.isWaitingForResponse || !composerValue.trim()
        }
        onChange={setComposerValue}
        onKeyDown={handleComposerKeyDown}
        onSubmit={handleSubmit}
      />
    </Styled.Root>
  );
}

export default AiDevChatPanel;
