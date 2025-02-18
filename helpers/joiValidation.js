import Joi from "joi";

export const organizationRegistrationValidationSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  address: Joi.string().required().label('Address'),
  website: Joi.string().uri().label('Website'),
  contactPerson: Joi.string().required().label('Contact Person'),
  email: Joi.string().email().required().label('Email'),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).required().label('Mobile'),
  approvalStatus: Joi.string().valid("approved", "rejected", "pending").default("pending").label('Approval Status'),
  password: Joi.string().min(8).required().label('Password')
});

export const organizationLoginValidationSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password')
});

export const organizationUserRegistrationValidationSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  email: Joi.string().email().required().label('Email'),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).required().messages({
    "string.pattern.base": "Mobile number must start with 9, 8, 7, or 6 and contain 10 digits"
  }),
  gender: Joi.string().valid("male", "female", "other").required().label('Gender'),
  dob: Joi.date().required().custom((value, helpers) => {
    if (new Date().getFullYear() - new Date(value).getFullYear() < 18) {
      return helpers.message("You must be at least 18 years old");
    }
    return value;
  }).label('Date of Birth'),
  password: Joi.string().min(8).required().label('Password'),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Confirm password must match password'
  }).label('Confirm Password'),
  addedby: Joi.string().required().label('Added By'),
  status: Joi.string().valid("active", "inactive").required().label('Status')
});

export default {
  organizationRegistrationValidationSchema,
  organizationLoginValidationSchema,
  organizationUserRegistrationValidationSchema
};