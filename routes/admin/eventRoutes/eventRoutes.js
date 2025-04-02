import express from 'express';
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  totalEvents
} from '../../../controllers/admin/eventController.js';
// import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post( createEvent)
  .get(getAllEvents);

router.route('/:id')
  .put( updateEvent)
  .delete( deleteEvent);



  // user stats for admin cards

  router.get("/eventCount/total", totalEvents);
  
export default router;