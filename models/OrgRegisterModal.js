import mongoose from 'mongoose';

const orgRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  contactPerson: { type: String },
  email: { type: String, required: true },
  mobile: { type: String },
  password:{type:String, required:true},
  approvalStatus: { 
    type: String, 
    enum: ["approved", "rejected", "pending"],  // ✅ Restrict values
  },
  photo:{type:String, default:"https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"},
  isDeleted: { type: Boolean, default: false },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const OrgRegistration = mongoose.model('OrgRegister', orgRegistrationSchema);
export default OrgRegistration;



// create org regsiter defaulty by pending