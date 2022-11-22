const InvariantError = require("../../exceptions/invariantError");
const { exportPlaylistPayloadSchema } = require("./schema");

const ExportsValidator = {
  validatorExportPlaylistPayload: (payload) => {
    const validationResult = exportPlaylistPayloadSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = ExportsValidator;
