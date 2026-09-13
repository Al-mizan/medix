"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiResponse } from "@/types/api.types";
import { IRagQueryRequest, IRagQueryResponse } from "@/types/rag.types";

export async function queryRAG(
  payload: IRagQueryRequest
): Promise<ApiResponse<IRagQueryResponse>> {
  try {
    const requestData: IRagQueryRequest = {
      query: payload.query,
      topK: payload.topK ?? 5,
      minSimilarity: payload.minSimilarity ?? 0.2,
      ...(payload.sourceTypes ? { sourceTypes: payload.sourceTypes } : {}),
    };

    return await httpClient.post<IRagQueryResponse>("/rag/query", requestData);
  } catch (error) {
    console.error("Error querying RAG AI service:", error);
    throw error;
  }
}
