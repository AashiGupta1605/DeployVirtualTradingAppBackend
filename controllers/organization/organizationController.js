// organization crud opeartion such as registration login -----------------

import OrgRegistration from '../../models/OrgRegisterModal.js';
import { organizationRegistrationValidationSchema, organizationLoginValidationSchema, updateOrgValidation, updateApprovalStatusValidation, getUserByOrgNameValidation} from '../../helpers/joiValidation.js';
import { hashPassword, comparePassword } from '../../helpers/hashHelper.js';
import {buildDateQuery, buildSearchQuery, buildGenderQuery} from "../../helpers/dataHandler.js";
import moment from "moment";
import jwt from 'jsonwebtoken';


import {
  ORG_REGISTRATION_SUCCESS,
  ORG_ALREADY_EXISTS,
  ORG_LOGIN_SUCCESS,
  ORG_LOGIN_INVALID_CREDENTIALS,
  ORG_LOGIN_PENDING_APPROVAL,
  ORG_LOGIN_REJECTED,
  ORG_NOT_FOUND,
  ORG_UPDATED_SUCCESS,
  ORG_SOFT_DELETED_SUCCESS,
  ORG_APPROVAL_STATUS_UPDATED,
  USER_REGISTRATION_SUCCESS,
  USER_ALREADY_EXISTS,
  USER_NOT_FOUND,
  USER_UPDATED_SUCCESS,
  USER_SOFT_DELETED_SUCCESS,
  SERVER_ERROR,
  TOTAL_USERS_FETCHED,
  NEW_USERS_LAST_WEEK_FETCHED,
  MALE_USERS_FETCHED,
  FEMALE_USERS_FETCHED,
  ACTIVE_USERS_FETCHED,
  DEACTIVE_USERS_FETCHED,
  AVERAGE_USER_AGE_FETCHED,
  ORG_USERS_FETCHED,
} from '../../helpers/messages.js';


export const organizationRegister = async (req, res) => {
  const { name, address, website, contactPerson, email, mobile, approvalStatus, password } = req.body;

  // Validate the request body
  const { error } = organizationRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the organization already exists
    const existingOrg = await OrgRegistration.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({ message:ORG_ALREADY_EXISTS });
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
      approvalStatus,
      password: hashedPassword
    });

    // Save the organization to the database
    await newOrg.save();

    res.status(201).json({ message: ORG_REGISTRATION_SUCCESS });
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ message: SERVER_ERROR });
  }
};


// login

// export const organizationLogin = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate the request body
//   const { error } = organizationLoginValidationSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ success: false, message: error.details[0].message });
//   }

//   try {
//     // Check if the organization exists
//     const existingOrg = await OrgRegistration.findOne({ email });
//     if (!existingOrg) {
//       return res.status(400).json({ success: false, message:  ORG_LOGIN_INVALID_CREDENTIALS });
//     }

//     // Compare the password
//     const isPasswordValid = await comparePassword(password, existingOrg.password);
//     if (!isPasswordValid) {
//       return res.status(400).json({ success: false, message:  ORG_LOGIN_INVALID_CREDENTIALS });
//     }

//     // Check approval status
//     if (existingOrg.approvalStatus === "pending") {
//       return res.status(400).json({ success: false, message: ORG_LOGIN_PENDING_APPROVAL });
//     } else if (existingOrg.approvalStatus === "rejected") {
//       return res.status(400).json({ success: false, message: ORG_LOGIN_REJECTED });
//     }

//     // Login successful
//     res.status(200).json({ success: true, message: ORG_LOGIN_SUCCESS, orgName: existingOrg.name });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ success: false, message: SERVER_ERROR });
//   }
// };



// update org login controller included jwt and mobile number


