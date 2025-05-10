import User from '../../models/UserModal.js';
import transporter from '../../config/emailColfig.js'; // Assuming emailConfig.js
import bcrypt from 'bcrypt';
import sendEmail from '../../utils/emailController.js';
import crypto from 'crypto'; // Import crypto for password generation

import { userRegistrationSchema } from '../../helpers/adminValidations.js';

// Function to generate a random password
const generateRandomPassword = (length = 10) => {
  // Ensure secure random bytes generation
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex') // Convert to hexadecimal format
    .slice(0, length); // Return required number of characters
};

export const registerUser = async (req, res) => {
  try {
    // 1. Validate the incoming data (excluding password as it's not expected from admin)
    const { error } = userRegistrationSchema.validate(req.body, { abortEarly: false });

    if (error) {
      // If Joi validation fails for other fields
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path[0],
          message: detail.message
        }))
      });
    }

    // 2. Destructure fields *excluding* password
    const { name, email, ...otherData } = req.body; // Removed 'password' here

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // 4. Generate a random password
    const generatedPassword = generateRandomPassword(); // Generate the password
    console.log(`Generated password for ${email}: ${generatedPassword}`); // Log for debugging (remove in production)

    // 5. Hash the *generated* password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(generatedPassword, saltRounds); // Hash the generated one

    // 6. Create the user with the hashed generated password
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Save the hashed generated password
      ...otherData,
      status: "approved"
    });

    // 7. Send welcome email with the *plain text generated* password
    const emailSubject = "Welcome to PGR - Your Account Details";
    // Use backticks for the template literal
    const emailMessage = `
      <p>Dear ${name},</p>
      <p>Your account has been successfully created in our PGR Virtual Trading App by an administrator.</p>
      <p>Here are your initial login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${generatedPassword}</p> 
      <p>Please change your password after your first login for security reasons.</p>
    `;

    await sendEmail(
      email,
      emailSubject,
      emailMessage,
      [],
      "Login Now",
      `${process.env.FRONTEND_URL}/login`, // Ensure env variable is set
      true
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully, password generated, and welcome email sent',
      user // Send back user details (excluding password ideally)
    });

  } catch (error) {
    console.error('Registration error:', error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof TypeError && error.message.includes('bcrypt')
      ? 'Password processing error.'
      : 'Failed to register user';
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message // Keep original error for server logs
    });
  }
};