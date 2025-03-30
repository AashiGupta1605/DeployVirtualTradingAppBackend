import express from 'express';
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent
} from '../../../controllers/admin/eventController.js';
// import { adminProtect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .post( createEvent)
  .get(getAllEvents);

router.route('/:id')
  .put( updateEvent)
  .delete( deleteEvent);

export default router;