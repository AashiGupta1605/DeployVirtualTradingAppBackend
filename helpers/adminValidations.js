import Joi from 'joi';

export const galleryItemSchema = Joi.object({
  categoryName: Joi.string().required().trim().messages({ // Added trim()
    'string.empty': 'Category Name is required.',
    'any.required': 'Category Name is required.', // Added for clarity
  }),
  // Align length limits with frontend Yup schema
  title: Joi.string().min(5).max(50).allow('', null).optional().trim().messages({
    'string.min': 'Title must be at least 5 characters.',
    'string.max': 'Title must not exceed 50 characters.',
  }),
  desc: Joi.string().min(15).max(200).allow('', null).optional().trim().messages({
    'string.min': 'Description must be at least 15 characters.',
    'string.max': 'Description must not exceed 200 characters.',
  }),
  // Validate that 'photo' is a non-empty string (base64)
  photo: Joi.string().required().trim().messages({
    'string.empty': 'Image data (base64) is required.',
    'any.required': 'Image data (base64) is required.',
  }),
}).options({ stripUnknown: true }); // Remove unexpected fields


export const demoRequestSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name must be less than 50 characters'
    }),
    website: Joi.string().uri().required().messages({
        'string.empty': 'Website is required.',
        'string.uri': 'Website must be a valid URL.'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Invalid email format.'
    }),
    mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.empty': 'Mobile number is required.',
        'string.length': 'Mobile number must be 10 digits.',
        'string.pattern.base': 'Invalid Mobile Number.'
    }),
    contactPerson: Joi.string().min(3).max(50).allow('', null),
    aboutHelp: Joi.string().min(5).max(200).required().messages({
        'string.empty': 'Tell about, how can we Assist you the best?',
        'string.min': 'Minimum length of Query can be 5.',
        'string.max': 'Maximum length of Query can be 200.'
    }),
    preferredDate: Joi.date().required().messages({
        'any.required': 'Preferred date is required.'
    }),
    preferredTimeSlot: Joi.string().allow('', null)
});


export const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name must be less than 50 characters',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required.',
        'string.email': 'Invalid email format.'
    }),
    mobile: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.empty': 'Mobile number is required.',
        'string.length': 'Mobile number must be 10 digits.',
        'string.pattern.base': 'Mobile number must contain only digits.'
    }),
    gender: Joi.string().required().messages({
        'string.empty': 'Gender is required.'
    }),
    dob: Joi.date().required().messages({
        'any.required': 'Date of birth is required.'
    }),
    aboutHelp: Joi.string().min(5).max(200).required().messages({
        'string.empty': 'Tell about, how can we Assist you the best?',
        'string.min': 'Minimum length of Query can be 5.',
        'string.max': 'Maximum length of Query can be 200.'
    }),
    preferredDate: Joi.date().required().messages({
        'any.required': 'Preferred day is required.'
    }),
    preferredTimeSlot: Joi.string().optional().allow('').messages({
        'string.base': 'Preferred time slot must be a string.'
    }),
});

