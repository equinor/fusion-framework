/**
 * Configuration interface for Fusion AI operations
 */
export interface FusionAIConfig {
  patterns?: string[];
  /** Metadata processing configuration */
  metadata?: {
    /** Custom metadata processors to transform metadata before embedding */
    attributeProcessor?: (metadata: Record<string, any>) => Record<string, any>;
  };

  /** Embedding generation configuration */
  embedding?: {
    /** Size of text chunks for embedding */
    chunkSize?: number;
    /** Overlap between chunks */
    chunkOverlap?: number;
  };  
}


export const configureFusionAI = (fn: () => Promise<FusionAIConfig>|FusionAIConfig) => fn;