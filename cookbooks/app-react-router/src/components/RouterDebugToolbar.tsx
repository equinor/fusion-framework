import { useState } from 'react';
import { useLocation, useNavigation, useMatches } from 'react-router-dom';
import { useNavigationModule } from '@equinor/fusion-framework-react-app/navigation';
import { Button, Icon } from '@equinor/eds-core-react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { code } from '@equinor/eds-icons';

// Register icons
Icon.add({ code });

const styles = {
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'uppercase' as const,
  },
  pre: {
    margin: 0,
    padding: '0.75rem',
    backgroundColor: '#f8f8f8',
    borderRadius: '4px',
    overflow: 'auto',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
  },
};

/**
 * Toggle toolbar component that displays React Router Location and Navigation Provider State
 * Appears as a button in the header that can be toggled to show/hide debug information using EDS SideSheet
 */
export const RouterDebugToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentLocation = useLocation();
  const navigation = useNavigationModule();
  const routerNavigation = useNavigation();
  const matches = useMatches();

  return (
    <>
      <Button variant="contained" color="secondary" onClick={() => setIsOpen(!isOpen)} icon={code}>
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </Button>

      <SideSheet isOpen={isOpen} onClose={() => setIsOpen(false)} isDismissable={true}>
        <SideSheet.Title title="Router Debug Info" />
        <SideSheet.Content>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>React Router Location</h3>
            <pre style={styles.pre}>{JSON.stringify(currentLocation, null, 2)}</pre>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Current Match</h3>
            <pre style={styles.pre}>{JSON.stringify(matches[1], null, 2)}</pre>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>React Router Navigation State</h3>
            <pre style={styles.pre}>
              {JSON.stringify(
                {
                  state: routerNavigation.state,
                  location: routerNavigation.location,
                  formMethod: routerNavigation.formMethod,
                  formAction: routerNavigation.formAction,
                  formData: routerNavigation.formData
                    ? (() => {
                        const fd = routerNavigation.formData as FormData;
                        const result: Record<string, string> = {};
                        // @ts-expect-error - FormData.entries() exists at runtime
                        for (const [key, value] of fd.entries()) {
                          result[key] = String(value);
                        }
                        return result;
                      })()
                    : null,
                },
                null,
                2,
              )}
            </pre>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Navigation Provider State</h3>
            <pre style={styles.pre}>
              {JSON.stringify(
                {
                  location: navigation.history.location,
                  basename: navigation.basename,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </SideSheet.Content>
      </SideSheet>
    </>
  );
};

export default RouterDebugToolbar;
