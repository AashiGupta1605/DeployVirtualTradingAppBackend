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

//Admin
export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await OrgRegistration.find({ isDeleted: false }); // ✅ Filter by isDeleted: false
    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getOrgById = async (req, res) => {
  try {
    const org = await OrgRegistration.findById(req.params.id);
    if (!org) return res.status(404).json({ message: ORG_NOT_FOUND });
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrg = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateOrgValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Prepare update data
    const updateData = { ...req.body };
    
    // Remove system-generated and sensitive fields
    const fieldsToRemove = ['_id', 'password', 'createDate', 'updateDate', '__v'];
    fieldsToRemove.forEach(field => delete updateData[field]);

    // Ensure only defined fields are updated
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, v]) => v !== undefined)
    );

    // Update organization
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(
      req.params.id, 
      filteredUpdateData, 
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validations
      }
    );

    if (!updatedOrg) {
      return res.status(404).json({ message: ORG_NOT_FOUND });
    }

    res.status(200).json({ 
      message: ORG_UPDATED_SUCCESS, 
      data: updatedOrg 
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ 
      message: 'Error updating organization', 
      error: error.message 
    });
  }
};

export const deleteOrg = async (req, res) => {
  try {
    // Validate the ID
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Invalid organization ID' });
    }

    // Soft delete the organization
    const deletedOrg = await OrgRegistration.findByIdAndUpdate(
      id,
      { 
        isDeleted: true,
        updatedDate: Date.now() 
      },
      { 
        new: true,  // Return the updated document
        runValidators: true  // Run model validations
      }
    );

    if (!deletedOrg) {
      return res.status(404).json({ message: ORG_NOT_FOUND });
    }

    res.status(200).json({ 
      message: ORG_SOFT_DELETED_SUCCESS,
      data: deletedOrg 
    });
  } catch (error) {
    console.error('Delete organization error:', error);
    res.status(500).json({ 
      message: 'Error deleting organization', 
      error: error.message 
    });
  }
};


export const updateApprovalStatus = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateApprovalStatusValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { status } = req.body;
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: ORG_NOT_FOUND });
    res.status(200).json(`{ message: Organization ${status}, data: updatedOrg }`);
  } catch (error) {
    res.status(500).json({ error: error.message });
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








