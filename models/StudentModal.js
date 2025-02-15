// models/StudentModal.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, required: true },
  dob: { type: Date, required: true },
  password: { type: String, required: true },
  orgtype: { type: String, required: true },
  orgName: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }, // Soft delete field
});

const Student = mongoose.model("Student", studentSchema);
export default Student;