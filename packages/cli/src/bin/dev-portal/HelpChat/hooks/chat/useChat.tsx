import { useHttpClient } from "@equinor/fusion-framework-react-app/http";
import { experimental_streamedQuery, useQuery } from "@tanstack/react-query";

type MessageData = {
  choices: {
    delta: {
      content?: string;
    }
  }[]
}

export const useChat = (args: {
  question: string;
  appKey: string;
  queryKeys: string[];
  enabled: boolean;
}) => {
  const { question, appKey, queryKeys, enabled } = args;

  const httpClient = useHttpClient('help-chat');

  const chatAnswer = (question: string, signal: AbortSignal) => {
  return {
    async *[Symbol.asyncIterator]() {
      const response = await httpClient.fetch('/ai/help/chat-stream?api-version=1.0-preview', {
        signal,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          userPrompt: question,
          appKey: appKey,
        }),
      });
        const reader = response.body?.getReader();
        const utf8Decoder = new TextDecoder('utf-8');
        if (reader) {
          while (true) {
            const {done, value: chunk} = await reader.read();
            if (done) {
        reader?.releaseLock()
              break;
            }
            const text = utf8Decoder.decode(chunk);
            const messages = text.split('\n\n').filter(Boolean);
            for (const message of messages) {
              if (message.startsWith('data: ')) {
                const messageData = JSON.parse(message.substring(6)) as MessageData;
                const word = messageData.choices.map((choice) => choice.delta.content).join();
                yield word;
              }
            }
          }
        }
      },
    }
  }

  return useQuery({
    queryKey: queryKeys,
    enabled: enabled,
    queryFn: experimental_streamedQuery({
      queryFn: ({ signal }) => chatAnswer(question, signal),
    }),
  });
};
