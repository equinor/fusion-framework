import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography } from '@equinor/eds-core-react';
import { error_outlined } from '@equinor/eds-icons';
import { tokens } from '@equinor/eds-tokens';
import styled from 'styled-components';
import type { ErrorElementProps, RouterHandle } from '@equinor/fusion-framework-react-router';

export const handle = {
  route: {
    description: 'Error handling test page',
    title: 'Error Test',
    icon: error_outlined,
  },
} as const satisfies RouterHandle;

export async function clientLoader() {
  throw new Error('This is a test error to demonstrate error boundaries in the router');
}

const Styled = {
  ErrorContainer: styled.div`
    background-color: ${tokens.colors.ui.background__light.hex};
    padding: ${tokens.spacings.comfortable.large};
    border-radius: ${tokens.shape.corners.borderRadius};
    box-shadow: ${tokens.elevation.raised};
    border: 2px solid ${tokens.colors.interactive.danger__resting.hex};
  `,
  ErrorTitle: styled(Typography)`
    color: ${tokens.colors.interactive.danger__resting.hex};
    margin-bottom: ${tokens.spacings.comfortable.medium};
  `,
  ErrorMessage: styled.div`
    font-size: ${tokens.typography.paragraph.body_short.fontSize};
    color: ${tokens.colors.text.static_icons__default.hex};
    margin-bottom: ${tokens.spacings.comfortable.medium};
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__warning.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
  `,
  ErrorDetails: styled.div`
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__light.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    margin-bottom: ${tokens.spacings.comfortable.medium};
    font-family: monospace;
    font-size: ${tokens.typography.paragraph.caption.fontSize};
    color: ${tokens.colors.text.static_icons__tertiary.hex};
  `,
  ErrorStack: styled.pre`
    margin: ${tokens.spacings.comfortable.x_small} 0 0 0;
    white-space: pre-wrap;
  `,
  ButtonGroup: styled.div`
    display: flex;
    gap: ${tokens.spacings.comfortable.small};
  `,
  Container: styled.div`
    background-color: ${tokens.colors.ui.background__light.hex};
    padding: ${tokens.spacings.comfortable.large};
    border-radius: ${tokens.shape.corners.borderRadius};
    box-shadow: ${tokens.elevation.raised};
  `,
  Title: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.small};
  `,
  Description: styled(Typography)`
    margin-bottom: ${tokens.spacings.comfortable.medium};
    line-height: 1.6;
  `,
  Note: styled.div`
    padding: ${tokens.spacings.comfortable.small};
    background-color: ${tokens.colors.ui.background__warning.hex};
    border-radius: ${tokens.shape.corners.borderRadius};
    border: 1px solid ${tokens.colors.interactive.warning__resting.hex};
    color: ${tokens.colors.text.static_icons__default.hex};
  `,
};

export function ErrorElement({ error }: ErrorElementProps) {
  const navigate = useNavigate();

  const handleRetry = useCallback(() => {
    navigate(0); // Reload the page
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <Styled.ErrorContainer>
      <Styled.ErrorTitle variant="h1">⚠️ Error Encountered</Styled.ErrorTitle>
      <Styled.ErrorMessage>
        <strong>Error Message:</strong> {error.message}
      </Styled.ErrorMessage>
      <Styled.ErrorDetails>
        <strong>Error Stack:</strong>
        <Styled.ErrorStack>{error.stack}</Styled.ErrorStack>
      </Styled.ErrorDetails>
      <Styled.ButtonGroup>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
        <Button variant="outlined" onClick={handleGoHome}>
          Go Home
        </Button>
      </Styled.ButtonGroup>
    </Styled.ErrorContainer>
  );
}

export default function ErrorTestPage() {
  return (
    <Styled.Container>
      <Styled.Title variant="h1">Error Test Page</Styled.Title>
      <Styled.Description variant="body_long">
        This page is designed to test error handling in the router. The loader function
        intentionally throws an error to demonstrate how error boundaries work.
      </Styled.Description>
      <Styled.Note>
        <strong>Note:</strong> If you see this content, the error boundary is working correctly. The
        error should be caught and displayed by the ErrorElement component.
      </Styled.Note>
    </Styled.Container>
  );
}
