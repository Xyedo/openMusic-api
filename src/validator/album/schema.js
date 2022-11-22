const Joi = require("joi");

const nowYear = new Date().getFullYear();
const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().min(1900).max(nowYear).required(),
});

const CoverAlbumPayloadSchema = Joi.object({
  "content-type": Joi.string()
    .valid(
      "image/apng",
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml"
    )
    .required(),
}).unknown();

module.exports = { AlbumPayloadSchema, CoverAlbumPayloadSchema };
