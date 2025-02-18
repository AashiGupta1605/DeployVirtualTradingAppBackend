import OrgRegistration from '../../models/OrgRegisterModal.js';
import { organizationRegistrationValidationSchema, organizationLoginValidationSchema } from '../../helpers/joiValidation.js';
import { hashPassword, comparePassword } from '../../helpers/hashHelper.js';
import moment from "moment";

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
      return res.status(400).json({ message: "Organization already exists" });
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

    res.status(201).json({ message: "Organization registered successfully!" });
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const organizationLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate the request body
  const { error } = organizationLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    // Check if the organization exists
    const existingOrg = await OrgRegistration.findOne({ email });
    if (!existingOrg) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the password
    const isPasswordValid = await comparePassword(password, existingOrg.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Check approval status
    if (existingOrg.approvalStatus === "pending") {
      return res.status(400).json({ success: false, message: "Your request is pending approval by the admin." });
    } else if (existingOrg.approvalStatus === "rejected") {
      return res.status(400).json({ success: false, message: "Your request has been rejected by the admin." });
    }

    // Login successful
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

//Admin
export const getAllOrgs = async (req, res) => {
  try {
    res.status(200).json(await OrgRegistration.find());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrgById = async (req, res) => {
  try {
    const org = await OrgRegistration.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrg = async (req, res) => {
  try {
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: "Organization updated", data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrg = async (req, res) => {
  try {
    const deletedOrg = await OrgRegistration.findByIdAndDelete(req.params.id);
    if (!deletedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid approval status" });
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: `Organization ${status}`, data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// import Student from "../../models/StudentModal.js";
import UserModal from '../../models/UserModal.js';
import { organizationUserRegistrationValidationSchema } from '../../helpers/joiValidation.js';

export const organizationUserRegistration = async (req, res) => {
  const { error } = organizationUserRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, password, confirmPassword, addedby, status } = req.body;

  try {
    // Check if the user already exists
    let user = await UserModal.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, msg: "User already exists" });
    }

    // Create a new student
    user = new UserModal({
      name,
      email,
      mobile,
      gender,
      dob,
      password,
      confirmPassword,
      addedby,
      status,
    });

    // Hash the password
    user.password = await hashPassword(password);

    await user.save();

    res.status(201).json({ msg: "user registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Get all students
export const organizationUsersDisplay = async (req, res) => {
  try {
    const users = await UserModal.find({ isDeleted: false });
    res.status(200).json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Get a student by ID
export const organizationgetUserDisplayById = async (req, res) => {
  try {
    const user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const organizationUpdateUser = async (req, res) => {
  const { _id, isDeleted, createdDate, updatedDate, __v, ...updateData } = req.body; // Exclude _id, isDeleted, and other non-updatable fields, also confirmPassword
  const { error } = organizationUserRegistrationValidationSchema.validate(updateData);
  if (error) {
    return res.json({ success: false, msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, password, confirmPassword, addedby, status } = updateData;

  try {
    let user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.json({ success: false, msg: "user not found" });
    }

    // Update student details
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.gender = gender;
    user.dob = dob;
    user.addedby = addedby;
    user.status = status;

    if (password) {
      user.password = await hashPassword(password);
    }
    
    if(confirmPassword){
      user.confirmPassword = await hashPassword(confirmPassword);
    }

    user.updatedDate = Date.now();

    await user.save();

    res.status(200).json({ success: true, msg: "user updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Soft delete a student
export const organizationUserDelete = async (req, res) => {
  try {
    let user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.json({ success: false, msg: "User not found" });
    }

    // Soft delete the user
    user.isDeleted = true;
    user.updatedDate = Date.now();

    await user.save();

    res.status(200).json({ success: true, msg: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const organizationTotalUsers = async (req, res) => {
  try {
    const count = await UserModal.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const organizationNewUsersLastWeek = async (req, res) => {
  try {
    const oneWeekAgo = moment().subtract(7, 'days').toDate();
    const newUsersCount = await UserModal.countDocuments({
      createdAt: { $gte: oneWeekAgo },
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: newUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};