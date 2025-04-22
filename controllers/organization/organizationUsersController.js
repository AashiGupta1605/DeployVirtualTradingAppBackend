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

// real one working

// export const organizationUpdateUser = async (req, res) => {
//   const { _id, isDeleted, createdDate, updatedDate, password, __v, ...updateData } = req.body; // Exclude _id, isDeleted, and other non-updatable fields, also confirmPassword
//   const { error } = organizationUserRegistrationValidationSchema.validate(updateData);
//   if (error) {
//     return res.json({ success: false, msg: error.details[0].message });
//   }

//   const { name, email, mobile, gender, dob, addedby, status } = updateData;

//   try {
//     let user = await UserModal.findById(req.params.id);
//     if (!user || user.isDeleted) {
//       return res.json({ success: false, msg: USER_NOT_FOUND });
//     }

//     // Update student details
//     user.name = name;
//     user.email = email;
//     user.mobile = mobile;
//     user.gender = gender;
//     user.dob = dob;
//     user.addedby = addedby;
//     user.status = status;

//     user.updatedDate = Date.now();

//     await user.save();

//     res.status(200).json({ success: true, msg: USER_UPDATED_SUCCESS });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };



// export const organizationUpdateUser = async (req, res) => {
//   // Exclude fields not meant for update AND 'status' as it's not handled by this form
//   const { _id, isDeleted, createdDate, updatedDate, password, __v, userPhoto, status, organizationId, orgtype, ...updateData } = req.body;

//   // Validate ONLY the fields coming from the form against the schema
//   const { error } = organizationUserRegistrationValidationSchema.validate(updateData, { abortEarly: false }); // Show all errors
//   if (error) {
//     // Return a user-friendly validation error message
//     const errorMessages = error.details.map(detail => detail.message).join(', ');
//     return res.status(400).json({ success: false, msg: `Validation Error: ${errorMessages}` });
//   }

//   // Extract only the validated and allowed fields from updateData
//   // DO NOT extract 'status' here
//   const { name, email, mobile, gender, dob, addedby } = updateData;

//   try {
//     let user = await UserModal.findById(req.params.id);
//     if (!user || user.isDeleted) {
//       return res.status(404).json({ success: false, msg: USER_NOT_FOUND });
//     }

//     // --- Duplicate Checks ---
//     // Check if email is being changed and if the new email already exists for another user
//     if (email && email.toLowerCase() !== user.email.toLowerCase()) {
//         const existingEmailUser = await UserModal.findOne({
//             email: email.toLowerCase(),
//             _id: { $ne: user._id }, // Exclude the current user
//             isDeleted: false
//         });
//         if (existingEmailUser) {
//             return res.status(400).json({ success: false, msg: EMAIL_EXISTS });
//         }
//         user.email = email.toLowerCase(); // Update email if valid and changed
//     }

//     // Check if mobile is being changed and if the new mobile already exists for another user
//     if (mobile && mobile !== user.mobile) {
//         const existingMobileUser = await UserModal.findOne({
//             mobile: mobile,
//              _id: { $ne: user._id }, // Exclude the current user
//              isDeleted: false
//          });
//         if (existingMobileUser) {
//             return res.status(400).json({ success: false, msg: MOBILE_EXISTS });
//         }
//         user.mobile = mobile; // Update mobile if valid and changed
//     }
//     // --- End Duplicate Checks ---


//     // Update other user details from the validated data
//     user.name = name;
//     // user.email = email; // Email update handled above
//     // user.mobile = mobile; // Mobile update handled above
//     user.gender = gender;
//     user.dob = dob;
//     user.addedby = addedby;

//     // DO NOT update user.status here, as it wasn't part of the form/validation
//     // if (status !== undefined) {
//     //     user.status = status; // REMOVE THIS LINE
//     // }

//     user.updatedDate = Date.now();

//     // Save the user - Mongoose will validate the whole document
//     // If the existing 'status' field has bad data (like "true"), this save will fail HERE.
//     await user.save();

