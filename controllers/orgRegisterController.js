import OrgRegistration from "../models/OrgRegister.js";

// Create Organization (Default Approval Status: Pending)
export const createOrg = async (req, res) => {
  try {
    const newOrg = new OrgRegistration(req.body);
    await newOrg.save();
    res.status(201).json({ message: "Organization registered successfully", data: newOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Organizations
export const getAllOrgs = async (req, res) => {
  try {
    const orgs = await OrgRegistration.find();
    res.status(200).json(orgs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Organization by ID
export const getOrgById = async (req, res) => {
  try {
    const org = await OrgRegistration.findById(req.params.id);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json(org);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Organization
export const updateOrg = async (req, res) => {
  try {
    const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: "Organization updated", data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Organization
export const deleteOrg = async (req, res) => {
  try {
    const deletedOrg = await OrgRegistration.findByIdAndDelete(req.params.id);
    if (!deletedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: "Organization deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or Reject Organization
export const updateApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body; // Expected values: "approved", "rejected"
    console.log("Received status (orgRegister):", status); // Debugging

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    const updatedOrg = await OrgRegistration.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    );

    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    
    res.status(200).json({ message: `Organization ${status}`, data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};