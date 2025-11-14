import { useState, useCallback, useRef, useEffect } from 'react';
import { useAIAgent } from '../hooks/useAIAgent';
import '@equinor/fusion-wc-markdown';
import '@equinor/fusion-wc-person';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'fwc-markdown-viewer': {
        markdown?: string;
        children?: React.ReactNode;
      };
    }
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface IntermediateStep {
  action: {
    tool: string;
    toolInput: unknown;
    log: string;
  };
  observation: unknown;
}

let messageIdCounter = 0;

/**
 * AI Chat Bot component that provides a conversational interface
 * for interacting with the configured AI model using LangChain agents.
 */
export const AIChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: `msg-${messageIdCounter++}`, role: 'assistant', content: 'Hello! I am an AI agent with access to tools. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agentExecutor = useAIAgent({ k: 5 });


  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !agentExecutor) return;

    const userMessage: Message = { id: `msg-${messageIdCounter++}`, role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Use the agent executor - it will decide which tools to use
      const response = await agentExecutor.invoke({ input: userMessage.content });

      // The response has an 'output' property with the final answer
      const responseContent = response.output || 'I apologize, but I couldn\'t generate a response.';

      // Check if intermediate steps are available
      let fullContent = responseContent;
      if (response.intermediateSteps && response.intermediateSteps.length > 0) {
        const stepsContent = (response.intermediateSteps as IntermediateStep[])
          .map((step, index: number) => {
            const toolName = step.action?.tool || 'Unknown Tool';
            const toolInput = typeof step.action?.toolInput === 'string'
              ? step.action.toolInput
              : JSON.stringify(step.action?.toolInput, null, 2);
            const observation = typeof step.observation === 'string'
              ? step.observation
              : JSON.stringify(step.observation, null, 2);

            return `**Step ${index + 1}:** Used tool "${toolName}"\n\n` +
                   `**Input:** ${toolInput}\n\n` +
                   `**Result:** ${observation}`;
          })
          .join('\n\n---\n\n');

        fullContent = `**Reasoning Process:**\n\n${stepsContent}\n\n---\n\n**Final Answer:**\n\n${responseContent}`;
      }

      const assistantMessage: Message = {
        id: `msg-${messageIdCounter++}`,
        role: 'assistant',
        content: fullContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages((prev) => [
        ...prev,
        { id: `msg-${messageIdCounter++}`, role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, agentExecutor]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleReset = useCallback(() => {
    setMessages([
      { id: `msg-${messageIdCounter++}`, role: 'assistant', content: 'Hello! I am an AI assistant. How can I help you today?' },
    ]);
    setInput('');
  }, []);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#007acc',
          color: 'white',
          padding: '0.5rem 1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>🤖 AI Chat Assistant</h1>
        <button
          type="button"
          onClick={handleReset}
          disabled={isLoading}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '0.4rem 0.8rem',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.5 : 1,
            fontSize: '0.85rem',
            fontWeight: 'bold',
          }}
        >
          Reset
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            <div
              style={{
                background: message.role === 'user' ? '#007acc' : '#FFFFFF',
                color: message.role === 'user' ? 'white' : '#333',
                padding: '0.75rem 1rem',
                borderRadius: '16px',
                wordWrap: 'break-word',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {message.role === 'assistant' ? (
                <fwc-markdown-viewer>{message.content}</fwc-markdown-viewer>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: '#e0e0e0',
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              fontStyle: 'italic',
            }}
          >
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '1rem',
          background: 'white',
          borderTop: '1px solid #ddd',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
        />
        <style>{`
          input::placeholder {
            color: #999;
          }
          input:focus {
            outline: none;
            border-color: #007acc;
          }
        `}</style>
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            fontSize: '1rem',
            fontWeight: 'bold',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChatBot;
