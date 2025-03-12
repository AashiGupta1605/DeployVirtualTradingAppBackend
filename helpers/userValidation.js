import Joi from 'joi'; 

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
  gender: Joi.string().required(),
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
  mobile: Joi.string().pattern(/^[0-9]{10}$/).label('Mobile'), // Assumes a 10-digit mobile number format
  password: Joi.string().min(6).required().label('Password'),
}).or('email', 'mobile'); // Require at least one: email or mobile


// Validation schema for updating profile (excluding email)
export const updateProfileSchema = Joi.object({
  name: Joi.string().min(3),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  gender: Joi.string().valid('male', 'female', 'other'),
  dob: Joi.date().less('now'),
  // orgtype: Joi.string().valid('company', 'individual') // Added to profile update schema
});

// Validation schema for deleting user
export const deleteUserSchema = Joi.object({
  id: Joi.string().required(),
});