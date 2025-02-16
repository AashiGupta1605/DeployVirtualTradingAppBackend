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