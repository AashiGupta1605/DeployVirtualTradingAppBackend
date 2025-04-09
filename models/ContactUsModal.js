// import mongoose from 'mongoose';

// const contactUsSchema = new mongoose.Schema({
//   id: { type: String },
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   mobile: { type: String },
//   type: { type: String },
//   desc: { type: String },
//   isDeleted: { type: Boolean, default: false },
//   createDate: { type: Date, default: Date.now },
//   updateDate: { type: Date, default: Date.now }
// });

// const ContactUs = mongoose.model('ContactUs', contactUsSchema);
// export default ContactUs;

import mongoose from 'mongoose';

const contactUsSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String },
  type: { type: String }, // e.g., "general", "product", "partnership", etc.
  desc: { type: String },
  isDeleted: { type: Boolean, default: false },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now },
  // New field to track if admin has responded (optional)
  responded: { type: Boolean, default: false }
});

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

export default ContactUs;
