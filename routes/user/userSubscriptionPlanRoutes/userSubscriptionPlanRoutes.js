// routes/user/userSubscriptionPlanRoutes/userSubscriptionPlanRoutes.js

import express from 'express';
import {
  createSubscriptionPlan,
  getSubscriptionPlan,
  getUserSubscriptionPlans,
  updateSubscriptionPlan,
  cancelSubscriptionPlan,
  getAllSubscriptionPlans
} from '../../../controllers/user/userSubscriptionPlan/userSubscriptionPlanController.js';

const router = express.Router();

// Move the user-specific route to the top to prevent conflicts
router.get('/user/:userId', getUserSubscriptionPlans);

router.route('/')
  .post(createSubscriptionPlan)
  .get(getAllSubscriptionPlans);

router.route('/:id')
  .get(getSubscriptionPlan)
  .patch(updateSubscriptionPlan);

router.patch('/:id/cancel', cancelSubscriptionPlan);

export { router as subscriptionPlanRoutes };