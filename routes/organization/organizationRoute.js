// organziation route ============================================= (MITS)

import express from 'express';
import { organizationRegister, organizationLogin, organizationUserRegistration, organizationUpdateUser, organizationUserDelete, organizationUsersDisplay, organizationTotalUsers, organizationNewUsersLastWeek, organizationgetUserDisplayById 
    ,getAllOrgs,getOrgById,  updateOrg,
deleteOrg,
updateApprovalStatus,getUserByOrgName
} from '../../controllers/organization/Organizationontroller.js';

const router = express.Router();

router.post('/register', organizationRegister);

router.post('/login', organizationLogin);



// organization users route ====================================== (ABHAY)

router.post("/user/register", organizationUserRegistration);
// router.get("/user/display-all-users", organizationUsersDisplay);
router.get("/:orgName/users", organizationUsersDisplay);


router.get("/user/:id", organizationgetUserDisplayById);
router.put("/user/:id", organizationUpdateUser);
router.delete("/user/:id", organizationUserDelete);
router.get("/:orgName/users/count/total", organizationTotalUsers);
router.get("/:orgName/users/count/new-week", organizationNewUsersLastWeek );


//For Admin
router.get("/display-all-org", getAllOrgs); // GET for retrieving all organizations
router.get("/:id", getOrgById); // GET for retrieving a specific organization by ID
router.put("/:id", updateOrg); // PUT for updating an organization
router.delete("/:id", deleteOrg); // DELETE for deleting an organization
router.put("/:id/approval-status", updateApprovalStatus); // PUT for updating approval status
router.get('/users/:orgName', getUserByOrgName);
export default router;