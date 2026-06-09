import type { CSSProperties } from 'react';

/** Shared page layout style for the observable cookbook. */
export const pageStyle: CSSProperties = {
  minHeight: '100%',
  padding: '2rem',
  background: '#f5f7f8',
  color: '#243746',
  fontFamily: 'Inter, Arial, sans-serif',
};

/** Shared responsive grid style for cookbook panels. */
export const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
  gap: '1rem',
};

/** Shared panel style for observable examples. */
export const panelStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  padding: '1rem',
  border: '1px solid #d6dde2',
  borderRadius: '0.5rem',
  background: '#ffffff',
};

/** Shared button row style for grouped cookbook actions. */
export const buttonRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
};

/** Shared button style for compact cookbook controls. */
export const buttonStyle: CSSProperties = {
  border: '1px solid #9aacb8',
  borderRadius: '0.35rem',
  padding: '0.5rem 0.75rem',
  background: '#ffffff',
  color: '#243746',
  cursor: 'pointer',
};

/** Shared muted text style for explanatory UI copy. */
export const mutedTextStyle: CSSProperties = {
  margin: 0,
  color: '#5f6f7a',
};
