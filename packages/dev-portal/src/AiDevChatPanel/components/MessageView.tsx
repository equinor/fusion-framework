import { edit, info_circle, settings } from '@equinor/eds-icons';
import { Icon } from '@equinor/eds-core-react';
import { MarkdownViewer } from '@equinor/fusion-react-markdown';
import { Styled } from '../styles.js';
import { getRoleLabel } from '../constants.js';
import type { ChatMessage } from '../types.js';

Icon.add({ edit, info_circle, settings });

interface MessageViewProps {
  readonly message: ChatMessage;
}

interface MessageTextSections {
  body: string;
  telemetry: string;
}

function splitTelemetrySections(content: string): MessageTextSections {
  const lines = content.split(/\r?\n/);
  const bodyLines: string[] = [];
  const telemetryLines: string[] = [];

  const isTelemetryLine = (line: string): boolean =>
    /^Total usage est:/i.test(line) ||
    /^API time spent:/i.test(line) ||
    /^Total session time:/i.test(line) ||
    /^Total code changes:/i.test(line) ||
    /^Breakdown by AI model:/i.test(line) ||
    /^[a-z0-9._-]+\s+\d[\d.,kmb\s]+in,\s+\d[\d.,kmb\s]+out,\s+\d[\d.,kmb\s]+cached/i.test(line);

  for (const line of lines) {
    if (isTelemetryLine(line.trim())) {
      telemetryLines.push(line);
      continue;
    }

    bodyLines.push(line);
  }

  return {
    body: bodyLines.join('\n').trim(),
    telemetry: telemetryLines.join('\n').trim(),
  };
}

/**
 * Individual message display component.
 */
export function MessageView(props: MessageViewProps): JSX.Element {
  const showTimestamp = props.message.role !== 'assistant';
  const sections = splitTelemetrySections(props.message.content);
  const messageBody = sections.body || props.message.content.trim();
  const roleIcon =
    props.message.role === 'user'
      ? edit
      : props.message.role === 'assistant'
        ? info_circle
        : settings;

  return (
    <Styled.MessageRow key={props.message.id} $role={props.message.role}>
      <Styled.Message $role={props.message.role} $tone={props.message.tone ?? 'default'}>
        <Styled.MessageMeta>
          <Styled.MessageRoleWrap>
            <Styled.MessageRoleIcon>
              <Icon data={roleIcon} size={14} />
            </Styled.MessageRoleIcon>
            <Styled.MessageRole>{getRoleLabel(props.message.role)}</Styled.MessageRole>
          </Styled.MessageRoleWrap>
          {showTimestamp ? (
            <Styled.MessageTime>
              {new Date(props.message.ts).toLocaleTimeString()}
            </Styled.MessageTime>
          ) : null}
        </Styled.MessageMeta>
        <Styled.MessageBody>
          {props.message.role === 'assistant' ? (
            <MarkdownViewer value={messageBody} />
          ) : (
            messageBody
          )}
        </Styled.MessageBody>
        {sections.telemetry ? (
          <Styled.TelemetryDetails>
            <Styled.TelemetrySummary>Usage details</Styled.TelemetrySummary>
            <Styled.TelemetryBody>{sections.telemetry}</Styled.TelemetryBody>
          </Styled.TelemetryDetails>
        ) : null}
      </Styled.Message>
    </Styled.MessageRow>
  );
}
