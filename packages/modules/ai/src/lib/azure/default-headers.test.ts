import { beforeEach, describe, expect, it, vi } from 'vitest';

const { chatCtor, embedCtor } = vi.hoisted(() => ({
  chatCtor: vi.fn(),
  embedCtor: vi.fn(),
}));

vi.mock('@langchain/openai', () => ({
  AzureChatOpenAI: chatCtor,
  AzureOpenAIEmbeddings: embedCtor,
}));

import { AzureOpenAIModel } from './AzureOpenAIModel.js';
import { AzureOpenAiEmbed } from './AzureOpenAiEmbed.js';

beforeEach(() => {
  chatCtor.mockClear();
  embedCtor.mockClear();
});

describe('AzureOpenAIModel default headers', () => {
  it('forwards defaultHeaders as OpenAI client configuration', () => {
    new AzureOpenAIModel({ defaultHeaders: { 'X-Fusion-CLI-Name': 'my-tool' } });

    const options = chatCtor.mock.calls[0][0];
    expect(options.configuration).toEqual({ defaultHeaders: { 'X-Fusion-CLI-Name': 'my-tool' } });
    expect(options).not.toHaveProperty('defaultHeaders');
  });

  it('does not set client configuration when no headers are given', () => {
    new AzureOpenAIModel({ azureOpenAIApiDeploymentName: 'gpt' });

    expect(chatCtor.mock.calls[0][0]).not.toHaveProperty('configuration');
  });
});

describe('AzureOpenAiEmbed default headers', () => {
  it('forwards defaultHeaders as OpenAI client configuration', () => {
    new AzureOpenAiEmbed({ defaultHeaders: { 'X-Fusion-CLI-Name': 'my-tool' } });

    const options = embedCtor.mock.calls[0][0];
    expect(options.configuration).toEqual({ defaultHeaders: { 'X-Fusion-CLI-Name': 'my-tool' } });
    expect(options).not.toHaveProperty('defaultHeaders');
    expect(options.batchSize).toBe(500);
  });

  it('does not set client configuration when no headers are given', () => {
    new AzureOpenAiEmbed({});

    expect(embedCtor.mock.calls[0][0]).not.toHaveProperty('configuration');
  });
});
