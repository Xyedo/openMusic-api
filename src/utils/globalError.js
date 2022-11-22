const ClientError = require("../exceptions/clientError");

const globalError = (request, h) => {
  const { response } = request;
  if (response instanceof ClientError) {
    return h
      .response({
        status: "fail",
        message:
          typeof response.message !== "string"
            ? response.message.toString()
            : response.message,
      })
      .code(response.statusCode);
  }
  if (response instanceof Error) {
    const { statusCode, message } = response.output.payload;
    if (statusCode === 401 || statusCode === 413 || statusCode === 415) {
      return h
        .response({
          status: "fail",
          message,
        })
        .code(statusCode);
    }
    if (process.env.NODE_ENV === "DEVELOPMENT") {
      // eslint-disable-next-line no-console
      console.error(response.stack);
    }
    return h
      .response({
        status: "error",
        message: "Server Error to handler error",
      })
      .code(500);
  }
  return response.continue ?? response;
};
module.exports = globalError;
