const InvariantError = require("../../exceptions/invariantError");
const { AlbumPayloadSchema, CoverAlbumPayloadSchema } = require("./schema");

const AlbumValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateAlbumCoverHeaders: (headers) => {
    const validationResult = CoverAlbumPayloadSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};
module.exports = AlbumValidator;
