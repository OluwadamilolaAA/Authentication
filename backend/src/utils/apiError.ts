export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Bad request", code?: string, details?: unknown) {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = "Unauthorized", code?: string, details?: unknown) {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = "Forbidden", code?: string, details?: unknown) {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = "Not found", code?: string, details?: unknown) {
    return new ApiError(404, message, code, details);
  }

  static conflict(message = "Conflict", code?: string, details?: unknown) {
    return new ApiError(409, message, code, details);
  }
}
