export interface IRagCitation {
  sourceType: string;
  sourceId: string;
  sourceLabel?: string | null;
  similarity: number;
  snippet: string;
  metadata?: Record<string, unknown> | null;
}

export interface IRagQueryRequest {
  query: string;
  topK?: number;
  minSimilarity?: number;
  sourceTypes?: string[];
}

export interface IRagQueryResponse {
  answer: string;
  citations: IRagCitation[];
  retrieval: {
    totalMatches: number;
  };
}

export interface IChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  citations?: IRagCitation[];
  createdAt?: string | Date;
}
