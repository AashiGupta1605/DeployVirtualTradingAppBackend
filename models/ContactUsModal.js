import mongoose from 'mongoose';

const contactUsSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  type: { type: String },
  desc: { type: String },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);
export default ContactUs;
