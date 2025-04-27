import Joi from 'joi';

export const galleryItemSchema = Joi.object({
  categoryName: Joi.string().required().messages({
    'string.empty': 'Category Name is a required field.',
  }),
  title: Joi.string().min(3).max(50).optional().allow('').messages({
    'string.min': 'Title must be at least 3 characters.',
    'string.max': 'Title must not exceed 50 characters.',
  }),
  desc: Joi.string().min(15).max(200).optional().allow('').messages({
    'string.min': 'Description must be at least 15 characters.',
    'string.max': 'Description must not exceed 200 characters.',
  }),
  photo: Joi.string().required().messages({
    'string.empty': 'Image data (base64) is required.',
  }),
});

export const demoRequestSchema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
        'string.empty': 'Name is required.',
        'string.min': 'Name is too small.',
        'string.max': 'Name is too large.'
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
        'string.min': 'Name is too small.',
        'string.max': 'Name is too large.',
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
    title: Joi.string().min(3).max(50).required().messages({
      'string.empty': 'Event title is required.',
      'string.min': 'Title must be at least 5 characters.',
      'string.max': 'Title must not exceed 50 characters.',
    }),
    type: Joi.string().valid('ongoing', 'upcoming', 'completed').required().messages({
      'any.only': 'Type must be one of ongoing, upcoming, or completed.',
      'string.empty': 'Event type is required.',
    }),
    description: Joi.string().min(10).max(200).required().messages({
      'string.empty': 'Event description is required.',
      'string.min': 'Description must be at least 10 characters.',
      'string.max': 'Description must not exceed 200 characters.',
    }),
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date.',
      'any.required': 'Start date is required.',
    }),
    endDate: Joi.date().required().messages({
      'date.base': 'End date must be a valid date.',
      'any.required': 'End date is required.',
    }),
    prize: Joi.string().optional().allow(''),
    difficulty: Joi.string().optional().allow(''),
    rewardTiers: Joi.array().items(Joi.any()).optional(),
    participants: Joi.number().optional(),
    entryFee: Joi.number().optional(),
    cashbackPercentage: Joi.number().optional(),
    rewards: Joi.array().optional(),
    prizeBreakdown: Joi.array().optional(),
    requirements: Joi.string().optional().allow(''),
    progress: Joi.number().optional(),
    progressText: Joi.string().optional().allow(''),
    icon: Joi.string().optional().allow(''),
    backgroundColor: Joi.string().optional().allow(''),
    highlight: Joi.string().optional().allow(''),
  });