// import express from "express";
// import { registerStudent } from "../../controllers/organization/studentController.js";

// const router = express.Router();

// router.post("/register", registerStudent);

// export default router;

import express from "express";
import { registerStudent, getAllStudents, getStudentById, updateStudent, deleteStudent, getTotalUsersCount, getNewStudentsLastWeek } from "../../controllers/organization/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.get("/get-students", getAllStudents);
router.get("/:id", getStudentById);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);
router.get("/count/total", getTotalUsersCount);
router.get("/count/new-week", getNewStudentsLastWeek );


export default router;