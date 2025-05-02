// controllers/admin/organizationControllers.js
import Organization from '../../models/OrgRegisterModal.js';
import transporter from '../../config/emailColfig.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import sendEmail from '../../utils/emailController.js';
import { organizationRegistrationSchema } from '../../helpers/adminValidations.js'; // Adjust path

export const registerOrganization = async (req, res) => {
  try {
    // 1. Validate Request Body using Joi
    const { error: validationError } = organizationRegistrationSchema.validate(req.body, { abortEarly: false });
    if (validationError) {
      // ... (keep your existing Joi error handling) ...
        const fieldErrors = validationError.details.reduce((acc, detail) => {
            acc[detail.path[0]] = detail.message; return acc;
        }, {});
        return res.status(400).json({
            success: false, statusCode: 400,
            message: 'Validation failed.', fieldErrors
        });
    }

    // Destructure AFTER validation
    const { name, email, password, mobile, ...otherData } = req.body; // Include mobile

    // 2. Check for Existing Email OR Mobile (More Efficient)
    const existingOrg = await Organization.findOne({
        $or: [
            { email: email },
            { mobile: mobile } // Add mobile check here
        ]
    });

    if (existingOrg) {
        let message = '';
        let fieldErrors = {};
        // Determine which field caused the conflict
        if (existingOrg.email === email) {
            message = 'An organization with this email already exists.';
            fieldErrors = { email: 'This email is already registered.' };
        } else if (existingOrg.mobile === mobile) {
            message = 'An organization with this mobile number already exists.';
            fieldErrors = { mobile: 'This mobile number is already registered.' };
        }
        return res.status(409).json({ // 409 Conflict
            success: false,
            statusCode: 409,
            message: message,
            fieldErrors: fieldErrors
        });
    }

    // --- If checks pass, continue with hashing and creation ---

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const organization = await Organization.create({
      name,
      email,
      password: hashedPassword,
      mobile, // Ensure mobile is saved
      ...otherData,
      approvalStatus: 'approved'
    });

    console.log('Organization created:', organization._id);

    // --- Send Email ---
    const emailSubject = "Welcome to PGR - Your Account Details";
    const emailMessage = `...`; // Your email template including plain password
    await sendEmail( /* ... params ... */ );

    // --- Success Response ---
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: 'Organization registered successfully. A welcome email is being sent.',
      organization: { /* Filtered organization data */ }
    });

  } catch (error) {
    // --- Keep your existing Mongoose/Server error handling ---
    console.error('Registration error:', error);
     if (error instanceof mongoose.Error.ValidationError) {
        const fieldErrors = {};
        for (let field in error.errors) { fieldErrors[field] = error.errors[field].message;}
        return res.status(400).json({ success: false, statusCode: 400, message: 'Validation failed.', fieldErrors });
    }
    // Duplicate key handler (backup for race conditions or other unique fields)
    if (error.code === 11000) {
       const field = Object.keys(error.keyValue)[0];
       return res.status(409).json({ success: false, statusCode: 409, message: `Duplicate value for ${field}.`, fieldErrors: { [field]: `${field} already exists.` } });
    }
    // Generic server error
    res.status(500).json({ success: false, statusCode: 500, message: 'Server error during registration.', error: error.message });
  }
};