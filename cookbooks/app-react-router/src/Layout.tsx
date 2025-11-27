import { Outlet, useNavigation } from 'react-router-dom';
import { tokens } from '@equinor/eds-tokens';
import Navigation from './components/Navigation';
import RouterDebugToolbar from './components/RouterDebugToolbar';
import Loader from './components/Loader';
import { Paper } from '@equinor/eds-core-react';

const styles = {
  wrapper: {
    display: 'grid',
    gridTemplateRows: '75px auto',
    height: 'inherit',
  },
  header: {
    padding: '0 .5rem',
    backgroundColor: tokens.colors.interactive.primary__resting.hex,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
    height: 'calc(100vh - 123px)',
  },
  content: {
    maxWidth: '1200px',
    width: '100%',
    overflowY: 'auto' as const,
  },
  contentContainer: {
    minHeight: 'calc(100vh - (75px + 48px + 4rem))',
    padding: '2rem 4rem',
  },
};

export default function Layout() {
  const { state: loadingState } = useNavigation();

  return (
    <div style={styles.wrapper}>
      <header style={styles.header}>
        <h1 style={{ color: 'white' }}>Cookbook - React Router App</h1>
        <RouterDebugToolbar />
      </header>
      <div style={styles.container}>
        <Navigation />
        <div style={styles.content}>
          <Paper elevation="raised" style={styles.contentContainer}>
            {loadingState === 'loading' && <Loader />}
            {loadingState === 'idle' && <Outlet />}
          </Paper>
        </div>
      </div>
    </div>
  );
}
