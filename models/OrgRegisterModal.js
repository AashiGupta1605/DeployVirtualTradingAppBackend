// models/OrgRegisterModal.js
import mongoose from 'mongoose';

const orgRegistrationSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  address: { 
    type: String, 
    required: true,
    trim: true
  },
  website: { 
    type: String,
    trim: true
  },
  contactPerson: { 
    type: String,
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  mobile: { 
    type: String,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  approvalStatus: { 
    type: String, 
    enum: ['approved', 'rejected', 'pending'],
    default: 'pending'
  },

  photo:{type:String, default:"https://cdn.pixabay.com/photo/2021/07/02/04/48/user-6380868_1280.png"},
  isDeleted: { type: Boolean, default: false },
  createDate: { type: Date, default: Date.now },
  updateDate: { type: Date, default: Date.now }
}, {
  timestamps: true // This will add createdAt and updatedAt fields

});

// Add indexes for better query performance
orgRegistrationSchema.index({ email: 1 }, { unique: true });
orgRegistrationSchema.index({ approvalStatus: 1 });
orgRegistrationSchema.index({ isDeleted: 1 });

const OrgRegistration = mongoose.model('OrgRegister', orgRegistrationSchema);

export default OrgRegistration;