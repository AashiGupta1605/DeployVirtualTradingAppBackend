// // old code 
// import Student from "../../models/StudentModal.js";
// import bcrypt from "bcryptjs";
// import { studentValidationSchema } from "../../helpers/joiValidation.js";
// import moment from "moment";
// // Register a new student
// export const registerStudent = async (req, res) => {
//   const { error } = studentValidationSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({success:false, msg: error.details[0].message });
//   }

//   const { name, email, mobile, gender, dob, password, orgtype, orgName } = req.body;

//   try {
//     // Check if the user already exists
//     let student = await Student.findOne({ email });
//     if (student) {
//       return res.status(400).json({success:false, msg: "Student already exists" });
//     }

//     // Create a new student
//     student = new Student({
//       name,
//       email,
//       mobile,
//       gender,
//       dob,
//       password,
//       orgtype,
//       orgName,
//       // status,
//     });

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     student.password = await bcrypt.hash(password, salt);

//     await student.save();

//     res.status(201).json({ msg: "Student registered successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({success:false, msg:"Server error"});
//   }
// };

// // Get all students
// export const getAllStudents = async (req, res) => {
//   try {
//     const students = await Student.find({ isDeleted: false });
//     res.status(200).json(students);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({success:false, msg:"Server error"});
//   }
// };

// // Get a student by ID
// export const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (!student || student.isDeleted) {
//       return res.status(404).json({ msg: "Student not found" });
//     }
//     res.status(200).json(student);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({success:false, msg:"Server error"});
    
//   }
// };


// export const updateStudent = async (req, res) => {
//   const { _id, isDeleted, status,  createdDate, updatedDate, __v, ...updateData } = req.body; // Exclude _id, isDeleted, and status from the update data
//   const { error } = studentValidationSchema.validate(updateData);
//   if (error) {
//     return res.json({ success: false, msg: error.details[0].message });
//   }

//   const { name, email, mobile, gender, dob, password, orgtype, orgName } = updateData;

//   try {
//     let student = await Student.findById(req.params.id);
//     if (!student || student.isDeleted) {
//       return res.json({ success: false, msg: "Student not found" });
//     }

//     // Update student details
//     student.name = name;
//     student.email = email;
//     student.mobile = mobile;
//     student.gender = gender;
//     student.dob = dob;
//     student.orgtype = orgtype;
//     student.orgName = orgName;

//     if (password) {
//       const salt = await bcrypt.genSalt(10);
//       student.password = await bcrypt.hash(password, salt);
//     }

//     student.updatedDate = Date.now();

//     await student.save();

//     res.status(200).json({ success: true, msg: "Student updated successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "Server error" });
//   }
// };


// // Soft delete a student
// export const deleteStudent = async (req, res) => {
//   try {
//     let student = await Student.findById(req.params.id);
//     if (!student || student.isDeleted) {
//       return res.json({ success:false, msg: "Student not found" });
//     }

//     // Soft delete the student
//     student.isDeleted = true;
//     student.updatedDate = Date.now();

//     await student.save();

//     res.status(200).json({success:true, msg: "Student deleted successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({success:false, msg:"Server error"});
//   }
// };



// export const getTotalUsersCount = async (req, res) => {
//   try {
//     const count = await Student.countDocuments({ isDeleted: false });
//     res.status(200).json({ success: true, count });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "Server error" });
//   }
// };

// export const getNewStudentsLastWeek = async (req, res) => {
//   try {
//     const oneWeekAgo = moment().subtract(7, 'days').toDate();
//     const newStudentsCount = await Student.countDocuments({
//       createdAt: { $gte: oneWeekAgo },
//       isDeleted: false,
//     });
//     res.status(200).json({ success: true, count: newStudentsCount });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).json({ success: false, msg: "Server error" });
//   }
// };





// =================================================================================================
// new code for routes 



































