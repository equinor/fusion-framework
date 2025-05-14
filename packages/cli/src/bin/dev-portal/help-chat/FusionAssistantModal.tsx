"use client";

import { FC } from 'react';
import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import {
  AssistantModal,
  Thread,
  type ThreadConfig,
} from '@assistant-ui/react-ui';
import { useFusionAdapter } from './fusion-chat-api';

export const FusionAssistantModal: FC<ThreadConfig> = (config) => {
  const adapter = useFusionAdapter()
  const fusionRuntime = useLocalRuntime(adapter);
  return (
    <AssistantRuntimeProvider runtime={fusionRuntime}>
      <AssistantModal.Root config={config}>
        <AssistantModal.Trigger />
        <AssistantModal.Content>
          <Thread />
        </AssistantModal.Content>
      </AssistantModal.Root>
    </AssistantRuntimeProvider>
  );
};