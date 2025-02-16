import mongoose from 'mongoose';

const orgRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  contactPerson: { type: String },
  email: { type: String, required: true },
  mobile: { type: String },
  password:{type:String, required:true},
  // status: { type: Boolean, default: true },
  approvalStatus: { 
    type: String, 
    enum: ["approved", "rejected", "pending"],  // ✅ Restrict values
    default: "pending" 
  },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const OrgRegistration = mongoose.model('OrgRegister', orgRegistrationSchema);
export default OrgRegistration;



// create org regsiter defaulty by pending