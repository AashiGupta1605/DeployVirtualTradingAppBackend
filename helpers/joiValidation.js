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
  password: Joi.string().min(8).required().label('Password'),
  accreditation:Joi.string().label("Accreditation"),
  photo:Joi.string().label("photo") // ad this line here and your registration will start working..
});


// add login with mobile 

export const organizationLoginValidationSchema = Joi.object({
  email: Joi.string().email().label('Email'),
  mobile: Joi.string().label('Mobile'),
  password: Joi.string().required().label('Password')
}).or('email', 'mobile'); // Require either email or mobile, but not both


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
  // password: Joi.string().min(8).required().label('Password'),
  addedby: Joi.string().required(),
  status: Joi.boolean().default(true).required(),
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
  address: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  contactPerson: Joi.string().optional(),
  email: Joi.string().email().optional(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  approvalStatus: Joi.string()
    .valid('approved', 'pending', 'rejected')
    .optional(),
  isDeleted: Joi.boolean().optional(),
  // Explicitly exclude system-generated and sensitive fields
  password: Joi.forbidden(),
  createDate: Joi.forbidden(),
  updateDate: Joi.forbidden(),
  _id: Joi.forbidden(),
  __v: Joi.forbidden()
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
  name: Joi.string()
    .min(2)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .optional(),
  dob: Joi.date()
    .max(new Date())
    .optional(),
  orgtype: Joi.string()
    .optional()
});

export const deleteUserValidation = Joi.object({
  id: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
});







// organization feedbacks models


export const organizationFeedbackValidationSchema = Joi.object({
  organizationId: Joi.string().required(),
  feedbackCategory: Joi.string()
    .valid(
      "Website UI/UX",
      "Trading Features",
      "Data Accuracy",
      "Performance & Speed",
      "Customer Support",
      "Other"
    )
    .required(),
  feedbackMessage: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  recommend: Joi.boolean().required(),
  suggestions: Joi.string().allow("").optional(),
});