import { Typography } from '@equinor/eds-core-react';
import styled from 'styled-components';

const Styled = {
  Wrapper: styled.div`
    margin-top: 20px;
    border: 1px solid #000;
  `,
  Section: styled.section`
    padding: 10px;
  `,
};

/**
 * Component to display the error error
 */
export const ErrorViewer = ({ error }: { readonly error: Error }) => {
  return (
    <>
      <Styled.Wrapper>
        <Typography variant="h4" color="warning">
          {error.message}
        </Typography>
        <Styled.Section>{error.stack && <pre>{error.stack}</pre>}</Styled.Section>
      </Styled.Wrapper>
      {error.cause && <ErrorViewer error={error.cause as Error} />}
    </>
  );
};

export default ErrorViewer;
