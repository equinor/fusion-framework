import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@equinor/eds-core-react';
import { error_outlined } from '@equinor/eds-icons';
import type { ErrorElementProps, RouterHandle } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Error handling test page',
  },
  navigation: {
    label: 'Error Test',
    icon: error_outlined,
    path: '/pages/error-test',
  },
} satisfies RouterHandle;

export const clientLoader = async () => {
  throw new Error('This is a test error to demonstrate error boundaries in the router');
};

export function ErrorElement({ error }: ErrorElementProps) {
  const navigate = useNavigate();

  const handleRetry = useCallback(() => {
    navigate(0); // Reload the page
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '2px solid #f44336',
    },
    title: {
      fontSize: '2rem',
      color: '#f44336',
      marginBottom: '1rem',
    },
    message: {
      fontSize: '1.1rem',
      color: '#333',
      marginBottom: '1.5rem',
      padding: '1rem',
      backgroundColor: '#ffebee',
      borderRadius: '4px',
    },
    errorDetails: {
      padding: '1rem',
      backgroundColor: '#f8f8f8',
      borderRadius: '4px',
      marginBottom: '1.5rem',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      color: '#666',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>⚠️ Error Encountered</h1>
      <div style={styles.message}>
        <strong>Error Message:</strong> {error.message}
      </div>
      <div style={styles.errorDetails}>
        <strong>Error Stack:</strong>
        <pre style={{ margin: '0.5rem 0 0 0', whiteSpace: 'pre-wrap' }}>{error.stack}</pre>
      </div>
      <div style={styles.buttonGroup}>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
        <Button variant="outlined" onClick={handleGoHome}>
          Go Home
        </Button>
      </div>
    </div>
  );
}

export default function ErrorTestPage() {
  const styles = {
    container: {
      backgroundColor: '#fff',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    title: {
      fontSize: '2rem',
      marginBottom: '1rem',
      color: '#1a1a1a',
    },
    description: {
      fontSize: '1.1rem',
      color: '#666',
      marginBottom: '1.5rem',
      lineHeight: '1.6',
    },
    note: {
      padding: '1rem',
      backgroundColor: '#fff3cd',
      borderRadius: '4px',
      border: '1px solid #ffc107',
      color: '#856404',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Error Test Page</h1>
      <p style={styles.description}>
        This page is designed to test error handling in the router. The loader function
        intentionally throws an error to demonstrate how error boundaries work.
      </p>
      <div style={styles.note}>
        <strong>Note:</strong> If you see this content, the error boundary is working correctly. The
        error should be caught and displayed by the ErrorElement component.
      </div>
    </div>
  );
}
