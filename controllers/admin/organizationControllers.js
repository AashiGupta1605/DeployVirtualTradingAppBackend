// controllers/admin/organizationControllers.js
import Organization from '../../models/OrgRegisterModal.js';

// Organization Controllers
export const registerOrganization = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, ...otherData } = req.body;
    
    // Create organization
    const organization = await Organization.create({
      name,
      email,
      password,
      ...otherData,
      approvalStatus: 'approved'
    });

    console.log('Organization created:', organization);

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to PGR VirtualTrading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Welcome to PGR VirtualTrading Platform</h1>
          <p>Dear ${name},</p>
          <p>Your organization has been successfully registered on the PGR VirtualTrading Platform.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Your Login Credentials</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please login using these credentials at <a href="${process.env.FRONTEND_URL}" style="color: #2563EB;">${process.env.FRONTEND_URL}</a></p>
          <p style="color: #DC2626;"><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0;">Best regards,<br>PGR VirtualTrading Team</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    // Send single response with all information
    res.status(201).json({
      success: true,
      message: 'Organization registered successfully and welcome email sent',
      organization
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register organization',
      error: error.message
    });
  }
};