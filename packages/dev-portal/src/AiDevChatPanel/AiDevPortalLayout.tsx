import { useFrameworkFeatures } from '@equinor/fusion-framework-react/feature-flag';
import { useEventProvider } from '@equinor/fusion-framework-react-module-event';
import { type ReactNode, useEffect, useState } from 'react';
import { styled } from 'styled-components';

import { Header } from '../Header';
import { AiDevChatSidebar } from './index.js';

const AI_DEV_RECONNECT_DELAY = 2000;

const resolveAiDevSocketUrl = (env: Record<string, string | boolean | undefined>): string => {
  const configured =
    typeof env.FUSION_SPA_AI_DEV_WS_URL === 'string' ? env.FUSION_SPA_AI_DEV_WS_URL : undefined;
  if (configured && configured.trim().length > 0) {
    return configured;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.hostname}:8787/ws`;
};

const Styled = {
  ContentContainer: styled.div<{
    $aiDevEnabled: boolean;
    $isChatOpen: boolean;
  }>`
        display: grid;
        grid-template-columns: ${({ $aiDevEnabled, $isChatOpen }) =>
          $aiDevEnabled ? `${$isChatOpen ? 'auto' : '0rem'} minmax(0, 1fr)` : 'minmax(0, 1fr)'};
        grid-template-rows: 48px 1fr;
        height: 100vh;
        overflow: hidden;
        grid-template-areas: ${({ $aiDevEnabled }) =>
          $aiDevEnabled ? '"head head" "chat main"' : '"head" "main"'};
        transition: grid-template-columns 120ms ease;

        @media (max-width: 960px) {
          grid-template-columns: minmax(0, 1fr);
          grid-template-areas: 'head' 'main';
        }
    `,
  Head: styled.section`
        grid-area: head;
    `,
  Main: styled.section`
        grid-area: main;
        overflow: auto;
        position: relative;
        max-width: 100%;
        display: grid;
    `,
};

type AiDevPortalLayoutProps = {
  readonly children: ReactNode;
};

export const AiDevPortalLayout = ({ children }: AiDevPortalLayoutProps): JSX.Element => {
  const env = import.meta as ImportMeta & {
    readonly env: Record<string, string | boolean | undefined>;
  };
  const aiDevSocketUrl = resolveAiDevSocketUrl(env.env);
  const events = useEventProvider();
  const { features } = useFrameworkFeatures();
  const [isAiDevAvailable, setIsAiDevAvailable] = useState(false);
  const [isAiDevOpen, setIsAiDevOpen] = useState(false);
  const aiDevEnabled = Boolean(features?.find((feature) => feature.key === 'aiDev')?.enabled);

  useEffect(() => {
    if (!aiDevEnabled) {
      setIsAiDevAvailable(false);
      setIsAiDevOpen(false);
      return;
    }

    let disposed = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;

    const connect = () => {
      if (disposed) return;

      socket = new WebSocket(aiDevSocketUrl);

      const broadcastStatus = (available: boolean) => {
        for (const iframe of Array.from(document.querySelectorAll('iframe'))) {
          iframe.contentWindow?.postMessage(
            { type: 'ai-dev.status', available },
            window.location.origin,
          );
        }
      };

      socket.addEventListener('open', () => {
        if (disposed) {
          socket?.close();
          return;
        }
        setIsAiDevAvailable(true);
        void events.dispatchEvent('ai-dev.status', {
          detail: { available: true },
          source: 'dev-portal',
        });
        broadcastStatus(true);
      });

      const handleDisconnect = () => {
        if (disposed) return;
        setIsAiDevAvailable(false);
        setIsAiDevOpen(false);
        void events.dispatchEvent('ai-dev.status', {
          detail: { available: false },
          source: 'dev-portal',
        });
        broadcastStatus(false);
        reconnectTimer = window.setTimeout(connect, AI_DEV_RECONNECT_DELAY);
      };

      socket.addEventListener('close', handleDisconnect);
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [aiDevEnabled, aiDevSocketUrl, events]);

  useEffect(() => {
    const removeListener = events.addEventListener('ai-dev.open', () => {
      if (isAiDevAvailable) setIsAiDevOpen(true);
    });

    return () => {
      removeListener();
    };
  }, [events, isAiDevAvailable]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (
        typeof event.data === 'object' &&
        event.data !== null &&
        'type' in event.data &&
        event.data.type === 'ai-dev.open'
      ) {
        void events.dispatchEvent('ai-dev.open', {
          detail: { source: 'iframe-postmessage' },
          source: 'iframe-postmessage',
        });
      }
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [events]);

  return (
    <Styled.ContentContainer $aiDevEnabled={aiDevEnabled} $isChatOpen={isAiDevOpen}>
      <Styled.Head>
        <Header
          aiDevEnabled={aiDevEnabled}
          aiDevAvailable={isAiDevAvailable}
          aiDevWarning={
            aiDevEnabled && !isAiDevAvailable
              ? 'AI Dev server is not running or cannot be reached. Start the local server with:'
              : undefined
          }
          toggleAiDev={setIsAiDevOpen}
        />
      </Styled.Head>
      {aiDevEnabled ? (
        <AiDevChatSidebar isOpen={isAiDevOpen} onClose={() => setIsAiDevOpen(false)} />
      ) : null}
      <Styled.Main>{children}</Styled.Main>
    </Styled.ContentContainer>
  );
};
