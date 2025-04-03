import { ORG_ACTIVE_USER_FETCHED_SUCCESS, ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS, ORG_DEACTIVE_USER_FETCHED_SUCCESS, ORG_FEMALE_USER_FETCHED_SUCCESS, ORG_MALE_USER_FETCHED_SUCCESS, ORG_NEW_USER_FETCHED_SUCCESS, ORG_TOTAL_USER_FETCHED_SUCCESS, SERVER_ERROR } from '../../helpers/messages.js';
import OrgRegister from '../../models/OrgRegisterModal.js';
import User from "../../models/UserModal.js";


// USER STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalUsers = async (req, res) => {

  try {
    const count = await User.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total user fetched succesffully"  });
  }
};


export const maleUsers = async (req, res) => {

  try {
    const maleUsersCount = await User.countDocuments({
      gender: "Male",
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: maleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching male users"  });
  }
};

export const femaleUsers = async (req, res) => {

  try {
    const femaleUsersCount = await User.countDocuments({
      gender: "Female",
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: femaleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"error in fetching female users"  });
  }
};


export const activeUsers = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({
      status: true,
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: activeUsersCount, msg:"fetched active user successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg });
  }
};

export const deactiveUsers = async (req, res) => {

  try {
    const deactiveUsersCount = await User.countDocuments({
      status: false,
      isDeleted: false,
    });
    res.status(200).json({ success: true, count: deactiveUsersCount, msg:"fetched inactive user successfully" }  );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const averageUserAge = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false }, 'dob');
    const totalAge = users.reduce((sum, user) => {
      const age = moment().diff(user.dob, 'years');
      return sum + age;
    }, 0);
    const averageAge = totalAge / users.length;
    res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:"average age fetch succesfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg });
  }
};










// ORGANIZATION STATS FOR ADMIN CARDS DASHBOARD ---------------------------------------------------


export const totalOrganizations = async (req, res) => {

  try {
    const count = await OrgRegister.countDocuments({ isDeleted: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: "server error", error:error.msg, msg:"total organization count fetched succesffully"  });
  }
};


export const organizationTotalUsers = async (req, res) => {
    try {
      // Count users that are not deleted and were added by organizations (not self-registered)
      const count = await User.countDocuments({ 
        isDeleted: false,
        addedby: { $ne: "self" } // $ne means "not equal"
      });
      
      res.status(200).json({ 
        success: true, 
        count,
        msg: "Total organization-registered users count fetched successfully" 
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ 
        success: false, 
        msg: "Server error while fetching organization-registered users count",
        error: error.message 
      });
    }
  };



export const organizationMaleUsers = async (req, res) => {

  try {
    const maleUsersCount = await User.countDocuments({
      gender: "Male",
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: maleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_MALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationFemaleUsers = async (req, res) => {

  try {
    const femaleUsersCount = await User.countDocuments({
      gender: "Female",
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: femaleUsersCount });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_FEMALE_USER_FETCHED_SUCCESS  });
  }
};

export const organizationActiveUsers = async (req, res) => {
  try {
    const activeUsersCount = await User.countDocuments({
      status: true,
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: activeUsersCount, msg:ORG_ACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationDeactiveUsers = async (req, res) => {

  try {
    const deactiveUsersCount = await User.countDocuments({
      status: false,
      isDeleted: false,
      addedby: { $ne: "self" } // $ne means "not equal"
    });
    res.status(200).json({ success: true, count: deactiveUsersCount, msg:ORG_DEACTIVE_USER_FETCHED_SUCCESS  });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
  }
};

export const organizationAverageUserAge = async (req, res) => {

  try {
    const users = await User.find({ isDeleted: false,  addedby: { $ne: "self" }   }, 'dob');
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
