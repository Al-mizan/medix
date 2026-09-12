import { Response } from "express";

/**
 * Interface representing standard API response envelope properties.
 *
 * @typeParam T - Type of the returned payload entity
 */
export interface IResponseData<T> {
    /** HTTP numeric status code (e.g. 200, 201) */
    httpStatusCode: number;
    /** Boolean indicating operation success status */
    success: boolean;
    /** Human-readable message explaining the response */
    message: string;
    /** Optional data payload */
    data?: T;
    /** Optional pagination metadata */
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}

/**
 * Formats and transmits a standardized JSON response envelope to the HTTP client.
 *
 * @typeParam T - Data payload entity type
 * @param res - Express Response object
 * @param responseData - Envelope attributes including status, data, and metadata
 *
 * @example
 * ```typescript
 * sendResponse(res, {
 *   httpStatusCode: 200,
 *   success: true,
 *   message: "Profile retrieved",
 *   data: patientProfile,
 * });
 * ```
 */
export const sendResponse = <T>(res: Response, responseData: IResponseData<T>) => {
    const { httpStatusCode, success, message, data, meta } = responseData;
    res.status(httpStatusCode).json({
        success,
        message,
        data,
        meta
    });
}