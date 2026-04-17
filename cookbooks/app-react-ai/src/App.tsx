import {
  AssistantRuntimeProvider,
  ThreadPrimitive,
  MessagePrimitive,
  ComposerPrimitive,
} from '@assistant-ui/react';
import { useFusionAiRuntime } from './useFusionAiRuntime';

const Thread = () => (
  <ThreadPrimitive.Root
    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
  >
    <ThreadPrimitive.Viewport
      style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}
    >
      <ThreadPrimitive.Empty>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '0.5rem',
            color: '#6b7280',
          }}
        >
          <span style={{ fontSize: '2rem' }}>₿</span>
          <h2 style={{ margin: 0, color: '#111827' }}>CryptoBot</h2>
          <p style={{ margin: 0, maxWidth: '20rem', textAlign: 'center' }}>
            Ask me about any cryptocurrency — prices, trends, or trading pairs.
            I pull live data from Binance.
          </p>
        </div>
      </ThreadPrimitive.Empty>
      <ThreadPrimitive.Messages
        components={{
          UserMessage: () => (
            <MessagePrimitive.Root
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#e0e7ff',
                alignSelf: 'flex-end',
                maxWidth: '80%',
              }}
            >
              <MessagePrimitive.Content />
            </MessagePrimitive.Root>
          ),
          AssistantMessage: () => (
            <MessagePrimitive.Root
              style={{
                padding: '0.75rem 1rem',
                marginBottom: '0.5rem',
                borderRadius: '0.5rem',
                backgroundColor: '#f3f4f6',
                alignSelf: 'flex-start',
                maxWidth: '80%',
              }}
            >
              <MessagePrimitive.Content />
            </MessagePrimitive.Root>
          ),
        }}
      />
    </ThreadPrimitive.Viewport>
    <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
      <ComposerPrimitive.Root>
        <ComposerPrimitive.Input
          placeholder="Ask about a crypto price, e.g. 'What's the price of Bitcoin?'"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            outline: 'none',
          }}
        />
        <ComposerPrimitive.Send
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#007079',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Send
        </ComposerPrimitive.Send>
      </ComposerPrimitive.Root>
    </div>
  </ThreadPrimitive.Root>
);

export const App = () => {
  const runtime = useFusionAiRuntime();

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};

export default App;
