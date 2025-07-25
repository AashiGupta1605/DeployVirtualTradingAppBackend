// ORGANIZATION CRUD OPERATION ==========================================================================

import OrgRegistration from '../../models/OrgRegisterModal.js';
import { organizationRegistrationValidationSchema, organizationLoginValidationSchema, getUserByOrgNameValidation, changePasswordSchema, passwordValidationSchema} from '../../helpers/joiValidation.js';
import { hashPassword, comparePassword } from '../../helpers/hashHelper.js';
import jwt from 'jsonwebtoken';
import { sendOrganizationRegistrationEmail } from '../../helpers/emailService.js';
import sendEmail from "../../utils/emailController.js"; 
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import sendOtp from '../../utils/sendOtp.js';
// import cloudinary from '../../helpers/cloudinary.js';

import {
  ORG_REGISTRATION_SUCCESS,
  ORG_ALREADY_EXISTS_NAME,
  ORG_ALREADY_EXISTS_EMAIL,
  ORG_ALREADY_EXISTS_PHONE,
  ORG_ALREADY_EXISTS_WEBSITE,
  ORG_LOGIN_INVALID_CREDENTIALS,
  ORG_LOGIN_PENDING_APPROVAL,
  ORG_LOGIN_REJECTED,
  ORG_NOT_FOUND,
  ORG_GET_DATA_SUCCESS,
  SERVER_ERROR,
  ORG_NAME_REQUIRED,
  ORG_ID_REQUIRED,
  ORG_PROFILE_UPDATED_SUCCESS,
} from '../../helpers/messages.js';


// ORGANIZATION REGISTRATION CONTROLLER ----------------------------------------------------------
// add confirm password and remove acrrediation
// real working----
// export const organizationRegister = async (req, res) => {
//   const { name, address, website, contactPerson, email, mobile, approvalStatus, password } = req.body;

//   // Validate the request body
//   const { error } = organizationRegistrationValidationSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   try {
//     // Check if the organization already exists
//     const existingOrgByName = await OrgRegistration.findOne({ name });
//     const existingOrgByEmail = await OrgRegistration.findOne({ email });
//     const existingOrgByMobile = await OrgRegistration.findOne({ mobile });
//     const existingOrgByWebsite = await OrgRegistration.findOne({ website });

//     if (existingOrgByName) {
//       return res.status(400).json({ message: ORG_ALREADY_EXISTS_NAME, success:false });
//     }

//     if (existingOrgByEmail) {
//       return res.status(400).json({ message: ORG_ALREADY_EXISTS_EMAIL , success:false });
//     }

//     if (existingOrgByMobile) {
//       return res.status(400).json({ message: ORG_ALREADY_EXISTS_PHONE, success:false });
//     }

//     if (existingOrgByWebsite) {
//       return res.status(400).json({ message: ORG_ALREADY_EXISTS_WEBSITE, success:false });
//     }

//     // Hash the password
//     const hashedPassword = await hashPassword(password);

//     // Create a new organization
//     const newOrg = new OrgRegistration({
//       name,
//       address,
//       website,
//       contactPerson,
//       email,
//       mobile,
//       approvalStatus,
//       password: hashedPassword
//     });

//     // Save the organization to the database
//     await newOrg.save();
//     await sendOrganizationRegistrationEmail(email, name, password);
//     res.status(201).json({ message: ORG_REGISTRATION_SUCCESS, success:true });
//   } catch (error) {
//     console.error("Error registering organization:", error);
//     res.status(500).json({ message: SERVER_ERROR, success:false });
//   }
// };


