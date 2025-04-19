import express from 'express'
import { addUserDemoRequest, displayUserDemoRequest, updateUserDemoRequestStatus } from '../../controllers/admin/userDemoReqController.js'
import { addOrgDemoRequest, displayOrgDemoRequest, updateOrgDemoRequestStatus } from '../../controllers/admin/orgDemoReqController.js'

const router = express.Router();

router.post('/addDemobyUser', addUserDemoRequest)
router.post('/addDemobyOrganization', addOrgDemoRequest)

router.get('/getDemobyUser/:timeSlot/:status/:gender/:field/:search', displayUserDemoRequest)
router.get('/getDemobyOrganization/:timeSlot/:status/:field/:search', displayOrgDemoRequest)

router.put('/updateDemobyUser/:id', updateUserDemoRequestStatus)
router.put('/updateDemobyOrganization/:id', updateOrgDemoRequestStatus)

export default router;