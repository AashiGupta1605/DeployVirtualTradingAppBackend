import NiftyData from '../../models/NiftyDataModal.js';

export const saveNiftyData = async (req, res) => {
  try {
    const { name, value } = req.body;
    await new NiftyData({ name, value }).save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
};

export const getNiftyData = async (req, res) => {
  try {
    res.status(200).json(await NiftyData.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};

export const getCompanyBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const latestData = await NiftyData.findOne().sort({ fetchTime: -1 });
    if (!latestData?.stocks) return res.status(404).json({ message: 'No stock data available' });
    const company = latestData.stocks.find(stock => stock.symbol === symbol);
    if (!company) return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllCompanyDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const allBatches = await NiftyData.find();
    if (!allBatches.length) return res.status(404).json({ message: 'No stock data available' });
    const companyData = allBatches.flatMap(batch => batch.stocks.filter(stock => stock.symbol === symbol));
    if (!companyData.length) return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// orgControllers 
import Organization from "../../models/OrgAdminModal.js";

export const registerOrganization = async (req, res) => {
  try {
    const newOrg = new Organization({ ...req.body, createdBy: req.body.createdBy?.trim() || "Super Admin" });
    await newOrg.save();
    res.status(201).json({ message: "Organization registered successfully", data: newOrg });
  } catch (error) {
    console.error("Error saving organization:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createOrganization = async (req, res) => {
  try {
    res.status(201).json(await new Organization(req.body).save());
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrganizations = async (req, res) => {
  try {
    res.json(await Organization.find({ status: true }));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) return res.status(404).json({ message: "Organization not found" });
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, { ...req.body, updateDate: Date.now() }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.json(updatedOrg);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteOrganization = async (req, res) => {
  try {
    const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, { status: false, updateDate: Date.now() }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.json({ message: "Organization has been disabled (soft deleted)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateApprovalStatus = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!["approved", "rejected"].includes(approvalStatus)) return res.status(400).json({ error: "Invalid approval status" });
    const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, { approvalStatus, updateDate: Date.now() }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.json({ message: `Organization ${approvalStatus} successfully`, data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrganizationApprovalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid approval status" });
    const updatedOrg = await Organization.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
    if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
    res.status(200).json({ message: `Organization ${status}`, data: updatedOrg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//orgRegister
// import OrgRegistration from "../../models/OrgRegisterModal.js";

// export const getAllOrgs = async (req, res) => {
//   try {
//     res.status(200).json(await OrgRegistration.find());
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getOrgById = async (req, res) => {
//   try {
//     const org = await OrgRegistration.findById(req.params.id);
//     if (!org) return res.status(404).json({ message: "Organization not found" });
//     res.status(200).json(org);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const updateOrg = async (req, res) => {
//   try {
//     const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
//     res.status(200).json({ message: "Organization updated", data: updatedOrg });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const deleteOrg = async (req, res) => {
//   try {
//     const deletedOrg = await OrgRegistration.findByIdAndDelete(req.params.id);
//     if (!deletedOrg) return res.status(404).json({ message: "Organization not found" });
//     res.status(200).json({ message: "Organization deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const orgUpdateApprovalStatus = async (req, res) => {
//   try {
//     const { status } = req.body;
//     if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid approval status" });
//     const updatedOrg = await OrgRegistration.findByIdAndUpdate(req.params.id, { approvalStatus: status }, { new: true });
//     if (!updatedOrg) return res.status(404).json({ message: "Organization not found" });
//     res.status(200).json({ message: `Organization ${status}`, data: updatedOrg });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

//orgStudent 
import Student from "../../models/StudentModal.js";

export const getStudentsByOrgName = async (req, res) => {
  try {
    const { orgName } = req.params;
    const students = await Student.find({ orgName: { $regex: new RegExp(orgName, "i") }, isDeleted: false });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students by organization:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
};

// comapny details

import express from 'express';
const router = express.Router();
router.get('/api/company/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const latestData = await NiftyData.findOne().sort({ fetchTime: -1 });

    if (!latestData || !latestData.stocks) {
      return res.status(404).json({ message: 'No stock data available' });
    }

    const company = latestData.stocks.find(stock => stock.symbol === symbol);

    if (!company) {
      return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    }

    res.json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


export default router;