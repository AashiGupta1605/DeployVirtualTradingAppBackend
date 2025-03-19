// organization crud opeartion such as registration login -----------------

import OrgRegistration from '../../models/OrgRegisterModal.js';
import { organizationRegistrationValidationSchema, organizationLoginValidationSchema, getUserByOrgNameValidation} from '../../helpers/joiValidation.js';
import { hashPassword, comparePassword } from '../../helpers/hashHelper.js';
import jwt from 'jsonwebtoken';
import { sendOrganizationRegistrationEmail } from '../../helpers/emailService.js';
import mongoose from 'mongoose';
import cloudinary from '../../helpers/cloudinary.js';

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


// register
export const organizationRegister = async (req, res) => {
  const { name, address, website, contactPerson, email, mobile, approvalStatus, password, accreditation } = req.body;

  // Validate the request body
  const { error } = organizationRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingOrgByName = await OrgRegistration.findOne({ name });
    const existingOrgByEmail = await OrgRegistration.findOne({ email });
    const existingOrgByMobile = await OrgRegistration.findOne({ mobile });
    const existingOrgByWebsite = await OrgRegistration.findOne({ website });

    if (existingOrgByName) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_NAME, success:false });
    }

    if (existingOrgByEmail) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_EMAIL, success:false });
    }

    if (existingOrgByMobile) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_PHONE, success:false });
    }

    if (existingOrgByWebsite) {
      return res.status(400).json({ message: ORG_ALREADY_EXISTS_WEBSITE, success:false });
    }


    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new organization
    const newOrg = new OrgRegistration({
      name,
      address,
      website,
      contactPerson,
      email,
      mobile,
      accreditation,
      approvalStatus,
      password: hashedPassword
    });

    // Save the organization to the database
    await newOrg.save();
    await sendOrganizationRegistrationEmail(email, name, password);
    res.status(201).json({ message: ORG_REGISTRATION_SUCCESS, success:true });
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ message: SERVER_ERROR, success:false, error:error.message });
  }
};


// login
export const organizationLogin = async (req, res) => {
  const { email, mobile, password } = req.body;

  // Validate the request body using Joi
  const { error } = organizationLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    console.log("Login request received for:", { email, mobile });

    // Check if the organization exists by email or mobile
    const existingOrg = await OrgRegistration.findOne({
      $or: [
        { email: email?.trim().toLowerCase() }, // Case-insensitive email match
        { mobile: mobile?.trim() } // Optional: Trim mobile if provided
      ]
    });

    if (!existingOrg) {
      console.log("Organization not found for:", { email, mobile });
      return res.status(400).json({ success: false, message: ORG_NOT_FOUND });
    }

    console.log("Organization found:", existingOrg);

    // Compare the password
    const isPasswordValid = await comparePassword(password, existingOrg.password);
    if (!isPasswordValid) {
      console.log("Password comparison failed for:", { email, mobile });
      return res.status(400).json({ success: false, message: ORG_LOGIN_INVALID_CREDENTIALS });
    }

    console.log("Password comparison successful for:", { email, mobile });

    // Check approval status
    if (existingOrg.approvalStatus === "pending") {
      console.log("Organization approval status is pending for:", { email, mobile });
      return res.status(400).json({ success: false, message:  ORG_LOGIN_PENDING_APPROVAL });
    } else if (existingOrg.approvalStatus === "rejected") {
      console.log("Organization approval status is rejected for:", { email, mobile });
      return res.status(400).json({ success: false, message: ORG_LOGIN_REJECTED });
    }

    console.log("Organization approval status is approved for:", { email, mobile });

    // Generate JWT token
    const token = jwt.sign(
      { orgId: existingOrg._id, orgName: existingOrg.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("Login successful for:", { email, mobile });

    // Login successful
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      orgName: existingOrg.name,
      orgId: existingOrg._id,
      org: existingOrg
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: SERVER_ERROR, error:error.message  });
  }
};





import bcrypt from 'bcryptjs';

// // Get Organization by Name
export const getOrganizationByName = async (req, res) => {
  const { orgName } = req.query; // Use req.query for GET request

  if (!orgName) {
    return res.status(400).json({ success: false, message: ORG_NAME_REQUIRED });
  }

  try {
    // Fetch the organization by name and exclude the password field
    const org = await OrgRegistration.findOne({ name: orgName }).select('-password');
    if (!org) {
      return res.status(404).json({ success: false, message: ORG_NOT_FOUND });
    }

    console.log("Organization Data:", org); // Log the organization data
    res.status(200).json({ success: true, data: org, message:ORG_GET_DATA_SUCCESS});
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, message: SERVER_ERROR, error:error.message  });
  }
};

// Update Organization by Name
export const updateOrganizationByName = async (req, res) => {
  const { orgName } = req.query; // Use req.query to get orgName
  const updateData = req.body; // Data to update

  if (!orgName) {
    return res.status(400).json({ success: false, message: ORG_NAME_REQUIRED });
  }

  try {
    // Log the update data for debugging
    console.log("Update Data:", updateData);

    // If the update includes a password, hash it before saving
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Find the organization by name and update it
    const updatedOrg = await OrgRegistration.findOneAndUpdate(
      { name: orgName }, // Query by name
      { $set: updateData }, // Use $set to update only the specified fields
      { new: true, runValidators: true } // Return the updated document and run validators
    ).select('-password'); // Exclude the password field from the response

    if (!updatedOrg) {
      return res.status(404).json({ success: false, message: ORG_NOT_FOUND });
    }

    // Log the updated organization for debugging
    console.log("Updated Organization:", updatedOrg);

    res.status(200).json({ success: true, data: updatedOrg, message:ORG_PROFILE_UPDATED_SUCCESS});
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ success: false, message: SERVER_ERROR, error:error.message  });
  }
};
  


// Get Organization by ID

// GET organization by ID
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
    res.status(200).json({ success: true, data: org, message:ORG_GET_DATA_SUCCESS});
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, message: SERVER_ERROR, error:error.message  });
  }
};


// new photo remove

export const updateOrganizationById = async (req, res) => {
  const { orgId } = req.query; // Use orgId instead of orgName
  const updateData = req.body; // Data to update

  if (!orgId) {
    return res.status(400).json({ success: false, message: ORG_ID_REQUIRED });
  }

  try {
    // Log the update data for debugging
    console.log("Update Data:", updateData);

    // If the update includes a password, hash it before saving
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

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

    res.status(200).json({ success: true, data: updatedOrg, message:ORG_PROFILE_UPDATED_SUCCESS });
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ success: false, message: SERVER_ERROR, error:error.message  });
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






  



