import type { CSSProperties, JSX } from 'react';

const styles = {
  header: {
    height: '56px',
    background: 'rgba(13,28,20,0.85)',
    borderBottom: '1px solid rgba(16,185,129,0.3)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    gap: '0.75rem',
    flexShrink: 0,
  } satisfies CSSProperties,
  logo: {
    width: '28px',
    height: '28px',
    background: 'linear-gradient(135deg, #10b981, #047857)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  } satisfies CSSProperties,
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#e0e6f0',
    fontFamily: '"Equinor", system-ui, sans-serif',
    letterSpacing: '0.02em',
  } satisfies CSSProperties,
  spacer: {
    flex: 1,
  } satisfies CSSProperties,
  tag: {
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: '#6ee7b7',
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.4)',
    borderRadius: '4px',
    padding: '0.15rem 0.6rem',
  } satisfies CSSProperties,
} as const;

/**
 * Top navigation header for the Fusion React cookbook app.
 * Displays the app title and a "cookbook" tag.
 */
export function Header(): JSX.Element {
  return (
    <header style={styles.header}>
      <div style={styles.logo}>F</div>
      <span style={styles.title}>Fusion Framework</span>
      <div style={styles.spacer} />
      <span style={styles.tag}>cookbook</span>
    </header>
  );
}

export default Header;
