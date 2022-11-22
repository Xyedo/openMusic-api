const ClientError = require("./clientError");

class AuthenticationsError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = "AuthenticatinError";
  }
}

module.exports = AuthenticationsError;
