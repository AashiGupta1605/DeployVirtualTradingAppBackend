import mongoose from 'mongoose';

const nifty50FunSchema = new mongoose.Schema({
  id: { type: String, required: true },
  SMA: { type: Number },
  EMP: { type: Number },
  status: { type: Boolean, default: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const Nifty50Fun = mongoose.model('Nifty50Fun', nifty50FunSchema);
export default Nifty50Fun;
