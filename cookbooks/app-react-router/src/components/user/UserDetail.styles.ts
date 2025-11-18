export const styles = {
  header: {
    borderBottom: '2px solid #ddd',
    paddingBottom: '1.5rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  email: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '1rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1a1a1a',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  infoItem: {
    padding: '1rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.25rem',
    textTransform: 'uppercase' as const,
  },
  infoValue: {
    fontSize: '1.1rem',
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
};

