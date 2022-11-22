const Joi = require("joi");

const UserPayloadSchema = Joi.object({
  username: Joi.string().trim().regex(/^\S*$/).max(50).required(),
  password: Joi.string().required(),
  fullname: Joi.string().trim().required(),
});

module.exports = { UserPayloadSchema };
