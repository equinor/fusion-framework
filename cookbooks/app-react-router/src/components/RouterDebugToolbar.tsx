import { useState } from 'react';
import { useLocation, useNavigation, useMatches } from 'react-router-dom';
import { useNavigationModule } from '@equinor/fusion-framework-react-app/navigation';
import { Button, Icon, Typography } from '@equinor/eds-core-react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { code } from '@equinor/eds-icons';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';

// Register icons
Icon.add({ code });

const Styled = {
  Section: styled.div`
    margin-bottom: ${tokens.spacings.comfortable.large};
  `,
  SectionTitle: styled(Typography)`
    margin-top: 0;
    margin-bottom: ${tokens.spacings.comfortable.x_small};
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    font-weight: ${tokens.typography.paragraph.caption.fontWeight};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
    text-transform: uppercase;
  `,
  Pre: styled.pre`
    margin: 0;
    padding: ${tokens.spacings.comfortable.medium};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    overflow: auto;
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
  `,
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
          <Styled.Section>
            <Styled.SectionTitle variant="h3">React Router Location</Styled.SectionTitle>
            <Styled.Pre>{JSON.stringify(currentLocation, null, 2)}</Styled.Pre>
          </Styled.Section>

          <Styled.Section>
            <Styled.SectionTitle variant="h3">Current Match</Styled.SectionTitle>
            <Styled.Pre>{JSON.stringify(matches[matches.length - 1], null, 2)}</Styled.Pre>
          </Styled.Section>

          <Styled.Section>
            <Styled.SectionTitle variant="h3">React Router Navigation State</Styled.SectionTitle>
            <Styled.Pre>
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
            </Styled.Pre>
          </Styled.Section>

          <Styled.Section>
            <Styled.SectionTitle variant="h3">Navigation Provider State</Styled.SectionTitle>
            <Styled.Pre>
              {JSON.stringify(
                {
                  location: navigation.history.location,
                  basename: navigation.basename,
                },
                null,
                2,
              )}
            </Styled.Pre>
          </Styled.Section>
        </SideSheet.Content>
      </SideSheet>
    </>
  );
};

export default RouterDebugToolbar;
