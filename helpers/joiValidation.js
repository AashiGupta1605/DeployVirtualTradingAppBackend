// import Joi from "joi";

// export const studentValidationSchema = Joi.object({
//   name: Joi.string().required(),
//   email: Joi.string().email().required(),
//   mobile: Joi.string().pattern(/^[9876]\d{9}$/).required().messages({
//     "string.pattern.base": "Mobile number must start with 9, 8, 7, or 6 and contain 10 digits"
//   }),
//   gender: Joi.string().required(),
//   dob: Joi.date().required().custom((value, helpers) => {
//     if (new Date().getFullYear() - new Date(value).getFullYear() < 18) {
//       return helpers.message("You must be at least 18 years old");
//     }
//     return value;
//   }),
//   password: Joi.string().min(8).required(),
//   orgtype: Joi.string().required(),
//   orgName: Joi.string().required(),
//   status: Joi.boolean().required(),
// });


import Joi from "joi";

export const studentValidationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).required().messages({
    "string.pattern.base": "Mobile number must start with 9, 8, 7, or 6 and contain 10 digits"
  }),
  gender: Joi.string().required(),
  dob: Joi.date().required().custom((value, helpers) => {
    if (new Date().getFullYear() - new Date(value).getFullYear() < 18) {
      return helpers.message("You must be at least 18 years old");
    }
    return value;
  }),
  password: Joi.string().min(8).required(),
  orgtype: Joi.string().required(),
  orgName: Joi.string().required(),
});




export const organizationValidationSchema = Joi.object({
  name: Joi.string().required().label('Name'),
  address: Joi.string().required().label('Address'),
  website: Joi.string().uri().label('Website'),
  contactPerson: Joi.string().label('Contact Person'),
  email: Joi.string().email().required().label('Email'),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).label('Mobile'),
  approvalStatus: Joi.string().valid("approved", "rejected", "pending").default("pending").label('Approval Status'),
  password: Joi.string().min(8).required().label('Password')
});


export const organizationLoginValidationSchema = Joi.object({
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password')
});

export default organizationLoginValidationSchema;