class AuthenticationsHandler {
  constructor(authenticationsService, usersService, tokenManager, validator) {
    this.authenticationsService = authenticationsService;
    this.usersService = usersService;
    this.tokenManager = tokenManager;
    this.validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler =
      this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    this.validator.validatePostAuthenticationPayload(request.payload);
    const { username, password } = request.payload;

    const id = await this.usersService.verifyUserCredential(username, password);
    const accessToken = this.tokenManager.generateAccessToken({ id });
    const refreshToken = this.tokenManager.generateRefreshToken({ id });
    await this.authenticationsService.addRefreshToken(refreshToken);

    return h
      .response({
        status: "success",
        data: {
          accessToken,
          refreshToken,
        },
      })
      .code(201);
  }

  async putAuthenticationHandler(request, h) {
    this.validator.validatePutAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this.authenticationsService.verifyRefreshToken(refreshToken);

    const decodedToken = this.tokenManager.verifyRefreshToken(refreshToken);
    const newAccessToken = this.tokenManager.generateAccessToken(decodedToken);
    return h
      .response({
        status: "success",
        data: {
          accessToken: newAccessToken,
        },
      })
      .code(200);
  }

  async deleteAuthenticationHandler(request, h) {
    this.validator.validateDeleteAuthenticationPayload(request.payload);
    const { refreshToken } = request.payload;
    await this.authenticationsService.verifyRefreshToken(refreshToken);
    await this.authenticationsService.deleteRefreshToken(refreshToken);

    return h
      .response({
        status: "success",
        message: "success deleting token",
      })
      .code(200);
  }
}
module.exports = AuthenticationsHandler;