export const organizationRegister = async (req, res) => {
  const { name, address, website, contactPerson, email, mobile, approvalStatus, password } = req.body;

  // Validate the request body
  const { error } = organizationRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message, success: false });
  }

  try {
    // Check if the organization already exists
    const [existingOrgByName, existingOrgByEmail, existingOrgByMobile, existingOrgByWebsite] = await Promise.all([
      OrgRegistration.findOne({ name }),
      OrgRegistration.findOne({ email }),
      OrgRegistration.findOne({ mobile }),
      OrgRegistration.findOne({ website })
    ]);

    if (existingOrgByName) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_NAME, success: false });
    }
    if (existingOrgByEmail) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_EMAIL, success: false });
    }
    if (existingOrgByMobile) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_PHONE, success: false });
    }
    if (existingOrgByWebsite) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_WEBSITE, success: false });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new organization with 'not approved' status
    const newOrg = new OrgRegistration({
      name,
      address,
      website,
      contactPerson,
      email,
      mobile,
      approvalStatus: 'pending',
      status: 'not approved', // OTP verification status
      password: hashedPassword
    });

    // Save the organization to the database
    await newOrg.save();
    
    // Generate and send OTP
    await sendOtp(email);
    
    // Generate token for OTP verification
    const token = jwt.sign({ id: newOrg._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ 
      message: ORG_REGISTRATION_SUCCESS, 
      success: true,
      token,
      organization: {
        _id: newOrg._id,
        email: newOrg.email,
        name: newOrg.name
      }
    });
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ message: SERVER_ERROR, success: false });
  }
};

export const verifyOrganizationOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Find the OTP record
    const otpRecord = await OtpVerification.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP", success: false });
    }

    // Find and update the organization
    const organization = await OrgRegistration.findOneAndUpdate(
      { email },
      { status: 'approved' },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found", success: false });
    }

    // Delete the used OTP
    await OtpVerification.deleteOne({ email });

    res.status(200).json({ 
      message: "Organization verified successfully", 
      success: true,
      organization
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: SERVER_ERROR, success: false });
  }
};

export const resendOrganizationOtp = async (req, res) => {
  const { email } = req.body;

  try {
    await sendOtp(email);
    res.status(200).json({ message: "OTP resent successfully", success: true });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend OTP", success: false });
  }
};


// ORGANIZATION LOGIN CONTROLLER ----------------------------------------------------------


export const organizationLogin = async (req, res) => {
  const { email, mobile, password } = req.body;

  // Validate the request body using Joi
  const { error } = organizationLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      message: error.details[0].message,
      errorType: 'VALIDATION_ERROR'
    });
  }

  try {
    console.log("Login request received for:", { email, mobile });

    // Check if either email or mobile is provided
    if (!email && !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either email or mobile is required',
        errorType: 'CREDENTIALS_REQUIRED'
      });
    }

    // Check if the organization exists by email or mobile
    const existingOrg = await OrgRegistration.findOne({
      $or: [
        { email: email?.trim().toLowerCase() },
        { mobile: mobile?.trim() }
      ]
    });

    if (!existingOrg) {
      console.log("Organization not found for:", { email, mobile });
      return res.status(404).json({ 
        success: false, 
        message: ORG_NOT_FOUND,
        errorType: 'ORG_NOT_FOUND'
      });
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, existingOrg.password);
    if (!isPasswordValid) {
      console.log("Password comparison failed for:", { email, mobile });
      return res.status(401).json({ 
        success: false, 
        message: ORG_LOGIN_INVALID_CREDENTIALS,
        errorType: 'INVALID_CREDENTIALS'
      });
    }

    // Check approval status
    if (existingOrg.approvalStatus === "pending") {
      return res.status(403).json({ 
        success: false, 
        message: ORG_LOGIN_PENDING_APPROVAL,
        errorType: 'PENDING_APPROVAL'
      });
    } else if (existingOrg.approvalStatus === "rejected") {
      return res.status(403).json({ 
        success: false, 
        message: ORG_LOGIN_REJECTED,
        errorType: 'REJECTED'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { orgId: existingOrg._id, orgName: existingOrg.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Login successful
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      orgName: existingOrg.name,
      orgId: existingOrg._id,
      org: existingOrg,
      role:"organization"
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false, 
      message: SERVER_ERROR,
      error: error.message,
      errorType: 'SERVER_ERROR'
    });
  }
};


