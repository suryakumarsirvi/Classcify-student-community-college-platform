import { AppError } from "./AppError";


export class ApiError extends AppError {
  constructor({ name, message, status, source, module, originalError }) {
    super({
      name: name || "API_ERROR",
      message: message || "An API error occurred",
      source: source || "api.client",
      module: module || "network",
    });
    this.status = status || 500;
    this.originalError = originalError;
  }
}
