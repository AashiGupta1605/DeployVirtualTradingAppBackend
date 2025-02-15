import express from "express";
import {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

router.post("/createContact", createContact); // Create a new contact entry
router.get("/", getAllContacts); // Get all contacts
//router.get("/:id", getContactById); // Get a specific contact
//router.put("/:id", updateContact); // Update a contact
//router.delete("/:id", deleteContact); // Delete a contact

export default router;