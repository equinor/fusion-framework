import { Button, Typography } from '@equinor/eds-core-react';
import type {
  ClientRequest,
  FileOperation,
  ServerEvent,
} from '@equinor/fusion-framework-cli-plugin-ai-studio';
import type { ChangeEvent, KeyboardEvent, TextareaHTMLAttributes } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

type ConnectionState = 'connecting' | 'connected' | 'disconnected';
type MessageTone = 'default' | 'error' | 'success';
type MessageRole = 'user' | 'assistant' | 'system';

interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly content: string;
  readonly ts: number;
  readonly tone?: MessageTone;
}

interface PendingChangeSet {
  readonly changeSetId: string;
  readonly files: FileOperation[];
}

type ComposerInputProps = TextareaHTMLAttributes<HTMLTextAreaElement>;
const SYSTEM_MESSAGE_FILTER_STORAGE_KEY = 'fusion.ai-dev.show-system-messages';

const resolveAiDevSocketUrl = (): string => {
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

const Styled = {
  Root: styled.aside`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
    background: #1e1e1e;
    color: #d4d4d4;
    border-right: 1px solid #2d2d2d;
  `,
  Header: styled.header`
    display: grid;
    gap: 0.7rem;
    padding: 0.75rem;
    border-bottom: 1px solid #2d2d2d;
    background: #252526;
  `,
  HeaderTop: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  `,
  HeaderEyebrow: styled.div`
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9da0a6;
  `,
  HeaderIntro: styled.div`
    display: grid;
    gap: 0.18rem;
  `,
  HeaderMeta: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #9da0a6;
    white-space: nowrap;
  `,
  StatusCard: styled.div<{ $state: ConnectionState }>`
    display: grid;
    gap: 0.28rem;
    padding: 0.65rem 0.7rem;
    border-radius: 6px;
    border: 1px solid
      ${({ $state }) => ($state === 'connected' ? '#1f6f46' : $state === 'connecting' ? '#5c4a2d' : '#5a2f2f')};
    background: ${({ $state }) => ($state === 'connected' ? '#173224' : $state === 'connecting' ? '#3b311f' : '#3a2323')};
  `,
  StatusTitle: styled.div`
    font-size: 0.8rem;
    font-weight: 600;
  `,
  StatusCopy: styled.div`
    font-size: 0.76rem;
    line-height: 1.45;
    color: #c5c8cc;
    word-break: break-word;
  `,
  HeaderActions: styled.div`
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    align-items: center;
  `,
  Select: styled.select`
    border: 1px solid #3c3c3c;
    border-radius: 4px;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.3rem 0.45rem;
    font-size: 0.74rem;
    min-width: 7.5rem;
  `,
  Timeline: styled.section`
    overflow: auto;
    padding: 0.75rem;
    display: grid;
    gap: 0.75rem;
    align-content: start;
  `,
  MessageRow: styled.article`
    display: flex;
  `,
  Message: styled.div<{ $role: MessageRole; $tone: MessageTone }>`
    width: 100%;
    border-radius: 6px;
    padding: 0.72rem 0.8rem;
    border: 1px solid
      ${({ $role, $tone }) => {
        if ($tone === 'error') {
          return '#5a2f2f';
        }

        if ($tone === 'success') {
          return '#1f6f46';
        }

        if ($role === 'user') {
          return '#0a4f82';
        }

        return '#3c3c3c';
      }};
    background: ${({ $role, $tone }) => {
      if ($tone === 'error') {
        return '#3a2323';
      }

      if ($tone === 'success') {
        return '#173224';
      }

      if ($role === 'user') {
        return '#04395e';
      }

      return '#252526';
    }};
  `,
  MessageMeta: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.32rem;
  `,
  MessageRole: styled.span`
    font-size: 0.72rem;
    font-weight: 600;
    color: #9da0a6;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  MessageTime: styled.span`
    font-size: 0.72rem;
    color: #9da0a6;
  `,
  MessageBody: styled.div`
    font-size: 0.88rem;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  EmptyState: styled.section`
    border: 1px dashed #3c3c3c;
    border-radius: 6px;
    padding: 1rem;
    background: #252526;
    display: grid;
    gap: 0.35rem;
  `,
  ChangeSetCard: styled.section`
    display: grid;
    gap: 0.65rem;
    border: 1px solid #5c4a2d;
    border-radius: 6px;
    background: #2d271d;
    padding: 0.75rem;
  `,
  ChangeSetHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  `,
  ChangeSetTitle: styled.div`
    font-size: 0.82rem;
    font-weight: 600;
    color: #f4d58d;
  `,
  FileList: styled.div`
    display: grid;
    gap: 0.5rem;
  `,
  FileCard: styled.section`
    display: grid;
    gap: 0.35rem;
    border: 1px solid #3c3c3c;
    border-radius: 6px;
    background: #1f1f1f;
    padding: 0.65rem;
  `,
  FilePath: styled.div`
    font-size: 0.76rem;
    font-weight: 600;
    color: #dcdcaa;
  `,
  Patch: styled.pre`
    margin: 0;
    overflow: auto;
    font-size: 0.74rem;
    line-height: 1.45;
    color: #d4d4d4;
    background: #111315;
    border-radius: 4px;
    padding: 0.6rem;
  `,
  ChangeSetActions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  `,
  Composer: styled.footer`
    border-top: 1px solid #2d2d2d;
    padding: 0.75rem;
    background: #1e1e1e;
  `,
  ComposerCard: styled.div`
    display: grid;
    gap: 0.55rem;
    border: 1px solid #3c3c3c;
    border-radius: 6px;
    background: #252526;
    padding: 0.7rem;
  `,
  ComposerInput: styled.textarea<ComposerInputProps>`
    width: 100%;
    min-height: 6.5rem;
    border: none;
    resize: vertical;
    background: transparent;
    color: #d4d4d4;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.55;
    padding: 0;

    &::placeholder {
      color: #8f949d;
    }

    &:focus {
      outline: none;
    }

    &:disabled {
      color: #8f949d;
      cursor: not-allowed;
    }
  `,
  ComposerFooter: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  `,
  ComposerHint: styled.div`
    font-size: 0.74rem;
    color: #9da0a6;
  `,
  ComposerActions: styled.div`
    display: flex;
    gap: 0.5rem;
  `,
};

const getRoleLabel = (role: MessageRole): string => {
  if (role === 'user') {
    return 'Prompt';
  }

  if (role === 'assistant') {
    return 'Assistant';
  }

  return 'System';
};

const getStatusText = (state: ConnectionState): string => {
  if (state === 'connected') {
    return 'Connected';
  }

  if (state === 'connecting') {
    return 'Connecting';
  }

  return 'Disconnected';
};

/**
 * Live AI chat panel for the dev portal.
 * @returns A chat UI backed by the experimental live-ai WebSocket server.
 */
export function AiDevChatPanel(): JSX.Element {
  const [messages, setMessages] = useState<Array<ChatMessage>>([]);
  const [showSystemMessages, setShowSystemMessages] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem(SYSTEM_MESSAGE_FILTER_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [composerValue, setComposerValue] = useState('');
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
  const [pendingChangeSet, setPendingChangeSet] = useState<PendingChangeSet | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const sessionIdRef = useRef(`session-${crypto.randomUUID()}`);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const streamingBufferRef = useRef('');
  const messageIdRef = useRef(0);
  const socketUrl = useMemo(() => resolveAiDevSocketUrl(), []);

  const createMessageId = useCallback((): string => {
    messageIdRef.current += 1;
    return `message-${messageIdRef.current}`;
  }, []);

  const visibleMessages = useMemo(
    () => (showSystemMessages ? messages : messages.filter((message) => message.role !== 'system')),
    [messages, showSystemMessages],
  );

  const hiddenSystemMessageCount = useMemo(
    () => messages.reduce((count, message) => count + (message.role === 'system' ? 1 : 0), 0),
    [messages],
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        SYSTEM_MESSAGE_FILTER_STORAGE_KEY,
        showSystemMessages ? 'true' : 'false',
      );
    } catch {
      // Ignore storage failures and keep current in-memory preference.
    }
  }, [showSystemMessages]);

  const appendMessage = useCallback(
    (role: MessageRole, content: string, tone: MessageTone = 'default'): void => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role,
          content,
          tone,
          ts: Date.now(),
        },
      ]);
    },
    [createMessageId],
  );

  const flushAssistantMessage = useCallback((): void => {
    const content = streamingBufferRef.current.trimEnd();
    if (!content) {
      setStreamingText('');
      return;
    }

    appendMessage('assistant', content);
    streamingBufferRef.current = '';
    setStreamingText('');
  }, [appendMessage]);

  const sendRequest = useCallback(
    (request: ClientRequest): boolean => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        appendMessage('system', 'Live AI server is not connected.', 'error');
        setConnectionState('disconnected');
        return false;
      }

      socket.send(JSON.stringify(request));
      return true;
    },
    [appendMessage],
  );

  useEffect(() => {
    let disposed = false;

    const connect = () => {
      if (disposed) {
        return;
      }

      setConnectionState('connecting');
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        if (disposed) {
          return;
        }

        setConnectionState('connected');
      });

      socket.addEventListener('message', (event: MessageEvent<string>) => {
        if (disposed) {
          return;
        }

        const payload = JSON.parse(event.data) as ServerEvent;

        switch (payload.type) {
          case 'config': {
            setAvailableAgents(payload.agents);
            setAvailableModels(payload.models);
            setSelectedAgent(payload.agents[0] || '');
            setSelectedModel(payload.models[0] || '');
            break;
          }
          case 'assistant.token': {
            streamingBufferRef.current += payload.token;
            setStreamingText(streamingBufferRef.current);
            break;
          }
          case 'changes.proposed': {
            setPendingChangeSet({
              changeSetId: payload.changeSetId,
              files: payload.files,
            });
            appendMessage(
              'system',
              `Proposed ${payload.files.length} file change${payload.files.length === 1 ? '' : 's'}. Review the diff, then apply or reject it.`,
              'success',
            );
            break;
          }
          case 'changes.applied': {
            setPendingChangeSet(null);
            appendMessage('system', `Applied change set ${payload.changeSetId}.`, 'success');
            break;
          }
          case 'changes.rejected': {
            setPendingChangeSet(null);
            appendMessage('system', `Rejected change set ${payload.changeSetId}.`);
            break;
          }
          case 'log': {
            if (payload.level === 'warn' || payload.level === 'error') {
              appendMessage(
                'system',
                payload.message,
                payload.level === 'error' ? 'error' : 'default',
              );
            }
            break;
          }
          case 'error': {
            setIsWaitingForResponse(false);
            appendMessage('system', payload.message, 'error');
            break;
          }
          case 'done': {
            flushAssistantMessage();
            setIsWaitingForResponse(false);
            break;
          }
        }
      });

      socket.addEventListener('close', () => {
        if (disposed) {
          return;
        }

        socketRef.current = null;
        setConnectionState('disconnected');
        setIsWaitingForResponse(false);
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
  }, [appendMessage, flushAssistantMessage, socketUrl]);

  const handleSubmit = useCallback((): void => {
    const prompt = composerValue.trim();
    if (!prompt || isWaitingForResponse) {
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

    appendMessage('user', prompt);
    setComposerValue('');
    setIsWaitingForResponse(true);
    streamingBufferRef.current = '';
    setStreamingText('');
  }, [
    appendMessage,
    composerValue,
    isWaitingForResponse,
    selectedAgent,
    selectedModel,
    sendRequest,
  ]);

  const handleApply = useCallback((): void => {
    if (!pendingChangeSet) {
      return;
    }

    sendRequest({
      type: 'changes.apply',
      sessionId: sessionIdRef.current,
      changeSetId: pendingChangeSet.changeSetId,
    });
  }, [pendingChangeSet, sendRequest]);

  const handleReject = useCallback((): void => {
    if (!pendingChangeSet) {
      return;
    }

    sendRequest({
      type: 'changes.reject',
      sessionId: sessionIdRef.current,
      changeSetId: pendingChangeSet.changeSetId,
    });
  }, [pendingChangeSet, sendRequest]);

  const handleClear = useCallback((): void => {
    setMessages([]);
    setPendingChangeSet(null);
    streamingBufferRef.current = '';
    setStreamingText('');
  }, []);

  return (
    <Styled.Root aria-label="Fusion AI Dev chat panel">
      <Styled.Header>
        <Styled.HeaderTop>
          <div>
            <Styled.HeaderEyebrow>Live AI</Styled.HeaderEyebrow>
            <Styled.HeaderIntro>
              <Typography variant="h6">Developer Chat</Typography>
              <Typography variant="body_short" color="secondary">
                Stream assistant output, inspect diffs, and apply changes locally.
              </Typography>
            </Styled.HeaderIntro>
          </div>
          <Styled.HeaderMeta>
            <span>{getStatusText(connectionState)}</span>
            <span>•</span>
            <span>{visibleMessages.length} msgs</span>
          </Styled.HeaderMeta>
        </Styled.HeaderTop>
        <Styled.StatusCard $state={connectionState}>
          <Styled.StatusTitle>{getStatusText(connectionState)}</Styled.StatusTitle>
          <Styled.StatusCopy>
            {connectionState === 'connected'
              ? `Connected to ${socketUrl}`
              : connectionState === 'connecting'
                ? `Connecting to ${socketUrl}`
                : `Server unavailable at ${socketUrl}. Start fusion-framework-cli live-ai serve.`}
          </Styled.StatusCopy>
        </Styled.StatusCard>
        <Styled.HeaderActions>
          <Styled.Select
            aria-label="Select AI agent"
            value={selectedAgent}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedAgent(event.currentTarget.value)
            }
            disabled={availableAgents.length === 0}
          >
            <option value="">Loading agents...</option>
            {availableAgents.map((option) => (
              <option key={option} value={option}>
                Agent: {option}
              </option>
            ))}
          </Styled.Select>
          <Styled.Select
            aria-label="Select AI model"
            value={selectedModel}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              setSelectedModel(event.currentTarget.value)
            }
            disabled={availableModels.length === 0}
          >
            <option value="">Loading models...</option>
            {availableModels.map((option) => (
              <option key={option} value={option}>
                Model: {option}
              </option>
            ))}
          </Styled.Select>
          <Button variant="ghost" onClick={() => setShowSystemMessages((value) => !value)}>
            {showSystemMessages
              ? 'Hide system'
              : hiddenSystemMessageCount > 0
                ? `Show system (${hiddenSystemMessageCount})`
                : 'Show system'}
          </Button>
          <Button variant="outlined" onClick={handleClear}>
            Clear
          </Button>
        </Styled.HeaderActions>
      </Styled.Header>

      <Styled.Timeline>
        {visibleMessages.length === 0 && !streamingText && !pendingChangeSet ? (
          <Styled.EmptyState>
            <Typography variant="body_short" color="secondary">
              No conversation yet.
            </Typography>
            <Typography variant="body_short" color="secondary">
              Ask for a change and the server will stream a response plus a proposed diff.
            </Typography>
          </Styled.EmptyState>
        ) : null}

        {visibleMessages.map((message) => (
          <Styled.MessageRow key={message.id}>
            <Styled.Message $role={message.role} $tone={message.tone ?? 'default'}>
              <Styled.MessageMeta>
                <Styled.MessageRole>{getRoleLabel(message.role)}</Styled.MessageRole>
                <Styled.MessageTime>{new Date(message.ts).toLocaleTimeString()}</Styled.MessageTime>
              </Styled.MessageMeta>
              <Styled.MessageBody>{message.content}</Styled.MessageBody>
            </Styled.Message>
          </Styled.MessageRow>
        ))}

        {streamingText ? (
          <Styled.MessageRow>
            <Styled.Message $role="assistant" $tone="default">
              <Styled.MessageMeta>
                <Styled.MessageRole>Assistant</Styled.MessageRole>
                <Styled.MessageTime>streaming</Styled.MessageTime>
              </Styled.MessageMeta>
              <Styled.MessageBody>{streamingText}</Styled.MessageBody>
            </Styled.Message>
          </Styled.MessageRow>
        ) : null}

        {pendingChangeSet ? (
          <Styled.ChangeSetCard>
            <Styled.ChangeSetHeader>
              <Styled.ChangeSetTitle>Pending Change Set</Styled.ChangeSetTitle>
              <Typography variant="caption" color="secondary">
                {pendingChangeSet.changeSetId}
              </Typography>
            </Styled.ChangeSetHeader>
            <Styled.FileList>
              {pendingChangeSet.files.map((file) => (
                <Styled.FileCard key={file.path}>
                  <Styled.FilePath>{file.path}</Styled.FilePath>
                  <Styled.Patch>{file.patch}</Styled.Patch>
                </Styled.FileCard>
              ))}
            </Styled.FileList>
            <Styled.ChangeSetActions>
              <Button variant="outlined" onClick={handleReject}>
                Reject
              </Button>
              <Button variant="contained" onClick={handleApply}>
                Apply
              </Button>
            </Styled.ChangeSetActions>
          </Styled.ChangeSetCard>
        ) : null}
      </Styled.Timeline>

      <Styled.Composer>
        <Styled.ComposerCard>
          <Styled.ComposerInput
            id="ai-dev-chat-input"
            placeholder="Describe what to build"
            value={composerValue}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
              setComposerValue(event.currentTarget.value)
            }
            onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            disabled={connectionState !== 'connected' || isWaitingForResponse}
          />
          <Styled.ComposerFooter>
            <Styled.ComposerHint>
              Shift+Enter for a new line. Enter sends the prompt.
            </Styled.ComposerHint>
            <Styled.ComposerActions>
              <Button
                variant="contained"
                disabled={
                  connectionState !== 'connected' || isWaitingForResponse || !composerValue.trim()
                }
                onClick={handleSubmit}
              >
                Send
              </Button>
            </Styled.ComposerActions>
          </Styled.ComposerFooter>
        </Styled.ComposerCard>
      </Styled.Composer>
    </Styled.Root>
  );
}

export default AiDevChatPanel;
