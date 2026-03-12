import { Typography } from '@equinor/eds-core-react';
import { Styled } from '../styles.js';
import { MessageView } from './MessageView.js';
import { ChangeSetView } from './ChangeSetView.js';
import type { ChatMessage, PendingChangeSet } from '../types.js';

interface RunFeedbackView {
  status: 'running' | 'done' | 'error';
  title: string;
  lines: string[];
  collapsed: boolean;
}

interface TimelineProps {
  readonly messages: ChatMessage[];
  readonly streamingText: string;
  readonly runFeedback: RunFeedbackView | null;
  readonly onToggleRunFeedback: () => void;
  readonly pendingChangeSet: PendingChangeSet | null;
  readonly onApplyChangeSet: () => void;
  readonly onRejectChangeSet: () => void;
}

/**
 * Timeline view displaying messages, streaming response, and pending changesets.
 */
export function Timeline(props: TimelineProps): JSX.Element {
  const isEmpty =
    props.messages.length === 0 &&
    !props.streamingText &&
    !props.pendingChangeSet &&
    !props.runFeedback;

  return (
    <Styled.Timeline>
      {isEmpty ? (
        <Styled.EmptyState>
          <Typography variant="body_short" color="secondary">
            No conversation yet.
          </Typography>
          <Typography variant="body_short" color="secondary">
            Ask for a change and the server will stream a response plus a proposed diff.
          </Typography>
        </Styled.EmptyState>
      ) : null}

      {props.messages.map((message) => (
        <MessageView key={message.id} message={message} />
      ))}

      {props.runFeedback ? (
        <Styled.RunFeedbackCard $status={props.runFeedback.status}>
          <Styled.RunFeedbackHeader>
            <div>
              <Styled.RunFeedbackTitle>{props.runFeedback.title}</Styled.RunFeedbackTitle>
              <Styled.RunFeedbackMeta>
                {props.runFeedback.status === 'running'
                  ? 'Live progress stream'
                  : props.runFeedback.status === 'error'
                    ? 'Finished with issues'
                    : 'Finished'}
              </Styled.RunFeedbackMeta>
            </div>
            <Styled.RunFeedbackToggle type="button" onClick={props.onToggleRunFeedback}>
              {props.runFeedback.collapsed ? 'Expand' : 'Collapse'}
            </Styled.RunFeedbackToggle>
          </Styled.RunFeedbackHeader>
          {!props.runFeedback.collapsed ? (
            <Styled.RunFeedbackBody>
              <Styled.RunFeedbackLine>{props.runFeedback.lines.join('\n')}</Styled.RunFeedbackLine>
            </Styled.RunFeedbackBody>
          ) : null}
        </Styled.RunFeedbackCard>
      ) : null}

      {props.streamingText ? (
        <Styled.MessageRow>
          <Styled.Message $role="assistant" $tone="default">
            <Styled.MessageMeta>
              <Styled.MessageRole>Assistant</Styled.MessageRole>
              <Styled.MessageTime>streaming</Styled.MessageTime>
            </Styled.MessageMeta>
            <Styled.MessageBody>{props.streamingText}</Styled.MessageBody>
          </Styled.Message>
        </Styled.MessageRow>
      ) : null}

      {props.pendingChangeSet ? (
        <ChangeSetView
          changeSet={props.pendingChangeSet}
          onApply={props.onApplyChangeSet}
          onReject={props.onRejectChangeSet}
        />
      ) : null}
    </Styled.Timeline>
  );
}
