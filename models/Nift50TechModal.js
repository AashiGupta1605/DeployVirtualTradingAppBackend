import mongoose from 'mongoose';

const nifty50TechSchema = new mongoose.Schema({
  id: { type: String, required: true },
  status: { type: Boolean, default: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const Nifty50Tech = mongoose.model('Nifty50Tech', nifty50TechSchema);
export default Nifty50Tech;
