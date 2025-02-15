import Organization from "../models/OrgAdmin.js";

export const registerOrganization = async (req, res) => {
    try {
        const newOrg = new Organization({
            ...req.body,
            createdBy: req.body.createdBy?.trim() ? req.body.createdBy : "Super Admin" // ✅ Ensures empty values get replaced
        });
        await newOrg.save();
        res.status(201).json({ message: "Organization registered successfully", data: newOrg });
    } catch (error) {
        console.error("Error saving organization:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// ✅ Create an Organization
export const createOrganization = async (req, res) => {
    try {
        const newOrg = new Organization(req.body);
        const savedOrg = await newOrg.save();
        res.status(201).json(savedOrg);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// ✅ Get Only Active Organizations
export const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find({ status: true }); // Fetch only active organizations
        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ✅ Get Single Organization by ID
export const getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) return res.status(404).json({ message: "Organization not found" });
        res.json(organization);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update Organization
export const updateOrganization = async (req, res) => {
    try {
      const updatedOrg = await Organization.findByIdAndUpdate(
        req.params.id,
        { ...req.body, updateDate: Date.now() }, // Update approvalStatus and other fields
        { new: true }
      );
      if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
      res.json(updatedOrg);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

// ✅ Soft Delete Organization (Set status to false instead of deleting)
export const deleteOrganization = async (req, res) => {
    try {
        const updatedOrg = await Organization.findByIdAndUpdate(
            req.params.id,
            { status: false, updateDate: Date.now() }, // Soft delete by setting status to false
            { new: true }
        );
        if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
        res.json({ message: "Organization has been disabled (soft deleted)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateApprovalStatus = async (req, res) => {
    try {
        const { approvalStatus } = req.body;
        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({ error: "Invalid approval status" });
        }

        const updatedOrg = await Organization.findByIdAndUpdate(
            req.params.id,
            { approvalStatus, updateDate: Date.now() }, 
            { new: true }
        );

        if (!updatedOrg) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.json({ message: `Organization ${approvalStatus} successfully`, data: updatedOrg });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateOrganizationApprovalStatus = async (req, res) => {
    try {
      const { status } = req.body; // Expected values: "approved", "rejected"
      console.log("Received status (organizations):", status); // Debugging
  
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid approval status" });
      }
  
      const updatedOrg = await Organization.findByIdAndUpdate(
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