//     // Exclude password from the response
//     const userResponse = user.toObject();
//     delete userResponse.password;

//     res.status(200).json({ success: true, msg: USER_UPDATED_SUCCESS, user: userResponse });

//   } catch (error) {
//     console.error("Error updating organization user:", error); // Log the full error for debugging

//     // Check if it's a Mongoose validation error specifically
//     if (error.name === 'ValidationError') {
//         // Extract Mongoose validation messages
//         const messages = Object.values(error.errors).map(err => err.message).join(', ');
//          return res.status(400).json({ success: false, msg: `Validation Failed: ${messages}` });
//     }

//     // Generic server error for other issues
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error: error.message });
//   }
// };



export const organizationUpdateUser = async (req, res) => {
    const userId = req.params.id;

    // 1. Exclude fields not part of the editable form data or managed internally
    const {
        _id, isDeleted, createdDate, updatedDate, password, __v,
        userPhoto, status, // Explicitly ignore these from body
        ...updateDataFromBody // The rest are potential form fields
    } = req.body;

    // 2. Validate the incoming form data ONLY
    // Use the specific schema for the fields expected from this form
    const { error } = organizationUserRegistrationValidationSchema.validate(updateDataFromBody, { abortEarly: false });
    if (error) {
        const errorMessages = error.details.map(detail => detail.message).join(', ');
        return res.status(400).json({ success: false, msg: `Validation Error: ${errorMessages}` });
    }

    // 3. Prepare the fields to be updated ($set object)
    const fieldsToUpdate = {};
    const validatedData = updateDataFromBody; // Use the data that passed Joi validation

    // Assign validated fields to the update object
    fieldsToUpdate.name = validatedData.name;
    fieldsToUpdate.gender = validatedData.gender;
    fieldsToUpdate.dob = validatedData.dob;
    fieldsToUpdate.addedby = validatedData.addedby;
    fieldsToUpdate.mobile = validatedData.mobile;
    fieldsToUpdate.email = validatedData.email;
    fieldsToUpdate.updatedDate = Date.now();
    // We will handle email and mobile separately due to uniqueness checks

    try {
        // 4. Perform Uniqueness Checks (if email/mobile are being changed)
        // We need the current user's data for comparison
        // const currentUser = await UserModal.findById(userId).select('email mobile').lean(); // Get only necessary fields, lean for plain object
        // if (!currentUser) {
        //      return res.status(404).json({ success: false, msg: USER_NOT_FOUND });
        // }

        // // Check Email
        // if (validatedData.email && validatedData.email.toLowerCase() !== currentUser.email.toLowerCase()) {
        //     const existingEmailUser = await UserModal.findOne({
        //         email: validatedData.email.toLowerCase(),
        //         _id: { $ne: userId },
        //         // isDeleted: false // Rely on model's pre-find hook
        //     });
        //     if (existingEmailUser) {
        //         return res.status(400).json({ success: false, msg: EMAIL_EXISTS });
        //     }
        //     fieldsToUpdate.email = validatedData.email.toLowerCase(); // Add email to update if valid and changed
        // }

        // // Check Mobile
        // if (validatedData.mobile && validatedData.mobile !== currentUser.mobile) {
        //     const existingMobileUser = await UserModal.findOne({
        //         mobile: validatedData.mobile,
        //          _id: { $ne: userId },
        //          // isDeleted: false // Rely on model's pre-find hook
        //      });
        //     if (existingMobileUser) {
        //         return res.status(400).json({ success: false, msg: MOBILE_EXISTS });
        //     }
        //     fieldsToUpdate.mobile = validatedData.mobile; // Add mobile to update if valid and changed
        // }

        // 5. Perform the update using findOneAndUpdate
        const updatedUser = await UserModal.findOneAndUpdate(
            { _id: userId, isDeleted: false }, // Filter: Find the specific, non-deleted user
            { $set: fieldsToUpdate },          // Update: Apply the changes
            {
                new: true,                 // Options: Return the modified document
                runValidators: true,       // Options: Run validators on the update paths ($set paths)
                context: 'query'           // Options: Important for some validators/middleware
            }
        ).select('-password'); // Exclude password from the returned document

        // 6. Check if the user was found and updated
        if (!updatedUser) {
            // Either user didn't exist or was marked deleted between find and update (race condition, unlikely)
            // Or maybe the pre-findOneAndUpdate hook prevented update
             // Attempt to find again to give a more specific error
             const checkUser = await UserModal.findById(userId);
             if (!checkUser || checkUser.isDeleted) {
                 return res.status(404).json({ success: false, msg: USER_NOT_FOUND });
             } else {
                 // Should not happen often if hooks are correct
                 return res.status(500).json({ success: false, msg: "Update failed unexpectedly." });
             }
        }

        // 7. Send Success Response
        res.status(200).json({
            success: true,
            msg: USER_UPDATED_SUCCESS,
            user: updatedUser // Send the updated user object (password already excluded)
        });

    } catch (error) {
        console.error("Error updating organization user:", error);

        // Handle potential validation errors triggered by runValidators during findOneAndUpdate
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message).join(', ');
            return res.status(400).json({ success: false, msg: `Update Validation Failed: ${messages}` });
        }
         // Handle duplicate key errors (just in case the earlier check had a race condition)
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({ success: false, msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
        }

        res.status(500).json({ success: false, msg: SERVER_ERROR, error: error.message });
    }
};

