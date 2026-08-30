export interface FieldError {
  path: string;
  message: string;
}

/**
 * Thrown anywhere in a controller/service; caught by the centralized
 * error handler and turned into the standard { success, message, errors }
 * response shape.
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: FieldError[];

  constructor(statusCode: number, message: string, errors?: FieldError[]) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(message: string, errors?: FieldError[]) {
    return new ApiError(400, message, errors);
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message);
  }
  static forbidden(message = "You do not have permission to do this") {
    return new ApiError(403, message);
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static tooManyRequests(message = "Too many requests, please try again later") {
    return new ApiError(429, message);
  }
  static internal(message = "Something went wrong") {
    return new ApiError(500, message);
  }
}
