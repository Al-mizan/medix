import { describe, it, expect, vi, beforeEach } from "vitest";
import { queryRAG } from "../rag.services";
import { httpClient } from "@/lib/axios/httpClient";

vi.mock("@/lib/axios/httpClient", () => ({
  httpClient: {
    post: vi.fn(),
  },
}));

describe("queryRAG Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls /rag/query with default topK and minSimilarity when not provided", async () => {
    const mockResponse = {
      success: true,
      message: "Success",
      data: {
        answer: "Clinical answer",
        citations: [],
        retrieval: { totalMatches: 0 },
      },
    };
    vi.mocked(httpClient.post).mockResolvedValue(mockResponse as unknown as Awaited<ReturnType<typeof httpClient.post>>);

    const result = await queryRAG({ query: "How to book an appointment?" });

    expect(httpClient.post).toHaveBeenCalledTimes(1);
    expect(httpClient.post).toHaveBeenCalledWith("/rag/query", {
      query: "How to book an appointment?",
      topK: 5,
      minSimilarity: 0.2,
    });
    expect(result).toEqual(mockResponse);
  });

  it("passes custom topK, minSimilarity, and sourceTypes", async () => {
    const mockResponse = {
      success: true,
      message: "Success",
      data: {
        answer: "Specialty guidance",
        citations: [
          {
            sourceType: "doctor",
            sourceId: "doc-1",
            sourceLabel: "Dr. Smith",
            similarity: 0.92,
            snippet: "Cardiologist expert",
            metadata: null,
          },
        ],
        retrieval: { totalMatches: 1 },
      },
    };
    vi.mocked(httpClient.post).mockResolvedValue(mockResponse as unknown as Awaited<ReturnType<typeof httpClient.post>>);

    const result = await queryRAG({
      query: "Cardiology specialists",
      topK: 3,
      minSimilarity: 0.4,
      sourceTypes: ["doctor", "specialty"],
    });

    expect(httpClient.post).toHaveBeenCalledWith("/rag/query", {
      query: "Cardiology specialists",
      topK: 3,
      minSimilarity: 0.4,
      sourceTypes: ["doctor", "specialty"],
    });
    expect(result.data.citations).toHaveLength(1);
  });

  it("throws error when httpClient fails", async () => {
    vi.mocked(httpClient.post).mockRejectedValue(new Error("Network Error"));

    await expect(queryRAG({ query: "Test" })).rejects.toThrow("Network Error");
  });
});
