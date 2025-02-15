// import Student from "../../models/StudentModal.js";
// import bcrypt from "bcryptjs";
// import { studentValidationSchema } from "../../helpers/joiValidation.js";

// export const registerStudent = async (req, res) => {
//   const { error } = studentValidationSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ msg: error.details[0].message });
//   }

//   const { name, email, mobile, gender, dob, password, orgtype, orgName } = req.body;

//   try {
//     // Check if the user already exists
//     let student = await Student.findOne({ email });
//     if (student) {
//       return res.status(400).json({ msg: "Student already exists" });
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
//     });

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     student.password = await bcrypt.hash(password, salt);

//     await student.save();

//     res.status(201).json({ msg: "Student registered successfully" });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Server error");
//   }
// };


import Student from "../../models/StudentModal.js";
import bcrypt from "bcryptjs";
import { studentValidationSchema } from "../../helpers/joiValidation.js";

// Register a new student
export const registerStudent = async (req, res) => {
  const { error } = studentValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, password, orgtype, orgName, status } = req.body;

  try {
    // Check if the user already exists
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ msg: "Student already exists" });
    }

    // Create a new student
    student = new Student({
      name,
      email,
      mobile,
      gender,
      dob,
      password,
      orgtype,
      orgName,
      status,
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    await student.save();

    res.status(201).json({ msg: "Student registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Get all students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ isDeleted: false });
    res.status(200).json(students);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Get a student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student || student.isDeleted) {
      return res.status(404).json({ msg: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Update a student
export const updateStudent = async (req, res) => {
  const { error } = studentValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ msg: error.details[0].message });
  }

  const { name, email, mobile, gender, dob, password, orgtype, orgName, status } = req.body;

  try {
    let student = await Student.findById(req.params.id);
    if (!student || student.isDeleted) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Update student details
    student.name = name;
    student.email = email;
    student.mobile = mobile;
    student.gender = gender;
    student.dob = dob;
    student.orgtype = orgtype;
    student.orgName = orgName;
    student.status = status;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      student.password = await bcrypt.hash(password, salt);
    }

    student.updatedDate = Date.now();

    await student.save();

    res.status(200).json({ msg: "Student updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};

// Soft delete a student
export const deleteStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);
    if (!student || student.isDeleted) {
      return res.status(404).json({ msg: "Student not found" });
    }

    // Soft delete the student
    student.isDeleted = true;
    student.updatedDate = Date.now();

    await student.save();

    res.status(200).json({ msg: "Student deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
};