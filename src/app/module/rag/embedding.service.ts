import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { RAG_DEFAULTS } from "./rag.constant";

interface IHfEmbeddingResponse {
    [index: number]: number[];
    length: number;
}

export class EmbeddingService {
    private readonly HF_API_BASE_URL = "https://api-inference.huggingface.co/models/";

    private getEmbeddingApiKey(): string {
        const apiKey = process.env.HF_API_KEY;

        if (!apiKey) {
            throw new AppError(status.BAD_REQUEST, "HF_API_KEY is missing. Configure it before using RAG.");
        }

        return apiKey;
    }

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

    public async generateEmbedding(text: string): Promise<number[]> {
        const apiKey = this.getEmbeddingApiKey();

        const response = await fetch(`${this.HF_API_BASE_URL}${RAG_DEFAULTS.EMBEDDING_MODEL}`, {
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
            throw new AppError(status.BAD_GATEWAY, `Embedding provider failed: ${details}`);
        }

        const data = (await response.json()) as IHfEmbeddingResponse | number[] | number[][];
        const vector = this.normalizeToVector(data);

        if (!vector.length) {
            throw new AppError(status.BAD_GATEWAY, "Embedding provider returned an unexpected payload.");
        }

        return vector;
    }
}
