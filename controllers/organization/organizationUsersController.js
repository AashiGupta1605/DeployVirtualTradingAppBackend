// organization user crud operations:

import UserModal from '../../models/UserModal.js';
import { organizationUserRegistrationValidationSchema } from '../../helpers/joiValidation.js';
import { sendRegistrationEmail } from '../../helpers/emailService.js';
import crypto from 'crypto';
import { hashPassword } from '../../helpers/hashHelper.js';
import {buildDateQuery, buildSearchQuery, buildGenderQuery} from "../../helpers/dataHandler.js";
import moment from "moment";

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


export const organizationUserRegistration = async (req, res) => {
  const { error } = organizationUserRegistrationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, addedby, status } = req.body;

  try {
    // Check if the user already exists
    let user = await UserModal.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, msg: 'User already exists' });
    }

    // Generate a unique password
    const password = `${name}${crypto.randomBytes(3).toString('hex')}`;

    // Create a new user
    user = new UserModal({
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

    await user.save();

    // Send registration email
    await sendRegistrationEmail(email, name, password);

    res.status(201).json({ msg: 'User registered successfully. An email has been sent with login details.' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: 'Server error' });
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
    res.status(500).json({ error: SERVER_ERROR });
  }
};

// Get a user by ID
export const organizationgetUserDisplayById = async (req, res) => {
  try {
    const user = await UserModal.findById(req.params.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ msg: USER_NOT_FOUND });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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

    // if (password) {
    //   user.password = await hashPassword(password);
    // }


    user.updatedDate = Date.now();

    await user.save();

    res.status(200).json({ success: true, msg: USER_UPDATED_SUCCESS });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(500).json({ success: false, msg: SERVER_ERROR });
  }
};




// organization users count for each like totol user count, male user, etc - statistics

// Function to get the total number of users for a specific organization
export const organizationTotalUsers = async (req, res) => {
  const orgName = req.params.orgName;

  try {
    const count = await UserModal.countDocuments({ isDeleted: false, addedby: orgName });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(200).json({ success: true, count: newUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(200).json({ success: true, count: activeUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(200).json({ success: true, count: deactiveUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
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
    res.status(200).json({ success: true, averageAge: averageAge.toFixed(2) });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR });
  }
};

