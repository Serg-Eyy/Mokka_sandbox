/** User related Joi's validation schemes **/

const Joi = require('joi');

// noinspection JSUnresolvedFunction
const createUserSchema = Joi.object().keys({
   login: Joi.string().required().alphanum().min(3).max(30).normalize(),
   pwd: Joi.string().required().min(6).max(30).normalize(),
   email: Joi.string().required().email().normalize(),
   role: Joi.string().required().allow('User', 'Admin', 'ReadOnly').default('User'),
   twitter: Joi.string().token(),
   google: Joi.string().token(),
   github: Joi.string().token(),
   facebook: Joi.string().token(),
   profile: Joi.object().keys({
     name: Joi.string().alphanum(),
     gender: Joi.string().allow('m','f','-').default('-'),
     location: Joi.string(),
     website: Joi.string().uri(),
     picture: Joi.string()
   })
});

// noinspection JSUnresolvedFunction
const authenticateUserSchema = Joi.object().keys({
  login: Joi.string().required().alphanum().min(3).max(30).normalize(),
  pwd: Joi.string().required().normalize()
});

module.exports = {
  create : createUserSchema,
  auth   : authenticateUserSchema
};
