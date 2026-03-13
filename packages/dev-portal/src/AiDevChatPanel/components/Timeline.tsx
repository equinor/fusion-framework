import { Typography } from '@equinor/eds-core-react';
import { useEffect, useRef } from 'react';
import { Styled } from '../styles.js';
import { MessageView } from './MessageView.js';
import { ChangeSetView } from './ChangeSetView.js';
import { RunFeedbackView } from './RunFeedbackView.js';
import type { ChatMessage, PendingChangeSet } from '../types.js';
import type { RunFeedbackState } from '../runFeedback.js';

interface TimelineProps {
  readonly messages: ChatMessage[];
  readonly streamingText: string;
  readonly runFeedback: RunFeedbackState | null;
  readonly pendingChangeSet: PendingChangeSet | null;
}

/**
 * Timeline view displaying messages, streaming response, and pending changesets.
 */
export function Timeline(props: TimelineProps): JSX.Element {
  const timelineRef = useRef<HTMLElement | null>(null);
  const trimmedStreamingText = props.streamingText.trim();
  const timelineScrollTrigger = [
    props.messages.length,
    trimmedStreamingText,
    props.pendingChangeSet ? 'changes' : 'no-changes',
    props.runFeedback?.status ?? 'no-status',
    props.runFeedback?.entries.length ?? 0,
  ].join('|');

  const isEmpty =
    props.messages.length === 0 &&
    !trimmedStreamingText &&
    !props.pendingChangeSet &&
    !props.runFeedback;

  useEffect(() => {
    const element = timelineRef.current;
    if (!element) {
      return;
    }

    if (!timelineScrollTrigger) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }, [timelineScrollTrigger]);

  return (
    <Styled.Timeline ref={timelineRef}>
      {isEmpty ? (
        <Styled.EmptyState>
          <Typography variant="body_short" color="secondary">
            Ask for a change and the server will stream a response plus a proposed diff.
          </Typography>
        </Styled.EmptyState>
      ) : null}

      {props.messages.map((message) => (
        <MessageView key={message.id} message={message} />
      ))}

      {props.runFeedback ? (
        <RunFeedbackView
          runFeedback={props.runFeedback}
          pendingChangeSet={props.pendingChangeSet}
        />
      ) : null}

      {trimmedStreamingText ? (
        <Styled.MessageRow $role="assistant">
          <Styled.Message $role="assistant" $tone="default">
            <Styled.MessageMeta>
              <Styled.MessageRole>Assistant</Styled.MessageRole>
            </Styled.MessageMeta>
            <Styled.MessageBody>{trimmedStreamingText}</Styled.MessageBody>
          </Styled.Message>
        </Styled.MessageRow>
      ) : null}

      {props.pendingChangeSet ? <ChangeSetView changeSet={props.pendingChangeSet} /> : null}
    </Styled.Timeline>
  );
}
