import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service
  auth: {
    user: process.env.EMAIL_USER, // Replace with your email
    pass: process.env.EMAIL_PASSWORD, // Replace with your email password
  },
});

export const sendRegistrationEmail = async (email, name, password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Registration Successful',
//     text: `Hello ${name},

// You have been successfully registered.

// Here are your login details:
// Email: ${email}
// Password: ${password}

// You can login using the following link: <${process.env.FRONTEND_URL}login>

// Thank you,
// praedico-global-research`,
html: `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2 style="color: #4CAF50;">Hello ${name},</h2>
  <p>You have been successfully registered.</p>
  <p style="font-weight: bold;">Here are your login details:</p>
  <ul style="list-style-type: none; padding: 0;">
    <li><strong>Email:</strong> ${email}</li>
    <li><strong>Password:</strong> ${password}</li>
  </ul>
  <p>You can login using the following link: 
    <a href="${process.env.FRONTEND_URL}/login" style="color: #1E90FF;">Login Here</a>
  </p>
  <p>Thank you,<br><strong>/praedico-global-research</strong></p>
</div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending registration email');
  }
};