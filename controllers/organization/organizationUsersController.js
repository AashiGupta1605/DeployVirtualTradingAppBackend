// ORGANIZATION USER CRUD CONTROLLERS FUNCTIONS===============================================================

import UserModal from '../../models/UserModal.js';
import { organizationUserRegistrationValidationSchema } from '../../helpers/joiValidation.js';
import { sendRegistrationEmail } from '../../helpers/emailService.js';
import crypto from 'crypto';
import { hashPassword } from '../../helpers/hashHelper.js';
import {buildDateQuery, buildSearchQuery, buildGenderQuery} from "../../helpers/dataHandler.js";
import moment from "moment";

import {
  USER_REGISTRATION_SUCCESS,
  ORG_TOTAL_USER_FETCHED_SUCCESS,
  ORG_MALE_USER_FETCHED_SUCCESS,
  ORG_FEMALE_USER_FETCHED_SUCCESS,
  ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS,
  ORG_ACTIVE_USER_FETCHED_SUCCESS,
  ORG_DEACTIVE_USER_FETCHED_SUCCESS,
  ORG_NEW_USER_FETCHED_SUCCESS,
  USER_NOT_FOUND,
  USER_UPDATED_SUCCESS,
  USER_SOFT_DELETED_SUCCESS,
  SERVER_ERROR,
  USER_ALREADY_EXIST_EMAIL,
  USER_ALREADY_EXIST_PHONE,
} from '../../helpers/messages.js';


export const organizationUserRegistration = async (req, res) => {
  // Validate the request body
  const { error } = organizationUserRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, addedby, status } = req.body;

  try {
    // Check if the user already exists by email or mobile
    const existingUserByEmail = await UserModal.findOne({ email });
    const existingUserByMobile = await UserModal.findOne({ mobile });

    if (existingUserByEmail) {
      return res.status(400).json({ success: false, msg: USER_ALREADY_EXIST_EMAIL });
    }

    if (existingUserByMobile) {
      return res.status(400).json({ success: false, msg: USER_ALREADY_EXIST_PHONE });
    }

    // Generate a unique password
    const password = `${name}${crypto.randomBytes(3).toString('hex')}`;

    // Create a new user
    const user = new UserModal({
      name,
      email,
      mobile,
      gender,
      dob,
      password,
      addedby,
      status,
    });

    // Hash the password
    user.password = await hashPassword(password);

    // Save the user to the database
    await user.save();

    // Send registration email
    await sendRegistrationEmail(email, name, password);

    res.status(201).json({ success: true, msg: USER_REGISTRATION_SUCCESS });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};



export const organizationUsersDisplay = async (req, res) => {
  try {
    const orgName = req.params.orgName;
    const { page = 1, limit = 10, search = '', startDate, endDate, gender } = req.query;

    const searchQuery = buildSearchQuery(search);
    const dateQuery = buildDateQuery(startDate, endDate);
    const genderQuery = buildGenderQuery(gender);

    console.log("Gender Query:", genderQuery); // Debugging: Log the gender query

    const users = await UserModal.find({
      addedby: orgName,
      isDeleted: false,
      ...searchQuery,
      ...dateQuery,
      ...genderQuery,
    })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalUsers = await UserModal.countDocuments({
      addedby: orgName,
      isDeleted: false,
      ...searchQuery,
      ...dateQuery,
      ...genderQuery,
    });

    res.status(200).json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching users by organization:', error);
    res.status(500).json({ msg: SERVER_ERROR, error:error.msg, success:false });
  }
};

// Get a user by ID
export const organizationgetUserDisplayById = async (req, res) => {
  try {
    const user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: USER_NOT_FOUND, success:false });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationUpdateUser = async (req, res) => {
  const { _id, isDeleted, createdDate, updatedDate, password, __v, ...updateData } = req.body; // Exclude _id, isDeleted, and other non-updatable fields, also confirmPassword
  const { error } = organizationUserRegistrationValidationSchema.validate(updateData);
  if (error) {
    return res.json({ success: false, msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, addedby, status } = updateData;

  try {
    let user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.json({ success: false, msg: USER_NOT_FOUND });
    }

    // Update student details
    user.name = name;
    user.email = email;
    user.mobile = mobile;
    user.gender = gender;
    user.dob = dob;
    user.addedby = addedby;
    user.status = status;

    user.updatedDate = Date.now();

    await user.save();

    res.status(200).json({ success: true, msg: USER_UPDATED_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};



// Soft delete a student
export const organizationUserDelete = async (req, res) => {
  try {
    let user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.json({ success: false, msg: USER_NOT_FOUND });
    }

    // Soft delete the user
    user.isDeleted = true;
    user.updatedDate = Date.now();

    await user.save();

    res.status(200).json({ success: true, msg: USER_SOFT_DELETED_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};




// ORGANIZATION STATS CARDS CONTROLLER FUNCTIONS =====================================================================

// Function to get the total number of users for a specific organization
export const organizationTotalUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const count = await UserModal.countDocuments({ isDeleted: false, addedby: orgName });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_TOTAL_USER_FETCHED_SUCCESS  });
  }
};

// Function to get the number of new users added in the last week for a specific organization
export const organizationNewUsersLastWeek = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const oneWeekAgo = moment().subtract(7, 'days').toDate();
    const newUsersCount = await UserModal.countDocuments({
      createdAt: { $gte: oneWeekAgo },
      isDeleted: false,
      addedby: orgName
    });
    res.status(200).json({ success: true, count: newUsersCount, msg:ORG_NEW_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationMaleUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const maleUsersCount = await UserModal.countDocuments({
      gender: "Male",
      isDeleted: false,
      addedby: orgName
    });
    res.status(200).json({ success: true, count: maleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_MALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationFemaleUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const femaleUsersCount = await UserModal.countDocuments({
      gender: "Female",
      isDeleted: false,
      addedby: orgName
    });
    res.status(200).json({ success: true, count: femaleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_FEMALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationActiveUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const activeUsersCount = await UserModal.countDocuments({
      status: true,
      isDeleted: false,
      addedby: orgName
    });
    res.status(200).json({ success: true, count: activeUsersCount, msg:ORG_ACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationDeactiveUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const deactiveUsersCount = await UserModal.countDocuments({
      status: false,
      isDeleted: false,
      addedby: orgName
    });
    res.status(200).json({ success: true, count: deactiveUsersCount, msg:ORG_DEACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationAverageUserAge = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const users = await UserModal.find({ isDeleted: false, addedby: orgName }, 'dob');
    const totalAge = users.reduce((sum, user) => {
      const age = moment().diff(user.dob, 'years');
      return sum + age;
    }, 0);
    const averageAge = totalAge / users.length;
    res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

