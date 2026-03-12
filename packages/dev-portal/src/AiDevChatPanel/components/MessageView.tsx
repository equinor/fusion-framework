import { Styled } from '../styles.js';
import { getRoleLabel } from '../constants.js';
import type { ChatMessage } from '../types.js';

interface MessageViewProps {
  readonly message: ChatMessage;
}

/**
 * Individual message display component.
 */
export function MessageView(props: MessageViewProps): JSX.Element {
  return (
    <Styled.MessageRow key={props.message.id}>
      <Styled.Message $role={props.message.role} $tone={props.message.tone ?? 'default'}>
        <Styled.MessageMeta>
          <Styled.MessageRole>{getRoleLabel(props.message.role)}</Styled.MessageRole>
          <Styled.MessageTime>{new Date(props.message.ts).toLocaleTimeString()}</Styled.MessageTime>
        </Styled.MessageMeta>
        <Styled.MessageBody>{props.message.content}</Styled.MessageBody>
      </Styled.Message>
    </Styled.MessageRow>
  );
}
