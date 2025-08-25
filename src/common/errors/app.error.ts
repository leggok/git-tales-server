export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
        public readonly code?: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = "AppError";
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            details: this.details
        };
    }
}
