import Joi from 'joi'; 

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
  .min(8)
  .max(15) // Optional max length
  .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*[@$!%*?&#^])[A-Za-z\\d@$!%*?&#^]{8,}$"))
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.base": "Password must contain at least one letter and one special character.",
    "any.required": "Password is required.",
  }),
  // confirmPassword: Joi.string().valid(Joi.ref('password')).required().label('Confirm Password'),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).required(),
  gender: Joi.string().required(),
  userPhoto: Joi.string().label("userPhoto"),
  dob: Joi.date()
    .required()
    .custom((value, helpers) => {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Adjust age if birthdate hasn't occurred yet this year
      const hasBirthdayOccurred =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

      if (age < 18 || (age === 18 && !hasBirthdayOccurred)) {
        return helpers.message("You must be at least 18 years old");
      }

      return value;
    })
    .label("Date of Birth"),
});

// // Validation schema for user login
// export const loginUserSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).required(),
// });

// Validation schema for user login
export const loginUserSchema = Joi.object({
  email: Joi.string().email().label('Email'),
  mobile: Joi.string().pattern(/^[9876]\d{9}$/).label('Mobile'), // Assumes a 10-digit mobile number format
  password: Joi.string()
  .min(8)
  .max(15) // Optional max length
  .pattern(new RegExp("^(?=.*[A-Za-z])(?=.*[@$!%*?&#^])[A-Za-z\\d@$!%*?&#^]{8,}$"))
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.pattern.base": "Password must contain at least one letter and one special character.",
    "any.required": "Password is required.",
  }),
}).or('email', 'mobile'); // Require at least one: email or mobile


// Validation schema for updating profile (excluding email)
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  gender: Joi.string().valid('male', 'female', 'other'),
  dob: Joi.date().less('now'),
  userPhoto: Joi.string()
  // orgtype: Joi.string().valid('company', 'individual') // Added to profile update schema
  // photo:Joi.string().label("photo")
});

// Validation schema for deleting user
export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
});


export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?=.*[A-Za-z])(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot be more than 15 characters",
      "string.pattern.base": "Password must contain at least one letter and one special character",
      "any.required": "Password is required",
    }),

  newPassword: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?=.*[A-Za-z])(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot be more than 15 characters",
      "string.pattern.base": "Password must contain at least one letter and one special character",
      "any.required": "Password is required",
    }),
});

export const passwordValidationSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .max(15)
    .pattern(/^(?=.*[A-Za-z])(?=.*[@$!%*?&#^])[A-Za-z\d@$!%*?&#^]{8,}$/, "password")
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot be more than 15 characters",
      "string.pattern.base": "Password must contain at least one letter and one special character",
      "any.required": "New password is required",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "New password and confirm password must match",
      "any.required": "Confirm password is required",
    }),
  });


  export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  type: Joi.string().required(),
  desc: Joi.string().min(5).max(200).required(),
});


export const feedbackSchema = Joi.object({
  userId: Joi.string().required(),
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
  feedbackMessage: Joi.string().min(5).max(200).required(),
  rating: Joi.number().min(1).max(5).required(),
  recommend: Joi.boolean().required(),
  suggestions: Joi.string().allow("").optional(),
}).unknown(); 

export const complaintSchema = Joi.object({
  userId: Joi.string().required(),
  category: Joi.string()
    .valid("Account Issues",
      "Payment Problems",
      "Technical Errors",
      "Service Quality",
      "Other")
    .required(),
  complaintMessage: Joi.string().min(5).max(200).required(),
}).unknown();


export const organizationComplaintSchema = Joi.object({
  orgName: Joi.string().required(),
  category: Joi.string()
    .valid(
      "Account Issues",
      "Payment Problems",
      "Technical Errors",
      "Service Quality",
      "Other"
    )
    .required(),
  complaintMessage: Joi.string().min(5).max(200).required(),
  organizationId: Joi.string().required(),
}).unknown();


export const emailValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address.',
    'any.required': 'Email is required.',
  }),
});