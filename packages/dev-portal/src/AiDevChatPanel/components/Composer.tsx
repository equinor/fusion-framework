import { send } from '@equinor/eds-icons';
import { Button, Icon } from '@equinor/eds-core-react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { Styled } from '../styles.js';

Icon.add({ send });

interface ComposerProps {
  readonly value: string;
  readonly selectedAgent: string;
  readonly selectedModel: string;
  readonly availableAgents: string[];
  readonly availableModels: string[];
  readonly isDisabled: boolean;
  readonly isButtonDisabled: boolean;
  readonly onAgentChange: (value: string) => void;
  readonly onModelChange: (value: string) => void;
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
        <Styled.ComposerControls>
          <Styled.Select
            aria-label="Select AI agent"
            value={props.selectedAgent}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              props.onAgentChange(event.currentTarget.value)
            }
            disabled={props.availableAgents.length === 0}
          >
            <option value="">Loading agents...</option>
            {props.availableAgents.map((option) => (
              <option key={option} value={option}>
                Agent: {option}
              </option>
            ))}
          </Styled.Select>

          <Styled.Select
            aria-label="Select AI model"
            value={props.selectedModel}
            onChange={(event: ChangeEvent<HTMLSelectElement>) =>
              props.onModelChange(event.currentTarget.value)
            }
            disabled={props.availableModels.length === 0}
          >
            <option value="">Loading models...</option>
            {props.availableModels.map((option) => (
              <option key={option} value={option}>
                Model: {option}
              </option>
            ))}
          </Styled.Select>
        </Styled.ComposerControls>

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
            <Button
              variant="ghost_icon"
              disabled={props.isButtonDisabled}
              onClick={props.onSubmit}
              title="Send"
              style={{ minWidth: 24, minHeight: 24, padding: 2 }}
            >
              <Icon data={send} size={14} />
            </Button>
          </Styled.ComposerActions>
        </Styled.ComposerFooter>
      </Styled.ComposerCard>
    </Styled.Composer>
  );
}
