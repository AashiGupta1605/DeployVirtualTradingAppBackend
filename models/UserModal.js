import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String,  unique: true },
  gender: { type: String },
  dob: { type: Date },
  status: { type: Boolean, default: true },
  addedby: { type: String, default:"self" },
  orgtype: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);