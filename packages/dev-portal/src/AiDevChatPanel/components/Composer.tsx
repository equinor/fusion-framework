import { Button } from '@equinor/eds-core-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Styled } from '../styles.js';

interface ComposerProps {
  readonly value: string;
  readonly isDisabled: boolean;
  readonly isButtonDisabled: boolean;
  readonly onChange: (value: string) => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  readonly onSubmit: () => void;
}

/**
 * Chat input composer with textarea and send button.
 */
export function Composer(props: ComposerProps): JSX.Element {
  return (
    <Styled.Composer>
      <Styled.ComposerCard>
        <Styled.ComposerInput
          id="ai-dev-chat-input"
          placeholder="Describe what to build"
          value={props.value}
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
            props.onChange(event.currentTarget.value)
          }
          onKeyDown={props.onKeyDown}
          disabled={props.isDisabled}
        />

        <Styled.ComposerFooter>
          <Styled.ComposerHint>
            Shift+Enter for a new line. Enter sends the prompt.
          </Styled.ComposerHint>
          <Styled.ComposerActions>
            <Button variant="contained" disabled={props.isButtonDisabled} onClick={props.onSubmit}>
              Send
            </Button>
          </Styled.ComposerActions>
        </Styled.ComposerFooter>
      </Styled.ComposerCard>
    </Styled.Composer>
  );
}
