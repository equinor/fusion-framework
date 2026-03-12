import { Button, Typography } from '@equinor/eds-core-react';
import type { ChangeEvent } from 'react';
import { Styled } from '../styles.js';
import { getStatusText } from '../constants.js';
import type { ConnectionState } from '../types.js';

interface HeaderProps {
  readonly connectionState: ConnectionState;
  readonly socketUrl: string;
  readonly visibleMessagesCount: number;
  readonly selectedAgent: string;
  readonly selectedModel: string;
  readonly availableAgents: string[];
  readonly availableModels: string[];
  readonly showSystemMessages: boolean;
  readonly hiddenSystemMessageCount: number;
  readonly onAgentChange: (value: string) => void;
  readonly onModelChange: (value: string) => void;
  readonly onToggleSystemMessages: () => void;
  readonly onClear: () => void;
}

/**
 * Chat panel header with status, agent/model selection, and filters.
 */
export function Header(props: HeaderProps): JSX.Element {
  return (
    <Styled.Header>
      <Styled.HeaderTop>
        <div>
          <Styled.HeaderEyebrow>Live AI</Styled.HeaderEyebrow>
          <Styled.HeaderIntro>
            <Typography variant="h6">Developer Chat</Typography>
            <Typography variant="body_short" color="secondary">
              Stream assistant output, inspect diffs, and apply changes locally.
            </Typography>
          </Styled.HeaderIntro>
        </div>
        <Styled.HeaderMeta>
          <span>{getStatusText(props.connectionState)}</span>
          <span>•</span>
          <span>{props.visibleMessagesCount} msgs</span>
        </Styled.HeaderMeta>
      </Styled.HeaderTop>

      <Styled.StatusCard $state={props.connectionState}>
        <Styled.StatusTitle>{getStatusText(props.connectionState)}</Styled.StatusTitle>
        <Styled.StatusCopy>
          {props.connectionState === 'connected'
            ? `Connected to ${props.socketUrl}`
            : props.connectionState === 'connecting'
              ? `Connecting to ${props.socketUrl}`
              : `Server unavailable at ${props.socketUrl}. Start fusion-framework-cli live-ai serve.`}
        </Styled.StatusCopy>
      </Styled.StatusCard>

      <Styled.HeaderActions>
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

        <Button variant="ghost" onClick={props.onToggleSystemMessages}>
          {props.showSystemMessages
            ? 'Hide system'
            : props.hiddenSystemMessageCount > 0
              ? `Show system (${props.hiddenSystemMessageCount})`
              : 'Show system'}
        </Button>

        <Button variant="outlined" onClick={props.onClear}>
          Clear
        </Button>
      </Styled.HeaderActions>
    </Styled.Header>
  );
}
