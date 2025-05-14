import { type ChatModelAdapter } from '@assistant-ui/react';

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

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and append it to the buffer
        buffer += decoder.decode(value, { stream: true });
        
        let text = '';

        // Process the buffer for complete JSON objects
        let boundary = buffer.indexOf('\n\n'); // Assuming chunks are newline-delimited
        while (boundary !== -1) {
          const jsonChunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 1);

          if (jsonChunk) {
            try {
              const parsed = JSON.parse(jsonChunk.replace('data: ', ''));
              text += parsed.choices[0].delta.content || '';
              yield {
                content: [
                  {
                    type: "text",
                    text,
                  },
                ],
              };
            } catch (error) {
              console.error("Failed to parse JSON chunk:", jsonChunk, error);
            }
          }

          boundary = buffer.indexOf('\n');
        }
      }
    }
  };
};