export const eventSchema = Joi.object({
  // Required fields with clear validation messages
  title: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title must not exceed 50 characters',
      'any.required': 'Title is required'
    }),

  type: Joi.string()
    .valid('ongoing', 'upcoming', 'completed')
    .required()
    .messages({
      'any.only': 'Event type must be one of: ongoing, upcoming, completed',
      'string.empty': 'Event type is required',
      'any.required': 'Event type is required'
    }),

  description: Joi.string()
    .min(10)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must not exceed 500 characters',
      'any.required': 'Description is required'
    }),

  startDate: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      'any.required': 'Start date is required'
    }),

  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after start date',
      'any.required': 'End date is required'
    }),

  difficulty: Joi.string()
    .valid('Beginner', 'Intermediate', 'Advanced', 'Expert')
    .required()
    .default('Beginner')
    .messages({
      'any.only': 'Difficulty must be one of: Beginner, Intermediate, Advanced, Expert',
      'any.required': 'Difficulty level is required'
    }),

  prize: Joi.alternatives()
    .try(
      Joi.number().min(0).messages({
        'number.base': 'Prize must be a number',
        'number.min': 'Prize must be 0 or greater'
      }),
      Joi.string().pattern(/^\d+$/).messages({
        'string.pattern.base': 'Prize must be a numeric string'
      })
    )
    .required()
    .messages({
      'alternatives.types': 'Prize must be a number or numeric string',
      'alternatives.match': 'Prize must be a number or numeric string',
      'any.required': 'Prize information is required'
    }),

  entryFee: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Entry fee must be a number',
      'number.min': 'Entry fee cannot be negative',
      'any.required': 'Entry fee is required'
    }),

  participants: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Participants must be a number',
      'number.integer': 'Participants must be an integer',
      'number.min': 'Participants cannot be negative',
      'any.required': 'Participants count is required'
    }),

  // Optional fields with defaults
  rewardTiers: Joi.array()
    .items(
      Joi.object({
        tier: Joi.string().required().messages({
          'string.empty': 'Tier name is required'
        }),
        description: Joi.string().required().messages({
          'string.empty': 'Tier description is required'
        }),
        cashback: Joi.number()
          .min(0)
          .max(1)
          .optional()
          .messages({
            'number.base': 'Cashback must be a number',
            'number.min': 'Cashback cannot be negative',
            'number.max': 'Cashback cannot exceed 1'
          }),
        bonus: Joi.number()
          .min(0)
          .optional()
          .messages({
            'number.base': 'Bonus must be a number',
            'number.min': 'Bonus cannot be negative'
          })
      })
    )
    .default([]),

  cashbackPercentage: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Cashback percentage must be a number',
      'number.min': 'Cashback percentage cannot be negative',
      'number.max': 'Cashback percentage cannot exceed 100'
    }),

  rewards: Joi.array()
    .items(Joi.string())
    .default([]),

  prizeBreakdown: Joi.array()
    .items(
      Joi.object({
        position: Joi.string().required().messages({
          'string.empty': 'Position is required'
        }),
        reward: Joi.string().required().messages({
          'string.empty': 'Reward description is required'
        })
      })
    )
    .default([]),

  // Other optional fields
  requirements: Joi.string()
    .allow('')
    .default(''),

  progress: Joi.number()
    .min(0)
    .max(100)
    .default(0)
    .messages({
      'number.base': 'Progress must be a number',
      'number.min': 'Progress cannot be negative',
      'number.max': 'Progress cannot exceed 100%'
    }),

  progressText: Joi.string()
    .allow('')
    .default(''),

  icon: Joi.string()
    .default('Trophy'),

  backgroundColor: Joi.string()
    .default('bg-gradient-to-br from-blue-50 to-blue-100'),

  highlight: Joi.string()
    .allow('')
    .default('')

}).options({ 
  abortEarly: false,  // Show all validation errors at once
  allowUnknown: true  // Allow other non-specified fields
});

export const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must not exceed 50 characters',
      'string.pattern.base': 'Name can only contain letters and spaces'
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format'
    }),

  mobile: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be 10 digits and start with 6, 7, 8, or 9'
    }),

  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      'string.empty': 'Gender is required',
      'any.only': 'Invalid gender selection'
    }),

  dob: Joi.date()
    .max('now')
    .custom((value, helpers) => {
      const age = calculateAge(value);
      if (age < 18) {
        return helpers.error('date.minAge');
      }
      return value;
    })
    .required()
    .messages({
      'date.base': 'Invalid date format',
      'date.max': 'Date of birth cannot be in the future',
      'date.minAge': 'Must be at least 18 years old'
    })
});

function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}



// --- Add this schema ---
export const organizationRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Organization Name is required',
      'string.min': 'Name must be at least 3 characters',
      'string.max': 'Name must not exceed 100 characters',
    }),
  address: Joi.string()
    .min(5)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters',
    }),
  website: Joi.string()
    .uri({ scheme: ['http', 'https'] }) // Validate URL format
    .allow('', null) // Allow empty string or null
    .messages({
      'string.uri': 'Website must be a valid URL (e.g., http://example.com)',
    }),
  contactPerson: Joi.string()
    .min(2)
    .required()
    .messages({
      'string.empty': 'Contact Person is required',
      'string.min': 'Contact person name must be at least 2 characters',
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } }) // Standard email validation
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Invalid email format',
    }),
  mobile: Joi.string()
    // Using the pattern from your original Yup schema for consistency
    .pattern(/^[9876]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Mobile number is required',
      'string.pattern.base': 'Mobile number must be exactly 10 digits and start with 9, 8, 7, or 6',
    }),
  // Password validation (since frontend sends it)
  password: Joi.string()
    .min(8) // Example: Enforce minimum length
    .max(15) // Example: Enforce maximum length (adjust if needed)
    .required()
    .messages({
        'string.empty': 'Password is required (should be generated)', // Internal check
        'string.min': 'Generated password is too short (min 8)',
        'string.max': 'Generated password is too long (max 15)', // Important if model has limit
    }),
    // approvalStatus is NOT included as backend sets it
}).options({ stripUnknown: true }); // Important: Removes fields not in schema (like 'status' if sent accidentally)

// --- Keep your existing userRegistrationSchema below ---
// export const userRegistrationSchema = Joi.object({ ... });
// function calculateAge(birthDate) { ... }