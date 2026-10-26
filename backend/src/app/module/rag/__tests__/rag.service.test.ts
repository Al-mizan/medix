import { describe, it, expect, vi, beforeEach } from "vitest";
import { RagService } from "../rag.service";
import { EmbeddingService } from "../embedding.service";
import { LlmService } from "../llm.service";

describe("RAG Service & Providers", () => {
    beforeEach(() => {
        vi.stubEnv("OPENROUTER_API_KEY", "mock-openrouter-key");
        vi.stubEnv("GROQ_API_KEY", "mock-groq-key");
        vi.stubEnv("HF_API_KEY", "mock-hf-key");

        const mockVector = new Array(384).fill(0.02);
        vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
            const urlStr = String(url);
            if (urlStr.includes("embeddings") || urlStr.includes("models/")) {
                return new Response(JSON.stringify({ data: [{ embedding: mockVector }] }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
            if (urlStr.includes("chat/completions")) {
                return new Response(JSON.stringify({
                    choices: [{ message: { content: "Dr. John is a specialist in Neurology." } }],
                }), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            }
            return new Response("Not found", { status: 404 });
        });
    });

    it("should successfully generate 384-dimensional embedding via EmbeddingService", async () => {
        const embeddingService = new EmbeddingService();
        const vector = await embeddingService.generateEmbedding("Clinical guidelines for cardiology");

        expect(Array.isArray(vector)).toBe(true);
        expect(vector.length).toBe(384);
        expect(vector.every((num) => typeof num === "number" && !isNaN(num))).toBe(true);
    });

    it("should generate grounded answers via LlmService", async () => {
        const llmService = new LlmService();
        const answer = await llmService.generateGroundedAnswer({
            question: "Who is Dr. John?",
            context: "Doctor Name: Dr. John, Specialist in Neurology.",
        });

        expect(typeof answer).toBe("string");
        expect(answer.length).toBeGreaterThan(0);
    });

    it("should query clinical knowledge and return structured response", async () => {
        const ragService = new RagService();
        const result = await ragService.queryKnowledge({
            query: "How to book an appointment?",
            topK: 5,
            minSimilarity: 0.2,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("answer");
        expect(typeof result.answer).toBe("string");
        expect(result.answer.length).toBeGreaterThan(0);
        expect(result).toHaveProperty("citations");
        expect(result).toHaveProperty("retrieval");
    });

    it("should degrade gracefully without throwing 500 when embedding provider fails", async () => {
        const ragService = new RagService();
        // Force embedding service failure
        vi.spyOn(EmbeddingService.prototype, "generateEmbedding").mockRejectedValueOnce(
            new Error("Simulated upstream network failure")
        );

        const result = await ragService.queryKnowledge({
            query: "How does consultation work?",
            topK: 5,
            minSimilarity: 0.2,
        });

        expect(result).toBeDefined();
        expect(result).toHaveProperty("answer");
        expect(typeof result.answer).toBe("string");
        expect(result.answer.length).toBeGreaterThan(0);
        expect(result.retrieval.totalMatches).toBe(0);
    });
});
