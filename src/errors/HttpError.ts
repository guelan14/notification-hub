export default class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
