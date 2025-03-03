// // organziation route ============================================= (MITS)

// import express from 'express';
// import { organizationRegister, organizationLogin, organizationUserRegistration, organizationUpdateUser, organizationUserDelete, organizationUsersDisplay, organizationTotalUsers, organizationNewUsersLastWeek, organizationgetUserDisplayById 
//     ,getAllOrgs,getOrgById,  updateOrg,
// deleteOrg,
// organizationMaleUsers,
// organizationFemaleUsers,
// organizationActiveUsers,
// organizationDeactiveUsers,
// organizationAverageUserAge,
// updateApprovalStatus,getUserByOrgName,
// organizationUsersFeedbackDisplay,
// organizationUserFeedbackDelete,
// organizationUsersFeedbackDelete,
// submitOrganizationFeedback,
// } from '../../controllers/organization/Organizationontroller.js';

// const router = express.Router();

// router.post('/register', organizationRegister);

// router.post('/login', organizationLogin);



// // organization users route ====================================== (ABHAY)

// router.post("/user/register", organizationUserRegistration);
// router.get("/user/display-all-users", organizationUsersDisplay);
// router.get("/:orgName/users", organizationUsersDisplay);

// // added on 28 feb night
// // organizaition users feedback
// router.get("/:orgName/users/feedbacks", organizationUsersFeedbackDisplay);
// // router.delete("/user/feedbacks/:id", organizationUsersFeedbackDelete);
// router.delete("/user/feedbacks/:id", organizationUsersFeedbackDelete);

// // organization feedbacks
// router.post("/feedbacks/register", submitOrganizationFeedback);


// router.get("/user/:id", organizationgetUserDisplayById);
// router.put("/user/:id", organizationUpdateUser);
// router.delete("/user/:id", organizationUserDelete);
// router.get("/:orgName/users/count/total", organizationTotalUsers);
// router.get("/:orgName/users/count/new-week", organizationNewUsersLastWeek);
// router.get("/:orgName/users/count/male", organizationMaleUsers);
// router.get("/:orgName/users/count/female", organizationFemaleUsers);
// router.get("/:orgName/users/count/active", organizationActiveUsers);
// router.get("/:orgName/users/count/deactive", organizationDeactiveUsers);
// router.get("/:orgName/users/count/average-age", organizationAverageUserAge);




// //For Admin
// router.get("/display-all-org", getAllOrgs); // GET for retrieving all organizations
// router.get("/:id", getOrgById); // GET for retrieving a specific organization by ID
// router.put("/:id", updateOrg); // PUT for updating an organization
// router.delete("/:id", deleteOrg); // DELETE for deleting an organization
// router.put("/:id/approval-status", updateApprovalStatus); // PUT for updating approval status
// router.get('/users/:orgName', getUserByOrgName);
// export default router;






// updated routes - divide controllers

// import express from 'express';
// import {
//   organizationControllers,
//   organizationUserControllers,
// } from '../../controllers/index.js';

// const router = express.Router();

// // Organization routes - crud
// router.post('/register', organizationControllers.organizationRegister);
// router.post('/login', organizationControllers.organizationLogin);

// // Organization user routes - crud
// router.post('/user/register', organizationUserControllers.organizationUserRegistration);
// router.get('/user/display-all-users', organizationUserControllers.organizationUsersDisplay);
// router.get('/:orgName/users', organizationUserControllers.organizationUsersDisplay);
// router.get('/user/:id', organizationUserControllers.organizationgetUserDisplayById);
// router.put('/user/:id', organizationUserControllers.organizationUpdateUser);
// router.delete('/user/:id', organizationUserControllers.organizationUserDelete);

// // organization user statistics 
// router.get('/:orgName/users/count/total', organizationUserControllers.organizationTotalUsers);
// router.get('/:orgName/users/count/new-week', organizationUserControllers.organizationNewUsersLastWeek);
// router.get('/:orgName/users/count/male', organizationUserControllers.organizationMaleUsers);
// router.get('/:orgName/users/count/female', organizationUserControllers.organizationFemaleUsers);
// router.get('/:orgName/users/count/active', organizationUserControllers.organizationActiveUsers);
// router.get('/:orgName/users/count/deactive', organizationUserControllers.organizationDeactiveUsers);
// router.get('/:orgName/users/count/average-age', organizationUserControllers.organizationAverageUserAge);

// // Admin routes
// router.get('/display-all-org', organizationControllers.getAllOrgs);
// router.get('/:id', organizationControllers.getOrgById);
// router.put('/:id', organizationControllers.updateOrg);
// router.delete('/:id', organizationControllers.deleteOrg);
// router.put('/:id/approval-status', organizationControllers.updateApprovalStatus);
// router.get('/users/:orgName', organizationControllers.getUserByOrgName);

// export default router;




// divide routes functionailty

import express from 'express';
import {
  organizationRegister,
  organizationLogin,
  getAllOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
  updateApprovalStatus,
  getUserByOrgName,
} from '../../controllers/organization/organizationController.js';
import { verifyToken } from '../../helpers/jwtHandler.js';
const router = express.Router();

// Organization routes
router.post('/register', organizationRegister);
router.post('/login', organizationLogin);

// Admin routes for organizations
router.get('/display-all-org', verifyToken, getAllOrgs);
router.get('/:id', verifyToken, getOrgById);
router.put('/:id', verifyToken, updateOrg);
router.delete('/:id', verifyToken, deleteOrg);
router.put('/:id/approval-status', verifyToken, updateApprovalStatus);
router.get('/users/:orgName', verifyToken, getUserByOrgName);

export default router;