import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  organizationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OrgRegister' 
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String,  unique: true },
  gender: { type: String },
  dob: { type: Date },
  status: { type: Boolean, default: true },
  addedby: { type: String, default:"self" },
  orgtype: { type: String },
  isDeleted: { type: Boolean, default: false },
  userPhoto: { 
    type: String, 
    default: "https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"
  },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});


// 🔹 Add method to change password securely
userSchema.methods.changePassword = async function (oldPassword, newPassword) {
  const isMatch = await bcrypt.compare(oldPassword, this.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new Error("New password must be different from the old password");
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(newPassword, salt);
  await this.save();
};

// Hash password before saving user
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// Method to update/change password
// userSchema.methods.changePassword = async function (oldPassword, newPassword) {
//   const isMatch = await bcrypt.compare(oldPassword, this.password);
//   if (!isMatch) throw new Error("Old password is incorrect");

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(newPassword, salt);
//   await this.save();
//   return true;
// };

userSchema.index({ gender: 1 });

export default mongoose.model("User", userSchema);