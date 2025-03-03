import express from 'express';

import { getUserFeedback, getAllFeedback } from '../../controllers/user/feedbackController.js';

const router = express.Router();

router.get('/userFeedback/:category/:sortBy/:order', getUserFeedback);
router.get('/userFeedback/:sortBy/:order', getUserFeedback);
router.get('/userFeedback',getAllFeedback)

export default router;