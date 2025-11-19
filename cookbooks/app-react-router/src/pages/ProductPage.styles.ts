export const styles = {
  backLink: {
    display: 'inline-block',
    marginBottom: '1rem',
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  category: {
    fontSize: '1rem',
    color: '#666',
    marginBottom: '1.5rem',
    textTransform: 'capitalize' as const,
  },
  price: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: '1.5rem',
  },
  stock: {
    fontSize: '1.1rem',
    marginBottom: '1.5rem',
    padding: '0.75rem',
    borderRadius: '4px',
  },
  inStock: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  outOfStock: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '2rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #ddd',
  },
  tabContent: {
    padding: '1rem 0',
  },
  info: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
  },
  infoTitle: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '0.5rem',
    textTransform: 'uppercase' as const,
  },
  infoContent: {
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    color: '#333',
  },
};
