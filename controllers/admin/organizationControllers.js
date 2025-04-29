// // controllers/admin/organizationControllers.js
// import Organization from '../../models/OrgRegisterModal.js';
// import transporter from '../../config/emailColfig.js'; 

// // Organization Controllers
// export const registerOrganization = async (req, res) => {
//   try {
//     console.log('Registration request body:', req.body);
//     // const { name, email, password, ...otherData } = req.body;
//     const { name, email, password, ...otherData } = req.body;
    
//     // Create organization
//     const organization = await Organization.create({
//       name,
//       email,
//       password,
//       ...otherData,
//       approvalStatus: 'approved'
//     });

//     console.log('Organization created:', organization);

//     // Send welcome email
//     const mailOptions = {
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Welcome to PGR VirtualTrading Platform',
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//           <h1 style="color: #2563EB;">Welcome to PGR VirtualTrading Platform</h1>
//           <p>Dear ${name},</p>
//           <p>Your organization has been successfully registered on the PGR VirtualTrading Platform.</p>
//           <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
//             <h2 style="color: #374151; margin-top: 0;">Your Login Credentials</h2>
//             <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
//             <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
//           </div>
//           <p>Please login using these credentials at <a href="${process.env.FRONTEND_URL}" style="color: #2563EB;">${process.env.FRONTEND_URL}</a></p>
//           <p style="color: #DC2626;"><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>
//           <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
//             <p style="margin: 0;">Best regards,<br>PGR VirtualTrading Team</p>
//           </div>
//         </div>
//       `
//     };

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log('Welcome email sent successfully');
//     } catch (emailError) {
//       console.error('Failed to send welcome email:', emailError);
//       // Continue even if email fails
//     }

//     // Send single response with all information
//     res.status(201).json({
//       success: true,
//       statusCode: 201,
//       message: 'Organization registered successfully and welcome email sent',
//       organization
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({
//       success: false,
//       statusCode: 500,
//       message: 'Failed to register organization',
//       error: error.message
//     });
//   }
// };

// controllers/admin/organizationControllers.js
import Organization from '../../models/OrgRegisterModal.js';
import transporter from '../../config/emailColfig.js';
import mongoose from 'mongoose'; // Import mongoose for validation error check
import bcrypt from 'bcrypt';
import sendEmail from '../../utils/emailController.js';
// Organization Controllers
export const registerOrganization = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, ...otherData } = req.body;

    
    // Basic check if password exists and is a string (though frontend sends it)
    if (!password || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Password is required and must be a string.',
        });
    }

    // Optional: You could add a check here for password length before even hitting the model,
    // but the model validation is the primary enforcer.
    // if (password.length > 15) {
    //     return res.status(400).json({
    //         success: false,
    //         statusCode: 400,
    //         message: 'Password cannot exceed 15 characters.',
    //     });
    // }


    // Check if organization with the same email already exists
    const existingOrg = await Organization.findOne({ email: email });
    if (existingOrg) {
        return res.status(409).json({ // 409 Conflict is appropriate for duplicates
            success: false,
            statusCode: 409,
            message: 'An organization with this email already exists.',
            fieldErrors: { email: 'Email already in use' } // Provide field-specific error
        });
    }

    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create organization
    const organization = await Organization.create({
      name,
      email,
      password:hashedPassword, // The password comes from the request body
      ...otherData,
      approvalStatus: 'approved' // Assuming admin directly approves
    });

    console.log('Organization created:', organization);

    const emailSubject = "Welcome to PGR - Your Account Details";
    const emailMessage = `
      <p>Dear ${name},</p>
      <p>Your account has been successfully created in our PGR Virtual Trading App.</p>
      <p>Here are your login credentials:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>Please change your password after your first login for security reasons.</p>
    `;
    
    await sendEmail(
      email,
      emailSubject,
      emailMessage,
      "Login Now",
      `${process.env.FRONTEND_URL}/login`, // Using your FRONTEND_URL from env
      true
    );

    // Send success response immediately after creation
    res.status(201).json({
      success: true,
      statusCode: 201,
      // Be specific: Organization created. Email sending initiated.
      message: 'Organization registered successfully. A welcome email is being sent.',
      // Avoid sending back the plain password in the response
      organization: {
          _id: organization._id,
          name: organization.name,
          email: organization.email,
          address: organization.address,
          website: organization.website,
          contactPerson: organization.contactPerson,
          mobile: organization.mobile,
          approvalStatus: organization.approvalStatus,
          createDate: organization.createDate,
          updateDate: organization.updateDate
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle Mongoose Validation Errors specifically
    if (error instanceof mongoose.Error.ValidationError) {
        // Extract user-friendly error messages
        const fieldErrors = {};
        for (let field in error.errors) {
            fieldErrors[field] = error.errors[field].message;
        }
        return res.status(400).json({ // Bad Request for validation errors
            success: false,
            statusCode: 400,
            message: 'Validation failed. Please check the provided data.',
            error: error.message, // General error message
            fieldErrors: fieldErrors // Specific field errors
        });
    }

    // Handle duplicate key errors (e.g., if email unique index exists)
    if (error.code === 11000) {
        // Determine which field caused the duplicate error
        const field = Object.keys(error.keyValue)[0];
        return res.status(409).json({ // Conflict
            success: false,
            statusCode: 409,
            message: `An organization with this ${field} already exists.`,
            fieldErrors: { [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use` }
        });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Failed to register organization due to a server error.',
      error: error.message // Provide error message in development/debug mode
    });
  }
};

// Add other controllers (get, update, delete) here if needed...
// export const getOrganizations = ...
// export const updateOrganizationDetails = ... // Note: Updating password should likely be a separate, secure endpoint
// export const deleteOrganization = ...