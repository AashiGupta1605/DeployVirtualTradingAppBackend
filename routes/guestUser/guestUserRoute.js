import express from 'express';

import { getUserFeedback } from '../../controllers/guestUser/GetFeedbackController.js';

const router = express.Router();

router.get('/userFeedback/:sortBy/:order', getUserFeedback);

export default router;