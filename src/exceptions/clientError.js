class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ClientError";
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ClientError;
