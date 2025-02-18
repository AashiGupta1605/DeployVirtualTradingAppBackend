// by khusi
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   mobile: { type: String },
//   gender: { type: String },
//   dob: { type: Date },
//   password: { type: String, required: true },
//   status: { type: Boolean, default: true },
//   // change by abhishek for org user registration and normal user so that they share the same User Model and help the Admin in Filtering Organization
//   addedby: { type: String, default:"self" },
//   orgtype: { type: String },
//   isDeleted: { type: Boolean, default: false },
//   createdDate: { type: Date, default: Date.now },
//   updatedDate: { type: Date, default: Date.now }
// });

// export default mongoose.model("User", userSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String },
  gender: { type: String },
  dob: { type: Date },
  status: { type: Boolean, default: true },
  // change by abhishek for org user registration and normal user so that they share the same User Model and help the Admin in Filtering Organization
  addedby: { type: String, default:"self" },
  orgtype: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);