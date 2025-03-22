// messages.js


// ORGANIZATION CONTROLLER MESSAGES ==============================================

// Organization Registration Messages
export const ORG_REGISTRATION_SUCCESS = "Organization registered successfully!";
export const ORG_ALREADY_EXISTS_NAME = "Organization already exists by name";
export const ORG_ALREADY_EXISTS_EMAIL = "Organization already exists email";
export const ORG_ALREADY_EXISTS_PHONE = "Organization already exists by phone";
export const ORG_ALREADY_EXISTS_WEBSITE = "Organization already exists by website";

export const ORG_REGISTRATION_VALIDATION_ERROR = "Validation error during organization registration";
export const ORG_NAME_REQUIRED = "Organization name is required";
export const ORG_ID_REQUIRED = "Organization ID is required";
export const ORG_GET_DATA_SUCCESS = "Organization data fetched succefully"

// Organization Login Messages
export const ORG_LOGIN_SUCCESS = "Login successful";
export const ORG_LOGIN_INVALID_CREDENTIALS = "Invalid email or password";
export const ORG_LOGIN_PENDING_APPROVAL = "Your request is pending approval by the admin.";
export const ORG_LOGIN_REJECTED = "Your request has been rejected by the admin.";
export const ORG_LOGIN_VALIDATION_ERROR = "Validation error during organization login";

// Organization CRUD Messages
export const ORG_NOT_FOUND = "Organization not found";
export const ORG_PROFILE_UPDATED_SUCCESS = "Organization profile updated successfully";
export const ORG_SOFT_DELETED_SUCCESS = "Organization soft deleted successfully";
export const ORG_APPROVAL_STATUS_UPDATED = "Organization approval status updated";




// ORGANIZATION USERS CONTROLLER MESSAGES =======================================================

// User Registration Messages
export const USER_REGISTRATION_SUCCESS = "User registered successfully. An email has been sent with login details.";
export const USER_ALREADY_EXISTS = "User already exists";
export const USER_REGISTRATION_VALIDATION_ERROR = "Validation error during user registration";

// User CRUD Messages
export const USER_NOT_FOUND = "User not found";
export const USER_UPDATED_SUCCESS = "User updated successfully";
export const USER_SOFT_DELETED_SUCCESS = "User deleted successfully";
export const USER_ALREADY_EXIST_EMAIL = "User already exist by email";
export const USER_ALREADY_EXIST_PHONE = "User already exist by mobile";

// USER STATS CARD MESSAGES
export const ORG_TOTAL_USER_FETCHED_SUCCESS = "Organization total user count fetched successfully";
export const ORG_MALE_USER_FETCHED_SUCCESS = "Organization male user count fetched successfully";
export const ORG_FEMALE_USER_FETCHED_SUCCESS = "Organization female user count fetched successfully";
export const ORG_NEW_USER_FETCHED_SUCCESS = "Organization new user count fetched successfully";
export const ORG_ACTIVE_USER_FETCHED_SUCCESS = "Organization active user count fetched successfully";
export const ORG_DEACTIVE_USER_FETCHED_SUCCESS = "Organization deactive user count fetched successfully";
export const ORG_AVERAGE_AGE_USER_FETCHED_SUCCESS = "Organization average age user count fetched successfully";



// ORGANIZATION USERS FEEDBACK MESSAGES

export const ORG_FEEDBACK_DELETE_SUCCESS = "Feedaback deleted successfully";
export const ORG_FEEDBACK_UPDATE_SUCCESS = "Feedaback Updated successfully";
export const ORG_FEEDBACK_REGISTER_SUCCESS = "Feedback register successfully";
export const ORG_FEEDBACK_FETCHED_SUCCESS = "Feedaback deleted successfully";
export const ORG_FEEDBACK_NOT_FOUND = "Feedaback not found";
export const ORG_FEEDBACK_STATUS_SUCCESS = "Feedaback status updated successfully";

export const ORG_FEEDABACK_INVALID_STATUS_VALUE = "Invalid status value";






// FOR FUTURE ====================================================================================

// General Messages
export const SERVER_ERROR = "Server error";
export const VALIDATION_ERROR = "Validation error";



// Admin Messages
export const ORG_USERS_FETCHED = "Users fetched successfully by organization";