export const organizationLogin = async (req, res) => {
  const { email, mobile, password } = req.body;

  // Validate the request body using Joi
  const { error } = organizationLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    // Check if the organization exists by email or mobile
    const existingOrg = await OrgRegistration.findOne({
      $or: [{ email }, { mobile }]
    });

    if (!existingOrg) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, existingOrg.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check approval status
    if (existingOrg.approvalStatus === "pending") {
      return res.status(400).json({ success: false, message: 'Your account is pending approval' });
    } else if (existingOrg.approvalStatus === "rejected") {
      return res.status(400).json({ success: false, message: 'Your account has been rejected' });
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
      orgName: existingOrg.name
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




export const getOrganizationByName = async (req, res) => {
  const { orgName } = req.query; // Use req.query for GET request
  // OR
  // const { orgName } = req.body; // Use req.body for POST request

  if (!orgName) {
    return res.status(400).json({ success: false, message: 'Organization name is required' });
  }

  try {
    // Fetch the organization by name
    const org = await OrgRegistration.findOne({ name: orgName }).select('-password'); // Exclude the password field
    if (!org) {
      return res.status(404).json({ success: false, message: 'Organization not found' });
    }

    console.log("Organization Data:", org); // Log the organization data
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

//Commented by -- Aashi, give error --------------start--------------------------------
// Update organization by name
// export const updateOrganizationByName = async (req, res) => {
//   const { orgName } = req.query; // Use req.query to get orgName
//   const updateData = req.body; // Data to update

//   if (!orgName) {
//     return res.status(400).json({ message: 'Organization name is required' });
//   }

//   try {
//     // Log the update data for debugging
//     console.log("Update Data:", updateData);

//     // Find the organization by name and update it
//     const updatedOrg = await OrgRegistration.findOneAndUpdate(
//       { name: orgName }, // Query by name
//       { $set: updateData }, // Use $set to update only the specified fields
//       { new: true, runValidators: true } // Return the updated document and run validators
//     );

//     if (!updatedOrg) {
//       return res.status(404).json({ message: 'Organization not found' });
//     }

//     // Log the updated organization for debugging
//     console.log("Updated Organization:", updatedOrg);
//-----------------------end---------------------------------------------------------


//on the place of above, correct code (Aashi) is ---------------start-------------------------
export const updateOrganizationByName = async (req, res) => {
  const { orgName } = req.query; // Use req.query to get orgName
  const updateData = req.body; // Data to update

  if (!orgName) {
    return res.status(400).json({ message: "Organization name is required" });
  }

  try {
    // Log the update data for debugging
    console.log("Update Data:", updateData);

    // Find the organization by name and update it
    const updatedOrg = await OrgRegistration.findOneAndUpdate(
      { name: orgName }, // Query by name
      { $set: updateData }, // Use $set to update only the specified fields
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Log the updated organization for debugging
    console.log("Updated Organization:", updatedOrg);

    return res.status(200).json({ message: "Organization updated successfully", updatedOrg });
  } catch (error) {
    console.error("Error updating organization:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
//---------------------------------end---------------------------------------------------------


export const getOrganizationById = async (req, res) => {
  const { orgId } = req.params;

  try {
    const org = await OrgRegistration.findById(orgId);
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }
    res.status(200).json(org);
  } catch (error) {
    console.error("Error fetching organization:", error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateOrganization = async (req, res) => {
  const { orgId } = req.params;
  const updateData = req.body;

  try {
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(orgId, updateData, { new: true });
    if (!updatedOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.status(200).json(updatedOrg);
  } catch (error) {
    console.error("Error updating organization:", error);
    res.status(500).json({ message: 'Server error' });
  }
};




//Admin


// Get all organizations
// controllers/organization/organizationController.js


// import mongoose from 'mongoose';


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


//Guest User: Searching on fetching Organizations
export const searchOrganizations = async (req, res) => {
  try {
    const { search } = req.params; // Get the search parameter from the request

    let query = { isDeleted: false };

    if (search && search.trim() !== "") {
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
    res.status(200).json(orgs);
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};
