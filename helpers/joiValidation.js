import Joi from "joi";

//organization
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
  gender: Joi.string().required(),
  dob: Joi.date().required().custom((value, helpers) => {
    if (new Date().getFullYear() - new Date(value).getFullYear() < 18) {
      return helpers.message("You must be at least 18 years old");
    }
    return value;
  }).label('Date of Birth'),
  password: Joi.string().min(8).required().label('Password'),
  addedby: Joi.string().required(),
  status: Joi.boolean().default(true).required()
});

export default {
  organizationRegistrationValidationSchema,
  organizationLoginValidationSchema,
  organizationUserRegistrationValidationSchema
};


//Admin
export const saveNiftyDataValidation = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  }),
  value: Joi.number().required().messages({
    'number.base': 'Value must be a number',
    'any.required': 'Value is required',
  }),
});

export const getCompanyBySymbolValidation = Joi.object({
  symbol: Joi.string().required().messages({
    'string.empty': 'Symbol is required',
    'any.required': 'Symbol is required',
  }),
});

export const updateOrgValidation = Joi.object({
  name: Joi.string().optional(),
  approvalStatus: Joi.string().valid('approved', 'rejected').optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const updateApprovalStatusValidation = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required().messages({
    'any.only': 'Status must be either "approved" or "rejected"',
    'any.required': 'Status is required',
  }),
});

export const getUserByOrgNameValidation = Joi.object({
  orgName: Joi.string().required().messages({
    'string.empty': 'Organization name is required',
    'any.required': 'Organization name is required',
  }),
});

export const updateUserValidation = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  isDeleted: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field is required to update',
});

export const deleteUserValidation = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
});