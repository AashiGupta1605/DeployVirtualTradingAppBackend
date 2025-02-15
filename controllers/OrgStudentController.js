// controllers/OrgStudentController.js
import Student from "../models/StudentModal.js";

// Fetch students by organization name
export const getStudentsByOrgName = async (req, res) => {
  try {
    const { orgName } = req.params;
    console.log("Fetching students for org:", orgName); // Debugging log

    // Case-insensitive search for orgName
    const students = await Student.find({
      orgName: { $regex: new RegExp(orgName, "i") },
      isDeleted: false, // Fetch only active students
    });

    console.log("Students found:", students); // Debugging log
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students by organization:", error);
    res.status(500).json({ error: "Failed to fetch students." });
  }
};