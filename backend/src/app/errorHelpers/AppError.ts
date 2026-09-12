/**
 * Custom operational error class for standardizing HTTP error responses across the application.
 * Integrates directly with `globalErrorHandler` to emit uniform JSON error envelopes.
 *
 * @example
 * ```typescript
 * throw new AppError(status.NOT_FOUND, "Patient profile not found");
 * ```
 */
class AppError extends Error {
    /** HTTP Status code (e.g. 400, 401, 403, 404, 500) */
    public statusCode: number;

    /**
     * Constructs a new AppError instance.
     *
     * @param statusCode - The HTTP status code number
     * @param message - Descriptive human-readable error message
     * @param stack - Optional custom stack trace override
     */
    constructor(statusCode: number, message: string, stack?: string) {
        super(message);
        this.statusCode = statusCode;
        if(stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default AppError;