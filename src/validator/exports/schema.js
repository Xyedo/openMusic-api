const Joi = require("joi");

const exportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = { exportPlaylistPayloadSchema };
