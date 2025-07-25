import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../../../controllers/user/contactController.js"; // Corrected path for controller

const router = express.Router();

router.post("/createContact", createContact); // Create a new contact entry
router.get("/get", getAllContacts); // Get all contacts
router.get("/:id", getContactById); // Get a specific contact
// router.put("/:id", updateContact); // Update a contact
router.delete("/deleteContact/:id", deleteContact); // Delete a contact

export default router;
