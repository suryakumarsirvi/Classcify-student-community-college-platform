
export class AppError extends Error {
  constructor({ name, message, source, module }) {
    super(message);
    this.name = name || "AppError";
    this.source = source || "unknown";
    this.module = module || "global";
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