//Organization Change Password
export const changeOrganizationPassword = async (req, res) => {
  try {
    console.log("🔹 Received password change request for organization:", req.body);

    // ✅ Validate input
    const { error } = changePasswordSchema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log(" Joi Validation Error:", error.details);
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    const { oldPassword, newPassword } = req.body;
    const orgId = req.organization._id; // Extract orgId from JWT

    console.log(" Extracted Organization ID from JWT:", orgId);

    const organization = await OrgRegistration.findById(orgId);
    if (!organization) {
      console.log(" Organization not found");
      return res.status(404).json({ message: "Organization not found" });
    }

    console.log(" Organization found:", organization.email);

    // 🔹 Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, organization.password);
    if (!isMatch) {
      console.log(" Old password is incorrect");
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    // 🔹 Prevent changing to the same password
    if (oldPassword === newPassword) {
      console.log("New password must be different");
      return res.status(400).json({ message: "New password must be different from the old password" });
    }

    // 🔹 Hash and update the new password
    console.log("🔹 Hashing new password...");
    const salt = await bcrypt.genSalt(10);
    organization.password = await bcrypt.hash(newPassword, salt);
    await organization.save();

    console.log("✅ Organization password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(" Error in changeOrganizationPassword controller:", error);
    res.status(500).json({ message: "Password change failed", error: error.message });
  }
};



//Organization forgot password

export const organizationForgotPassword = async (req, res) => {
  try {
     console.log("Forgot Password Request Received:", req.body);
    const { email } = req.body;

    const organization = await OrgRegistration.findOne({ email });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Generate Reset Token (Valid for 15 minutes)
    const token = jwt.sign({ id: organization._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    // Reset Link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&role=organization`;
    console.log("Generated Reset Token:", token);
    console.log("Reset Link:", resetLink);

    // Send Reset Email
    const subject = "Password Reset Request";
    const message = "Click the button below to reset your password. This link expires in 15 minutes.";
    
    await sendEmail(email, subject, message, "Reset Password", resetLink, false);

    res.status(200).json({ message: "Password reset link sent to your email" });

  } catch (error) {
    console.error("Error in organizationForgotPassword:", error);
    res.status(500).json({ message: "Error sending email", error: error.message });
  }
};

// organization ResetPaasword 
export const organizationResetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;
     
    const { error } = passwordValidationSchema.validate({ newPassword, confirmPassword });
        if (error) {
          return res.status(400).json({ message: error.details[0].message });
        }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
      }
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const organization = await OrgRegistration.findById(decoded.id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Hash New Password
    const salt = await bcrypt.genSalt(10);
    organization.password = await bcrypt.hash(newPassword, salt);

    await organization.save();
    res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    console.error("Error in organizationResetPassword:", error);
    res.status(500).json({ message: "Error resetting password", error: error.message });
  }
};



// // Get Organization by Name

import cloudinary from '../../helpers/cloudinary.js';
import OtpVerification from '../../models/OtpVerification.js';

// GET organization by ID
// ORGANIZATION FETCHED ID CONTROLLER ----------------------------------------------------------
export const getOrganizationById = async (req, res) => {
  const { orgId } = req.query; // Use orgId instead of orgName

  if (!orgId) {
    return res.status(400).json({ success: false, message: ORG_ID_REQUIRED });
  }

  try {
    // Fetch the organization by ID and exclude the password field
    const org = await OrgRegistration.findById(orgId).select('-password');
    if (!org) {
      return res.status(404).json({ success: false, message: ORG_NOT_FOUND });
    }

    console.log("Organization Data:", org); // Log the organization data
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: SERVER_ERROR, success:false });
  }
};


// new photo remove

// ORGANIZATION UPDATE ID CONTROLLER ----------------------------------------------------------
export const updateOrganizationById = async (req, res) => {
  const { orgId } = req.query; // Use orgId instead of orgName
  const updateData = req.body; // Data to update

  if (!orgId) {
    return res.status(400).json({ success: false, message: ORG_ID_REQUIRED });
  }

  try {
    // Log the update data for debugging
    console.log("Update Data:", updateData);
    // Handle photo upload to Cloudinary
    if (updateData.photo && updateData.photo.startsWith('data:image')) {
      // Delete the old photo from Cloudinary if it exists
      const org = await OrgRegistration.findById(orgId);
      if (org.photo && org.photo !== "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
        const publicId = org.photo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`organization_photos/${publicId}`);
      }

      // Upload the new photo to Cloudinary
      const result = await cloudinary.uploader.upload(updateData.photo, {
        folder: 'organization_photos',
      });
      updateData.photo = result.secure_url;
    }

    // Handle photo removal
    if (updateData.photo === "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
      const org = await OrgRegistration.findById(orgId);
      if (org.photo && org.photo !== "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png") {
        const publicId = org.photo.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`organization_photos/${publicId}`);
      }
      updateData.photo = "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png";
    }

    // Find the organization by ID and update it
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(
      orgId, // Query by ID
      { $set: updateData }, // Use $set to update only the specified fields
      { new: true, runValidators: true } // Return the updated document and run validators
    ).select('-password'); // Exclude the password field from the response

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: ORG_NOT_FOUND });
    }

    // Log the updated organization for debugging
    console.log("Updated Organization:", updatedOrg);

    res.status(200).json({ success: true, data: updatedOrg });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ message: SERVER_ERROR, success:false  });
  }
};


