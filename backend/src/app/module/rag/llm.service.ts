import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { RAG_DEFAULTS, RAG_PROMPT_SYSTEM } from "./rag.constant";

interface IChatResponse {
    choices?: Array<{
        message?: {
            content?: string;
        };
    }>;
}

export class LlmService {
    private readonly GROQ_API_BASE_URL = "https://api.groq.com/openai/v1";
    private readonly OPENROUTER_API_BASE_URL = "https://openrouter.ai/api/v1";

    private async callGroqWithModel(apiKey: string, model: string, question: string, context: string): Promise<string> {
        const response = await fetch(`${this.GROQ_API_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                temperature: 0.1,
                messages: [
                    {
                        role: "system",
                        content: RAG_PROMPT_SYSTEM,
                    },
                    {
                        role: "user",
                        content: `Question:\n${question}\n\nContext:\n${context}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`Groq model '${model}' failed with status ${response.status}: ${details}`);
        }

        const payload = (await response.json()) as IChatResponse;
        const answer = payload.choices?.[0]?.message?.content?.trim();

        if (!answer) {
            throw new Error(`Groq model '${model}' returned an empty response.`);
        }

        return answer;
    }

    private async generateViaGroq(question: string, context: string): Promise<string> {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not configured.");
        }

        const candidateModels = [
            RAG_DEFAULTS.GROQ_MODEL,
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "qwen/qwen3.8-27b",
        ].filter((model, idx, arr) => Boolean(model) && arr.indexOf(model) === idx);

        let lastError: Error | null = null;
        for (const model of candidateModels) {
            try {
                return await this.callGroqWithModel(apiKey, model, question, context);
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.warn(`Groq candidate model failed:`, lastError.message);
            }
        }

        throw lastError || new Error("All Groq candidate models failed.");
    }

    public async generateGroundedAnswer(params: { question: string; context: string }): Promise<string> {
        const errors: string[] = [];

        // Try Groq first
        if (process.env.GROQ_API_KEY) {
            try {
                return await this.generateViaGroq(params.question, params.context);
            } catch (groqError) {
                const message = groqError instanceof Error ? groqError.message : String(groqError);
                errors.push(`Groq: ${message}`);
            }
        }

        // Fallback to OpenRouter if available
        if (process.env.OPENROUTER_API_KEY) {
            try {
                const openRouterModel = process.env.OPENROUTER_LLM_MODEL || "google/gemma-4-26b-a4b-it:free";
                const response = await fetch(`${this.OPENROUTER_API_BASE_URL}/chat/completions`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: openRouterModel,
                        temperature: 0.1,
                        messages: [
                            { role: "system", content: RAG_PROMPT_SYSTEM },
                            { role: "user", content: `Question:\n${params.question}\n\nContext:\n${params.context}` },
                        ],
                    }),
                });

                if (response.ok) {
                    const data = (await response.json()) as IChatResponse;
                    const answer = data.choices?.[0]?.message?.content?.trim();
                    if (answer) return answer;
                }
            } catch (openRouterError) {
                const message = openRouterError instanceof Error ? openRouterError.message : String(openRouterError);
                errors.push(`OpenRouter: ${message}`);
            }
        }

        if (errors.length > 0) {
            throw new AppError(status.BAD_GATEWAY, `Generation providers failed: ${errors.join("; ")}`);
        }

        throw new AppError(status.BAD_REQUEST, "No LLM provider API key (GROQ_API_KEY or OPENROUTER_API_KEY) configured.");
    }
}
