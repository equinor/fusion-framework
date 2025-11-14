import { defineAppConfig } from '@equinor/fusion-framework-cli/app';

import { config as loadDotEnv } from 'dotenv';
// Load environment variables from .env file
loadDotEnv({ path: '../../.env' });

export default defineAppConfig(() => {
  return {
    endpoints: {
      api: {
        url: 'https://ai.example.com',
      },
    },
    environment: {
      // Azure OpenAI Configuration
      azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
      azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
      azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
      azureOpenAIApiEmbeddingDeploymentName: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME,
      azureOpenAIApiChatDeploymentName: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT_NAME,
      
      // Azure Search Configuration (optional, for vector search)
      azureSearchEndpoint: 'http://localhost:3000/@fusion-api/cognitive-search',
      azureSearchApiKey: process.env.AZURE_SEARCH_API_KEY,
      azureSearchIndexName: process.env.AZURE_SEARCH_INDEX_NAME,
    },
  };
});

