import { type ChatModelAdapter } from '@assistant-ui/react';
import { useChat } from '../HelpChat/hooks/chat/useChat';
import { useCurrentApp } from '@equinor/fusion-framework-react/app';
import { search } from '@equinor/eds-icons';

export const useFusionAdapter = (): ChatModelAdapter => {
  const { currentApp } = useCurrentApp();
  return {
    async *run({ messages, abortSignal }) {
      const searchString = messages[0].content[0].type === 'text' ? messages[0].content[0].text : 'heeeelp'
      const { data: chatAnswer } = useChat({
        appKey: currentApp?.appKey ?? '',
        queryKeys: ['chat', 'help', currentApp?.appKey ?? ''].concat(searchString.split(' ')),
        question: searchString,
        enabled: !!currentApp,
      });

      let text = "";
      for (const part of chatAnswer ?? []) {
        text += part

        yield {
          content: [{ type: "text", text }],
        };
      }
    }
  };
};
