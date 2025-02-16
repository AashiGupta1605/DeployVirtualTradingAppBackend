import mongoose from 'mongoose';

const etfNameSchema = new mongoose.Schema({
  id: { type: String, required: true },
  code: { type: String, required: true },
  name: { type: String, required: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  status: { type: Boolean, default: true }
});

const EtfName = mongoose.model('ETFName', etfNameSchema);
export default EtfName;
