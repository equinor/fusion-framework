import type { CSSProperties, JSX } from 'react';
import { useState, useRef, useEffect } from 'react';
import { version } from './version';
import { Header } from './Header';

interface NavLink {
  label: string;
  href: string;
}

const NAV_LINKS: NavLink[] = [
  { label: 'Docs', href: 'https://equinor.github.io/fusion-framework/' },
  {
    label: 'GitHub',
    href: 'https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react',
  },
  {
    label: 'Changelog',
    href: 'https://github.com/equinor/fusion-framework/blob/main/cookbooks/app-react/CHANGELOG.md',
  },
];

const GREEN = {
  solid: '#10b981',
  dark: '#047857',
  text: '#6ee7b7',
  bg: 'rgba(16,185,129,0.15)',
  border: 'rgba(16,185,129,0.4)',
  glow: 'rgba(16,185,129,0.6)',
} as const;

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'linear-gradient(135deg, #020d0a 0%, #041f14 50%, #063320 100%)',
    fontFamily: '"Equinor", system-ui, sans-serif',
    color: '#e0e6f0',
  } satisfies CSSProperties,
  root: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } satisfies CSSProperties,
  card: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '1rem',
    padding: '3rem 3.5rem',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    borderTop: `4px solid ${GREEN.solid}`,
    backdropFilter: 'blur(12px)',
  } satisfies CSSProperties,
  badge: {
    display: 'inline-block',
    background: GREEN.bg,
    color: GREEN.text,
    border: `1px solid ${GREEN.border}`,
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    padding: '0.2rem 0.75rem',
    marginBottom: '1.25rem',
  } satisfies CSSProperties,
  heading: {
    fontSize: '2rem',
    fontWeight: 700,
    margin: '0 0 0.5rem',
    color: '#ffffff',
    textShadow: `0 0 20px ${GREEN.glow}`,
  } satisfies CSSProperties,
  sub: {
    color: '#a0b0c8',
    fontSize: '0.95rem',
    margin: '0 0 2rem',
    lineHeight: 1.6,
  } satisfies CSSProperties,
  code: {
    background: GREEN.bg,
    color: GREEN.text,
    borderRadius: '3px',
    padding: '0.1em 0.4em',
    fontSize: '0.88em',
    fontFamily: 'monospace',
  } satisfies CSSProperties,
  nav: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap' as const,
  } satisfies CSSProperties,
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.5rem 1.1rem',
    borderRadius: '4px',
    background: `linear-gradient(90deg, ${GREEN.solid}, ${GREEN.dark})`,
    border: `1px solid ${GREEN.solid}`,
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '0.88rem',
    fontWeight: 500,
    transition: 'opacity 0.15s',
  } satisfies CSSProperties,
  version: {
    marginTop: '2rem',
    fontSize: '0.75rem',
    color: '#5a6a80',
    letterSpacing: '0.04em',
  } satisfies CSSProperties,
  chat: {
    marginTop: '2rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '1.5rem',
  } satisfies CSSProperties,
  chatMessages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    maxHeight: '160px',
    overflowY: 'auto',
    marginBottom: '0.75rem',
    fontSize: '0.88rem',
  } satisfies CSSProperties,
  chatMsg: {
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    lineHeight: 1.5,
  } satisfies CSSProperties,
  chatMsgUser: {
    background: 'rgba(16,185,129,0.2)',
    color: '#6ee7b7',
    alignSelf: 'flex-end',
    maxWidth: '80%',
  } satisfies CSSProperties,
  chatMsgBot: {
    background: 'rgba(255,255,255,0.07)',
    color: '#e0e6f0',
    alignSelf: 'flex-start',
    maxWidth: '80%',
  } satisfies CSSProperties,
  chatForm: {
    display: 'flex',
    gap: '0.5rem',
  } satisfies CSSProperties,
  chatInput: {
    flex: 1,
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '4px',
    color: '#e0e6f0',
    padding: '0.45rem 0.75rem',
    fontSize: '0.88rem',
    outline: 'none',
  } satisfies CSSProperties,
  chatBtn: {
    padding: '0.45rem 1rem',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #10b981, #047857)',
    border: '1px solid #10b981',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 500,
    cursor: 'pointer',
  } satisfies CSSProperties,
} as const;

/**
 * Generates a bot reply based on the user's message.
 * Recognises when the user shares their name.
 */
function botReply(message: string): string {
  const nameMatch = message.match(/(?:my name is|i(?:'m| am)|call me)\s+([A-Za-z]+)/i);
  if (nameMatch) {
    return `Nice to meet you, ${nameMatch[1]}! 👋`;
  }
  const greetings = /^(hi|hello|hey|howdy|yo)\b/i;
  if (greetings.test(message)) {
    return "Hey there! What's your name?";
  }
  return "I heard you! Feel free to introduce yourself 😊";
}

interface ChatMessage {
  from: 'user' | 'bot';
  text: string;
}

/** Simple chat widget that greets users by name. */
function Chat(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: "Hi! What's your name?" },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const reply = botReply(text);
    setMessages((prev) => [
      ...prev,
      { from: 'user', text },
      { from: 'bot', text: reply },
    ]);
    setInput('');
  };

  return (
    <div style={styles.chat}>
      <div style={styles.chatMessages}>
        {messages.map((msg, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: messages are append-only
            key={i}
            style={{
              ...styles.chatMsg,
              ...(msg.from === 'user' ? styles.chatMsgUser : styles.chatMsgBot),
            }}
          >
            {msg.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        style={styles.chatForm}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          style={styles.chatInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Say your name…"
        />
        <button type="submit" style={styles.chatBtn}>
          Send
        </button>
      </form>
    </div>
  );
}


function Badge({ label }: { label: string }): JSX.Element {
  return <div style={styles.badge}>{label}</div>;
}

/**
 * Renders the navigation links as anchor tags.
 * @param links - Array of nav link objects with label and href
 */
function NavLinks({ links }: { links: NavLink[] }): JSX.Element {
  return (
    <nav style={styles.nav}>
      {links.map(({ label, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={styles.link}>
          {label} →
        </a>
      ))}
    </nav>
  );
}

/**
 * Main application component for the Fusion React cookbook.
 * Displays a welcome card with links to documentation and the GitHub repository.
 */
export function App(): JSX.Element {
  return (
    <div style={styles.wrapper}>
      <Header />
      <div style={styles.root}>
        <div style={styles.card}>
          <Badge label="cookbook" />
          <h1 style={styles.heading}>Fusion Framework</h1>
          <p style={styles.sub}>
            Edit <code style={styles.code}>src/App.tsx</code> to get started.
          </p>
          <NavLinks links={NAV_LINKS} />
          <p style={styles.version}>v{version}</p>
          <Chat />
        </div>
      </div>
    </div>
  );
}

export default App;
