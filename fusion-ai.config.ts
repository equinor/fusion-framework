import { configureFusionAI, type FusionAIConfig } from './packages/cli/src/lib/ai/fusion-ai.js';

export default configureFusionAI((): FusionAIConfig => {
  return {
    // File patterns to match for processing
    patterns: [
      'packages/**/src/**/*.{ts,tsx}',
      'packages/**/docs/**/*.md',
      'packages/**/README.md',
    ],
    // Embedding generation configuration
    embedding: {
      // Size of text chunks for embedding (defaults vary by implementation)
      chunkSize: 1000,
      // Overlap between chunks to maintain context
      chunkOverlap: 200,
    },
    // Metadata processing configuration
    metadata: {
      // Optional: Custom metadata processor to transform metadata before embedding
      // attributeProcessor: (metadata, document) => {
      //   // Transform or filter metadata attributes
      //   return metadata;
      // },
    },
  };
});
