import express from 'express';
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  totalEvents
  registerForEvent,
  verifyEventPayment,
  getMyRegisteredEvents
} from '../../../controllers/admin/eventController.js';
import { protect } from '../../../middlewares/userMiddleware.js';

const router = express.Router();

router.route('/')
  .post( createEvent)
  .get(getAllEvents);

router.route('/:id')
  .put( updateEvent)
  .delete( deleteEvent);



  // user stats for admin cards

  router.get("/eventCount/total", totalEvents);
  
  router.post('/register', registerForEvent);
  router.post('/verify-event', verifyEventPayment);

  router.get('/my-events', protect, getMyRegisteredEvents);
  

export default router;