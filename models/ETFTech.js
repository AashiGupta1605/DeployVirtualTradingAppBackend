import mongoose from 'mongoose';

const etfTechSchema = new mongoose.Schema({
  id: { type: String, required: true },
  status: { type: Boolean, default: true },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const EtfTech = mongoose.model('ETFTech', etfTechSchema);
export default EtfTech;
