import mongoose from 'mongoose';

const orgAdminSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  website: { type: String },
  contactPerson: { type: String },
  email: { type: String, required: true },
  mobile: { type: String },
  status: { type: Boolean, default: true },
  approvalStatus: { 
    type: String, 
    enum: ["approved", "rejected", "pending"],  // ✅ Restrict values
    default: "approved" 
  }, 
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const OrgAdmin = mongoose.model('OrgAdmin', orgAdminSchema);
export default OrgAdmin;
