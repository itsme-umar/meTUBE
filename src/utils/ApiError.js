class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something wents wrong!",
    errors = [],
    stack
  ) {
    super(message);
    this.statusCode = 500;
    this.message = message;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
