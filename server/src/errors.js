export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const notFound = (what) => new HttpError(404, `${what} not found`);

export const invalid = (errors) => new HttpError(422, 'Validation failed', errors);
