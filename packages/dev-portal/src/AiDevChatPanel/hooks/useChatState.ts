import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SYSTEM_MESSAGE_FILTER_STORAGE_KEY } from '../constants.js';
import type { ChatMessage, MessageRole, MessageTone, PendingChangeSet } from '../types.js';

/**
 * Hook that manages chat messages, filtering, and change sets.
 */
export function useChatState() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showSystemMessages, setShowSystemMessages] = useState<boolean>(() => {
    try {
      const persisted = window.localStorage.getItem(SYSTEM_MESSAGE_FILTER_STORAGE_KEY);
      if (persisted === null) {
        // Default to visible to surface progress/events in experimental mode.
        return true;
      }

      return persisted === 'true';
    } catch {
      return true;
    }
  });
  const [pendingChangeSet, setPendingChangeSet] = useState<PendingChangeSet | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const messageIdRef = useRef(0);

  const createMessageId = useCallback((): string => {
    messageIdRef.current += 1;
    return `message-${messageIdRef.current}`;
  }, []);

  const visibleMessages = useMemo(
    () => (showSystemMessages ? messages : messages.filter((m) => m.role !== 'system')),
    [messages, showSystemMessages],
  );

  const hiddenSystemMessageCount = useMemo(
    () => messages.reduce((count, m) => count + (m.role === 'system' ? 1 : 0), 0),
    [messages],
  );

  // Persist system message filter preference
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SYSTEM_MESSAGE_FILTER_STORAGE_KEY,
        showSystemMessages ? 'true' : 'false',
      );
    } catch {
      // Ignore storage failures
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
    const content = streamingText.trimEnd();
    if (!content) {
      setStreamingText('');
      return;
    }

    appendMessage('assistant', content);
    setStreamingText('');
  }, [streamingText, appendMessage]);

  const handleClear = useCallback((): void => {
    setMessages([]);
    setPendingChangeSet(null);
    setStreamingText('');
  }, []);

  return {
    // Messages
    messages,
    visibleMessages,
    appendMessage,
    flushAssistantMessage,
    // System message filtering
    showSystemMessages,
    setShowSystemMessages,
    hiddenSystemMessageCount,
    // Streaming
    streamingText,
    setStreamingText,
    // Response state
    isWaitingForResponse,
    setIsWaitingForResponse,
    // Change sets
    pendingChangeSet,
    setPendingChangeSet,
    // Utils
    handleClear,
  };
}
