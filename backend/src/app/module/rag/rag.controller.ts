import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { redisService } from "../../lib/redis";
import { RagService } from "./rag.service";
import status from "http-status";

class RagControllerClass {
    private ragService: RagService;

    constructor() {
        this.ragService = new RagService();
    }

    public ingestDocument = catchAsync(async (req: Request, res: Response) => {
        const result = await this.ragService.ingestDocument(req.body);

        sendResponse(res, {
            httpStatusCode: status.CREATED,
            success: true,
            message: "RAG document ingested successfully",
            data: result,
        });
    });

    public queryKnowledge = catchAsync(async (req: Request, res: Response) => {
        const { query, topK, minSimilarity, sourceTypes } = req.body;

        // Generate cache key from query parameters
        const sourceTypesStr = sourceTypes ? sourceTypes.join(",") : "all";
        const cacheKey = `rag:query:${query}:${topK ?? 5}:${minSimilarity ?? "default"}:${sourceTypesStr}`;

        try {
            // Try to get from cache first
            const cachedResult = await redisService.get(cacheKey);

            if (cachedResult) {
                // Cache hit - parse and return cached data
                const parsedData = JSON.parse(cachedResult);

                sendResponse(res, {
                    httpStatusCode: status.OK,
                    success: true,
                    message: "Answer retrieved from cache",
                    data: parsedData,
                });
                return;
            }
        } catch (cacheError) {
            // Log cache error but continue with normal processing
            console.warn("Cache read error, proceeding with normal processing:", cacheError);
        }

        // Cache miss - process normally
        const result = await this.ragService.queryKnowledge(req.body);

        // Store result in cache with 30-minute TTL (1800 seconds)
        try {
            await redisService.set(cacheKey, result, 1800);
        } catch (cacheError) {
            // Log cache error but don't fail the request
            console.warn("Cache write error:", cacheError);
        }

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "RAG query executed successfully",
            data: result,
        });
    });

    public reindexKnowledge = catchAsync(async (req: Request, res: Response) => {
        const result = await this.ragService.reindexKnowledge(req.body);

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "RAG reindex completed successfully",
            data: result,
        });
    });

    public getStats = catchAsync(async (_req: Request, res: Response) => {
        const result = await this.ragService.getStats();

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "RAG stats fetched successfully",
            data: result,
        });
    });
}

export const RagController = new RagControllerClass();
