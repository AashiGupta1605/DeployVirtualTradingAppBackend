import express from "express";
import { getUserCertificates, generateCertificatePDF } from '../../../controllers/user/certificates/userCertificateController.js';

const router = express.Router();

// User certificate routes
router.get('/:id/my-certificate', getUserCertificates);
router.get('/:certificateId/:id/download', generateCertificatePDF);

export default router;