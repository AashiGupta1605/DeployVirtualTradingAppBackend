import mongoose from 'mongoose';

const superAdminSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  emailid: { type: String, required: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: Boolean, default: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const SuperAdmin = mongoose.model('SuperAdmin', superAdminSchema);

export default SuperAdmin;