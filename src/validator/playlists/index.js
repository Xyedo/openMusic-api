const InvariantError = require("../../exceptions/invariantError");
const {
  PlaylistPayloadSchema,
  SongsInPlaylistPayloadSchema,
} = require("./schema");

const PlaylistsValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validateResult = PlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },

  validatePostsSongInPlaylistPayload: (payload) => {
    const validateResult = SongsInPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateDeleteSongInPlaylistPayload: (payload) => {
    const validateResult = SongsInPlaylistPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;
