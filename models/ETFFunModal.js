import mongoose from 'mongoose';

const etfFunSchema = new mongoose.Schema({
  id: { type: String, required: true },
  SMA: { type: Number },
  EMP: { type: Number },
  status: { type: Boolean, default: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const EtfFun = mongoose.model('ETFFun', etfFunSchema);
export default EtfFun;