//Admin


// Get all organizations
// controllers/organization/organizationController.js


// Get all organizations
export const getAllOrgs = async (req, res) => {
  try {
    const organizations = await OrgRegistration.find({ isDeleted: false })
      .select('-password')
      .lean();

    return res.status(200).json({
      success: true,
      data: organizations,
      count: organizations.length,
      message: 'Organizations fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch organizations',
      error: error.message 
    });
  }
};

// Get organization by ID
export const getOrgById = async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID format'
      });
    }

    const organization = await OrgRegistration.findOne({
      _id: orgId,
      isDeleted: false
    }).select('-password');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: organization,
      message: 'Organization fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch organization',
      error: error.message
    });
  }
};

// Update organization
export const updateOrg = async (req, res) => {
  try {
    const { orgId } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid organization ID format'
      });
    }

    // Remove sensitive fields
    delete updateData.password;
    delete updateData._id;

    const organization = await OrgRegistration.findOneAndUpdate(
      { _id: orgId, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: organization,
      message: 'Organization updated successfully'
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update organization',
      error: error.message
    });
  }
};

// controllers/organization/organizationController.js
// controllers/organization/organizationController.js
export const deleteOrg = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const deletedOrg = await OrgRegistration.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Organization deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete organization',
      error: error.message
    });
  }
};

// controllers/organization/organizationController.js
export const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID is required'
      });
    }

    const updatedOrg = await OrgRegistration.findByIdAndUpdate(
      id,
      { approvalStatus: status },
      { new: true }
    );

    if (!updatedOrg) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Return properly formatted response
    return res.status(200).json({
      success: true,
      data: updatedOrg,
      message: `Organization status updated to ${status}`,
      id: id,
      status: status
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update organization status'
    });
  }
};




// Admin
export const getUserByOrgName = async (req, res) => {
  try {
    // Validate request params
    const { error } = getUserByOrgNameValidation.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const orgName = req.params.orgName;
    const user = await UserModal.find({ addedby: orgName, isDeleted: false });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching students by organization:', error);
    res.status(500).json({ error: SERVER_ERROR });
  }
};


//Guest User: Searching and fetching Approved Non Deleted Organizations (for GuestUsers)
export const searchOrganizations = async (req, res) => {
  try {
    const { search } = req.params; // Get the search parameter from the request

    let query = { isDeleted: false , approvalStatus: 'approved' };

    if (search && search.trim() !== "" && search!=="all") {
      query.$or = [
        { name: { $regex: search, $options: "i" } }, // Case-insensitive search by name
        { address: { $regex: search, $options: "i" } }, // Case-insensitive search by address
      ];
      // // If search is a valid date, add createdAt filter
      // const date = new Date(search);
      // if (!isNaN(date)) {
      //   query.$or.push({ createdAt: { $gte: date } });
      // }
    }
    const orgs = await OrgRegistration.find(query);
    res.status(200).json({ success: true, data: orgs });
  } 
  catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

export const allOrganizations = async (req, res) => {
  try {
    let query = { isDeleted: false };
    const orgs = await OrgRegistration.find(query);
    res.status(200).json({ success: true, data: orgs });
  } 
  catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};






  



// orgainzation stats for admin cards controllers

export const totalOrganizations = async (req, res) => {

  try {
    const count = await OrgRegistration.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total organization count fetched succesffully"  });
  }
};