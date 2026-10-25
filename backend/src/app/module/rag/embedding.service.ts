import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { RAG_DEFAULTS } from "./rag.constant";

interface IHfEmbeddingResponse {
    [index: number]: number[];
    length: number;
}

export class EmbeddingService {
    private readonly HF_ROUTER_BASE_URL = "https://router.huggingface.co/hf-inference/models/";
    private readonly OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/embeddings";

    private meanPool(tokenEmbeddings: number[][]): number[] {
        const dimensions = tokenEmbeddings[0]?.length || 0;

        if (!dimensions) {
            return [];
        }

        const pooled = Array.from({ length: dimensions }, () => 0);

        tokenEmbeddings.forEach((vector) => {
            for (let idx = 0; idx < dimensions; idx += 1) {
                pooled[idx] += vector[idx] || 0;
            }
        });

        return pooled.map((value) => value / tokenEmbeddings.length);
    }

    private normalizeToVector(payload: unknown): number[] {
        if (Array.isArray(payload) && payload.every((item) => typeof item === "number")) {
            return payload as number[];
        }

        if (
            Array.isArray(payload)
            && payload.length > 0
            && payload.every((item) => Array.isArray(item) && item.every((entry) => typeof entry === "number"))
        ) {
            return this.meanPool(payload as number[][]);
        }

        return [];
    }

    private async generateEmbeddingViaOpenRouter(text: string, retries = 2): Promise<number[]> {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            throw new Error("OPENROUTER_API_KEY is not configured.");
        }

        const model = process.env.OPENROUTER_EMBEDDING_MODEL || RAG_DEFAULTS.EMBEDDING_MODEL;

        for (let attempt = 0; attempt <= retries; attempt += 1) {
            const response = await fetch(this.OPENROUTER_BASE_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    input: text,
                    dimensions: 384,
                }),
            });

            if (response.status === 429 && attempt < retries) {
                const delayMs = 2000 * (attempt + 1);
                console.warn(`OpenRouter 429 rate limit reached. Retrying in ${delayMs}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                continue;
            }

            if (!response.ok) {
                const details = await response.text();
                throw new Error(`OpenRouter embedding failed (${response.status}): ${details}`);
            }

            const data = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
            const vector = data.data?.[0]?.embedding;

            if (!vector || !Array.isArray(vector) || vector.length === 0) {
                throw new Error("OpenRouter embedding returned invalid format.");
            }

            return vector;
        }

        throw new Error("OpenRouter embedding retries exhausted.");
    }

    private async generateEmbeddingViaHuggingFace(text: string): Promise<number[]> {
        const apiKey = process.env.HF_API_KEY;
        if (!apiKey) {
            throw new Error("HF_API_KEY is not configured.");
        }

        const response = await fetch(`${this.HF_ROUTER_BASE_URL}${RAG_DEFAULTS.EMBEDDING_MODEL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputs: text,
                options: {
                    wait_for_model: true,
                },
            }),
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`HuggingFace embedding failed (${response.status}): ${details}`);
        }

        const data = (await response.json()) as IHfEmbeddingResponse | number[] | number[][];
        const vector = this.normalizeToVector(data);

        if (!vector.length) {
            throw new Error("HuggingFace embedding returned empty vector.");
        }

        return vector;
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        const errors: string[] = [];

        // Try OpenRouter first if configured
        if (process.env.OPENROUTER_API_KEY) {
            try {
                return await this.generateEmbeddingViaOpenRouter(text);
            } catch (openRouterError) {
                const message = openRouterError instanceof Error ? openRouterError.message : String(openRouterError);
                errors.push(`OpenRouter: ${message}`);
                console.warn("OpenRouter embedding error, trying fallback:", message);
            }
        }

        // Try HuggingFace router
        if (process.env.HF_API_KEY) {
            try {
                return await this.generateEmbeddingViaHuggingFace(text);
            } catch (hfError) {
                const message = hfError instanceof Error ? hfError.message : String(hfError);
                errors.push(`HuggingFace: ${message}`);
                console.warn("HuggingFace embedding error:", message);
            }
        }

        if (errors.length > 0) {
            throw new AppError(status.BAD_GATEWAY, `Embedding providers failed: ${errors.join("; ")}`);
        }

        throw new AppError(status.BAD_REQUEST, "No embedding provider API keys (OPENROUTER_API_KEY or HF_API_KEY) are configured.");
    }
}
