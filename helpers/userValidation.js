import Joi from 'joi'; 

// Validation schema for user registration
export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
   // Confirm password validation
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(), // Mobile number pattern
  gender: Joi.string().required(),
  dob: Joi.date().less('now').required(), // Ensure date is in the past
  orgtype: Joi.string().valid('company', 'individual').required() // Org type added here
});

// Validation schema for user login
export const loginUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Validation schema for updating profile (excluding email)
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  gender: Joi.string().valid('male', 'female', 'other'),
  dob: Joi.date().less('now'),
  orgtype: Joi.string().valid('company', 'individual') // Added to profile update schema
});

// Validation schema for deleting user
export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
});
