import express from 'express';
import {
  createEvent,
  getAllEvents,
  updateEvent,
  deleteEvent,
  totalEvents,
  registerForEvent,
  verifyEventPayment,
  getMyRegisteredEvents,
  getCertificateByRegistration,
  validateCertificate,
  updateRegistrationStatusAdmin,
  getAllEventRegistrations,
  getUserEventsAdmin
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




  // CERTIFICATES ROUTES


// Add these routes
router.get('/certificates/validate', validateCertificate);
router.get('/certificates/:registrationId',getCertificateByRegistration);
  




// admin participation user route

// Admin event registration routes
router.get('/event-registrations', getAllEventRegistrations);
router.put('/event-registrations/:registrationId/status', updateRegistrationStatusAdmin);
router.get('/users/:userId/events', getUserEventsAdmin);






// certifcate route



// Certificate routes
// router.get('/my-certificates', getMyCertificates);
// router.get('/certificates/:registrationId/download', downloadCertificate);
// router.get('/certificates/:registrationId/preview', previewCertificate);

export default router;