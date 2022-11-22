class UsersHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postUsersHandler = this.postUsersHandler.bind(this);
  }

  async postUsersHandler(request, h) {
    this.validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this.service.addUser({ username, password, fullname });
    
    return h
      .response({
        status: "success",
        data: {
          userId,
        },
      })
      .code(201);
  }
}
module.exports = UsersHandler;
