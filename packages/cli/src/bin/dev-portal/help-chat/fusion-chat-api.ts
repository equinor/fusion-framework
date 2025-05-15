import { type ChatModelAdapter } from '@assistant-ui/react';
type MessageData = {
  choices: {
    delta: {
      content?: string;
    }
  }[]
}

export const useFusionAdapter = (): ChatModelAdapter => {
  return {
    async *run({ messages, abortSignal }) {
      console.log("Running fusion adapter with messages:", messages);
      // TODO replace with your own API
      // const result = await fetch('https://admin.ci.api.fusion-dev.net/ai/help/chat?api-version=1.0-preview', {
      // const response = await helpClient.fetch('ai/help/chat-stream?api-version=1.0-preview', {
      const response = await fetch('https://1579.admin.pr.api.fusion-dev.net/ai/help/chat-stream?api-version=1.0-preview', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('fusion_token')}`,
        },
        // forward the messages in the chat to the API
        body: JSON.stringify({
          userPrompt: messages[0].content[0].type === 'text' ? messages[0].content[0].text : 'heeeelp',
          appKey: 'contract-personnel',
        }),
        // if the user hits the "cancel" button or escape keyboard key, cancel the request
        signal: abortSignal,
      });

      if (!response.body) {
        throw new Error("ReadableStream not supported or response body is null.");
      }

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
                yield {
                  content: [{
                    type: 'text',
                    text: word,
                  }]
                };
              }
            }
          }
        }
      }
  };
};
