// import express from "express";
// import { registerStudent } from "../../controllers/organization/studentController.js";

// const router = express.Router();

// router.post("/register", registerStudent);

// export default router;

import express from "express";
import { registerStudent, getAllStudents, getStudentById, updateStudent, deleteStudent } from "../../controllers/organization/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.get("/get-students", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;