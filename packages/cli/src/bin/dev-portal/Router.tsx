import { useBookmarkNavigate } from '@equinor/fusion-framework-react-module-bookmark/portal';

import { Outlet, RouterProvider, type RouterProviderProps, useParams } from 'react-router-dom';
import AppLoader from './AppLoader';
import { Header } from './Header';

import { useFramework, useFrameworkModule } from '@equinor/fusion-framework-react';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'styled-components';
import { useAppContextNavigation } from './useAppContextNavigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FusionAssistantModal } from './help-chat/FusionAssistantModal';
import { Avatar, Button, Icon, Input } from '@equinor/eds-core-react';
import { comment_chat, fullscreen, fullscreen_exit, close, send } from '@equinor/eds-icons';
import { tokens } from '@equinor/eds-tokens';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { v4 as uuid } from 'uuid';
import createSseSelector from '../../../../modules/http/src/lib/selectors/sse-selector';
import { sseMap } from '@equinor/fusion-framework-module-http/operators';

import type { AuthenticationResult } from '@equinor/fusion-framework-module-msal';

type Message = {
  id: string;
  author: 'bot' | 'me';
  message: string;
};

const Styled = {
  ContentContainer: styled.div`
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 48px 1fr;
        height: 100vh;
        overflow: hidden;
        grid-template-areas: 'head' 'main';
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
  ChatButton: styled.div`
    position: absolute;
    right: 1em;
    bottom: 1em;
    background: ${tokens.colors.ui.background__info.hex};
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 3em;
    height: 3em;

    &:hover,
    &:active {
      cursor: pointer;
    }
  `,
  ChatBox: styled.div<{ open: boolean; fullscreen: boolean }>`
    display: ${(props) => props.open ? 'block' : 'none'};
    position: absolute;
    background: #fff;
    right: ${(props) => props.fullscreen ? 'unset' : '1em'};
    left: ${(props) => props.fullscreen ? '0' : 'unset'};
    bottom: ${(props) => props.fullscreen ? '0' : 'calc(1em + 3em + 1em)'};
    border: 1px solid #000;
    min-width: ${(props) => props.fullscreen ? 'calc(100% - 2px)' : '400px'};
    height: ${(props) => props.fullscreen ? 'calc(100% - 2px)' : '550px'};
  `,
  ChatTop: styled.div`
    display: flex;
    justify-content: end;
    align-items: center;
  `,
  ChatMessagesWrapper: styled.div`
    height: calc(100% - 95px);
    overflow-y: scroll;
  `,
  ChatInputWrapper: styled.div`
    display: flex;
    padding: .5em;
  `,
  ChatMessageRow: styled.div<{ author: Message['author'] }>`
    display: flex;
    padding: .5em;
    justify-content: ${(props) => props.author === 'bot' ? 'start' : 'end'};
    flex-direction: ${(props) => props.author === 'bot' ? 'row' : 'row-reverse'};
    gap: .5em;
  `,
  ChatMessage: styled.div`
    width: 75%;
    background: ${tokens.colors.ui.background__info.hex};
    padding: .5em;
  `,
};


const queryClient = new QueryClient();

type MessageData = {
  choices: {
    delta: {
      content?: string;
    }
  }[]
};

const Root = () => {
  Icon.add({ comment_chat, fullscreen, fullscreen_exit, close, send });
  const { currentApp } = useCurrentApp();
  const chatMessageWrapper = useRef<HTMLDivElement>(null);
  const chatInput = useRef<HTMLInputElement>();
  const [isChatFullscreen, setChatFullscreen] = useState<boolean>(false);
  const [isChatOpen, setChatOpen] = useState<boolean>(false);


  const useToken = (req: {
      scopes: string[];
  }) => {
      const msalProvider = useFrameworkModule('auth');
      const [token, setToken] = useState<AuthenticationResult | undefined>(undefined);
      const [pending, setPending] = useState(false);
      const [error, setError] = useState(null);
      useEffect(() => {
          setPending(true);
          setToken(undefined);
          if (msalProvider) {
            msalProvider
                .acquireToken(req)
                .then((token) => token && setToken(token))
                .catch(setError)
                .finally(() => setPending(false));
          }
      }, [msalProvider, req]);
      return { token, pending, error };
  };
  const framework = useFramework();
  const [scopes, setScopes] = useState<string[]>([]);
  useEffect(() => {
    /**
     * get default scope from the framework service discovery module
     */
    framework.modules.serviceDiscovery
      .resolveService('portal')
      .then((x) => x.defaultScopes)
      .then(setScopes);
  }, [framework]);
  const { token } = useToken(useMemo(() => ({ scopes }), [scopes]));

  const http = useFrameworkModule('http')
  const chatClient = useMemo(() => {
    if (http?.hasClient('help-chat')) {
      return http.createClient('help-chat');
    }
    throw Error('no configured client for key [help-chat]');
  }, [http]);

  // const sseSelector = ;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuid(),
      author: 'bot',
      message: 'test',
    },
    {
      id: uuid(),
      author: 'me',
      message: 'user',
    }
  ]);

  const getStream = (body: { userPrompt: string; appKey: string }, id: string) => {
    const eventStream$ = chatClient.sse$<{ message: string; id: string; }>('/ai/help/chat-stream?api-version=1.0-preview', {
      method: 'POST',
      body: JSON.stringify(body),
      credentials: 'include',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token?.accessToken}`,
      },
      selector: createSseSelector<{ message: string; id: string }>({
        dataParser: (data) => {
          // console.log('hei', data);
          if (data === '[DONE]') {
            console.log('done message');
            return {
              message: '',
              id: id,
            };
          }
          const parsed = JSON.parse(data) as MessageData;

          const result = {
            message: parsed.choices.map((choice) => choice.delta.content).join(),
            id: id,
          };
          console.log(result);

          return result;
        },
        skipHeartbeats: true,
        eventFilter: ['message', 'update'],
      })
    });

    // const subscription = eventStream$.subscribe({
    eventStream$.subscribe({
      next: (event) => {
        console.log('Received event:', event)

        if (event.data) {
          const { id, message } = event.data;
          const newMessages = messages.map((m) => {
            if (m.id === id) {
              m.message += message;
            }

            return m;
          });

          setMessages(newMessages);
        }
      },
      error: (error: Error) => {
        console.error('An error occurred:', error)
        const newMessages = Array.from(messages);
        newMessages.push({
          id: uuid(),
          message: error.message,
          author: 'bot',
        });
        setMessages(newMessages);
      },
      complete: () => console.log('Event stream completed'),
    });

    // subscription.unsubscribe();

    /////
    // chatClient.sse$
    // const sseStream$ = chatClient.fetch$('/ai/help/chat-stream?api-version=1.0-preview', {
    //   selector: sseSelector,
    //   headers: {
    //     'Accept': 'text/event-stream',
    //     'Cache-Control': 'no-cache',
    //     'Connection': 'keep-alive',
    //     'Content-Type': 'application/json',
    //   },
    //   method: 'POST',
    //   body: JSON.stringify(body),
    // }).pipe(
    //   sseMap<{ message: string }, Response>({
    //     dataParser: (data) => JSON.parse(data),
    //     skipHeartbeats: true,
    //     eventFilter: ['message', 'update'],
    //   }),
    // );

    // sseStream$.subscribe({
    //   next: (event) => console.log('Received event:', event),
    //   error: (error) => console.error('An error occurred:', error),
    //   complete: () => console.log('Event stream completed'),
    // });


    // return sseStream$;
  }


  const onChatSubmit = () => {
    const prompt = chatInput.current?.value || '';

    if (chatInput.current) {
      chatInput.current.value = '';
    }

    const botMessageId = uuid();
    const newMessages = Array.from(messages);
    newMessages.push({
      id: uuid(),
      author: 'me',
      message: prompt,
    });

    newMessages.push({
      id: botMessageId,
      author: 'bot',
      message: '...',
    });
    setMessages(newMessages);

    const body = {
      userPrompt: prompt,
      // appKey: currentApp?.appKey || '',
      appKey: 'contract-personnel',
    }

    getStream(body, botMessageId);
  };

  useEffect(() => {
    if (messages) {
      chatMessageWrapper.current?.scrollTo({
        top: chatMessageWrapper.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useBookmarkNavigate({ resolveAppPath: (appKey: string) => `/apps/${appKey}` });
  return (
    <Styled.ContentContainer>
      <Styled.Head>
        <QueryClientProvider client={queryClient}>
          <Header />
        </QueryClientProvider>
      </Styled.Head>
      <Styled.Main>
        <>
          <Outlet />
          <Styled.ChatButton onClick={() => setChatOpen(!isChatOpen)}>
            <Icon name="comment_chat" />
          </Styled.ChatButton>
          <Styled.ChatBox fullscreen={isChatFullscreen} open={isChatOpen}>
            <Styled.ChatTop>
              <Button color='primary' variant='ghost_icon' onClick={() => setChatFullscreen(!isChatFullscreen)}>
                <Icon name={isChatFullscreen ? 'fullscreen_exit' : 'fullscreen'} />
              </Button>

              <Button color='primary' variant='ghost_icon' onClick={() => setChatOpen(false)}>
                <Icon name='close' />
              </Button>
            </Styled.ChatTop>
            <Styled.ChatMessagesWrapper ref={chatMessageWrapper}>
              {messages.map((message) => {
                return (
                  <Styled.ChatMessageRow key={message.id} author={message.author}>
                    <Avatar alt='Bot' src={'https://i.imgur.com/UM3mrju.jpg'} size={48} />
                    <Styled.ChatMessage>
                      {message.message}
                    </Styled.ChatMessage>
                  </Styled.ChatMessageRow>
                );
              })}
            </Styled.ChatMessagesWrapper>
            <Styled.ChatInputWrapper>
              <Input
                placeholder="Write your message here"
                ref={chatInput}
                onKeyUp={(e: KeyboardEvent) => e.code === 'Enter' && onChatSubmit()}
              />
              <Button color='primary' variant='ghost_icon' onClick={onChatSubmit}>
                <Icon name='send' />
              </Button>
            </Styled.ChatInputWrapper>
          </Styled.ChatBox>
          <FusionAssistantModal />
        </>
      </Styled.Main>
    </Styled.ContentContainer>
  );
};

// eslint-disable-next-line react/no-multi-comp
const AppRoute = () => {
  const { appKey } = useParams();
  return appKey ? <AppLoader appKey={appKey} /> : null;
};

const routes = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'apps/:appKey/*',
        element: <AppRoute />,
      },
    ],
  },
];

// eslint-disable-next-line react/no-multi-comp
export const Router = () => {
  const { navigation } = useFramework<[NavigationModule]>().modules;
  const [router] = useState(() => navigation.createRouter(routes));
  // observe the context changes and navigate when the context changes
  useAppContextNavigation();
  return (
    <RouterProvider
      router={router as unknown as RouterProviderProps['router']}
      fallbackElement={<p>wooot</p>}
    />
  );
};
