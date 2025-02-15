import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  type: { type: String },
  desc: { type: String },
  status: { type: Boolean, default: true },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now }
});

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
