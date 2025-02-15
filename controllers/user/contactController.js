import ContactUs from "../models/ContactUs.js";

// Create a new contact entry
export const createContact = async (req, res) => {
  try {
    const { name, email, mobile, type, desc } = req.body;

    const newContact = new ContactUs({
      name,
      email,
      mobile,
      type,
      desc,
    });

    await newContact.save();
    res.status(201).json({ message: "Contact request submitted successfully!", contact: newContact });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit contact request" });
  }
};

// Get all contact entries
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await ContactUs.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve contacts" });
  }
};

// Get a single contact by ID
export const getContactById = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json(contact);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve contact" });
  }
};

// Update a contact by ID
export const updateContact = async (req, res) => {
  try {
    const updatedContact = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updateDate: Date.now() },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact updated successfully!", updatedContact });
  } catch (error) {
    res.status(500).json({ error: "Failed to update contact" });
  }
};

// Delete a contact by ID
export const deleteContact = async (req, res) => {
  try {
    const deletedContact = await ContactUs.findByIdAndDelete(req.params.id);
    if (!deletedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({ message: "Contact deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete contact" });
  }
};