// Soft delete a student
// export const organizationUserDelete = async (req, res) => {
//   try {
//     let user = await UserModal.findById(req.params.id);
//     if (!user || user.isDeleted) {
//       return res.json({ success: false, msg: USER_NOT_FOUND });
//     }

//     // Soft delete the user
//     user.isDeleted = true;
//     user.updatedDate = Date.now();

//     await user.save();

//     res.status(200).json({ success: true, msg: USER_SOFT_DELETED_SUCCESS });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };


export const organizationUserDelete = async (req, res) => {
  try {
    const userId = req.params.id;

    // Use findByIdAndUpdate to directly set isDeleted and updatedDate
    const updatedUser = await UserModal.findByIdAndUpdate(
      userId,
      {
        $set: {
          isDeleted: true,
          updatedDate: Date.now()
        }
      },
      {
        new: false // Optional: Set to true if you need the updated doc returned, false otherwise
      }
    );

    // Check if a document was actually found and updated
    if (!updatedUser || updatedUser.isDeleted) {
       // If the user was ALREADY deleted, findByIdAndUpdate might return the old doc
       // We should check existence separately if needed, or rely on the update result
       // A simpler check: if updatedUser is null, it wasn't found.
       if (!updatedUser) {
           return res.status(404).json({ success: false, msg: USER_NOT_FOUND });
       }
       // If it *was* found but maybe already marked deleted, proceed as success anyway
    }


    res.status(200).json({ success: true, msg: USER_SOFT_DELETED_SUCCESS });

  } catch (error) {
    console.error(`Error soft deleting user ID: ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      msg: SERVER_ERROR,
      // error: error.message // Optional for dev
    });
  }
};



// ORGANIZATION STATS CARDS CONTROLLER FUNCTIONS =====================================================================

// Function to get the total number of users for a specific organization


// export const organizationTotalUsers = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const count = await UserModal.countDocuments({ isDeleted: false, addedby: orgName });
//     res.status(200).json({ success: true, count });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_TOTAL_USER_FETCHED_SUCCESS  });
//   }
// };

// // Function to get the number of new users added in the last week for a specific organization
// export const organizationNewUsersLastWeek = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const oneWeekAgo = moment().subtract(7, 'days').toDate();
//     const newUsersCount = await UserModal.countDocuments({
//       createdAt: { $gte: oneWeekAgo },
//       isDeleted: false,
//       addedby: orgName
//     });
//     res.status(200).json({ success: true, count: newUsersCount, msg:ORG_NEW_USER_FETCHED_SUCCESS  });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const organizationMaleUsers = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const maleUsersCount = await UserModal.countDocuments({
//       gender: "Male",
//       isDeleted: false,
//       addedby: orgName
//     });
//     res.status(200).json({ success: true, count: maleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_MALE_USER_FETCHED_SUCCESS  });
//   }
// };

// export const organizationFemaleUsers = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const femaleUsersCount = await UserModal.countDocuments({
//       gender: "Female",
//       isDeleted: false,
//       addedby: orgName
//     });
//     res.status(200).json({ success: true, count: femaleUsersCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg, msg:ORG_FEMALE_USER_FETCHED_SUCCESS  });
//   }
// };

// export const organizationActiveUsers = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const activeUsersCount = await UserModal.countDocuments({
//       status: true,
//       isDeleted: false,
//       addedby: orgName
//     });
//     res.status(200).json({ success: true, count: activeUsersCount, msg:ORG_ACTIVE_USER_FETCHED_SUCCESS  });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const organizationDeactiveUsers = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const deactiveUsersCount = await UserModal.countDocuments({
//       status: false,
//       isDeleted: false,
//       addedby: orgName
//     });
//     res.status(200).json({ success: true, count: deactiveUsersCount, msg:ORG_DEACTIVE_USER_FETCHED_SUCCESS  });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };

// export const organizationAverageUserAge = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     const users = await UserModal.find({ isDeleted: false, addedby: orgName }, 'dob');
//     const totalAge = users.reduce((sum, user) => {
//       const age = moment().diff(user.dob, 'years');
//       return sum + age;
//     }, 0);
//     const averageAge = totalAge / users.length;
//     res.status(200).json({ success: true, averageAge: averageAge.toFixed(2), msg:ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: SERVER_ERROR, error:error.msg });
//   }
// };








// // one controller for all user related detail ---

// export const organizationDashboardStats = async (req, res) => {
//   const orgName = req.params.orgName;

//   try {
//     // Calculate date for "new users last week" filter
//     const oneWeekAgo = moment().subtract(7, 'days').toDate();

//     // Execute all queries in parallel
//     const [
//       totalUsers,
//       newUsersLastWeek,
//       maleUsers,
//       femaleUsers,
//       activeUsers,
//       deactiveUsers,
//       usersForAgeCalculation
//     ] = await Promise.all([
//       UserModal.countDocuments({ isDeleted: false, addedby: orgName }),
//       UserModal.countDocuments({
//         createdAt: { $gte: oneWeekAgo },
//         isDeleted: false,
//         addedby: orgName
//       }),
//       UserModal.countDocuments({
//         gender: "Male",
//         isDeleted: false,
//         addedby: orgName
//       }),
//       UserModal.countDocuments({
//         gender: "Female",
//         isDeleted: false,
//         addedby: orgName
//       }),
//       UserModal.countDocuments({
//         status: "approved",
//         isDeleted: false,
//         addedby: orgName
//       }),
//       UserModal.countDocuments({
//         status: "not approved",
//         isDeleted: false,
//         addedby: orgName
//       }),
//       UserModal.find({ isDeleted: false, addedby: orgName }, 'dob')
//     ]);

//     // Calculate average age
//     const totalAge = usersForAgeCalculation.reduce((sum, user) => {
//       return sum + moment().diff(user.dob, 'years');
//     }, 0);
//     const averageAge = (totalAge / (usersForAgeCalculation.length || 1)).toFixed(2);

//     // Get total organizations (if needed)
//     const totalOrganizations = await OrgRegister.countDocuments({ isDeleted: false });

//     res.status(200).json({
//       success: true,
//       stats: {
//         totalUsers,
//         newUsersLastWeek,
//         maleUsers,
//         femaleUsers,
//         activeUsers,
//         deactiveUsers,
//         averageAge,
//         totalOrganizations
//       },
//       message: "Organization dashboard stats fetched successfully"
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({
//       success: false,
//       message: "Server Error",
//       error: error.message
//     });
//   }
// };