import mongoose from "mongoose";

const organizationDemoSchema = new mongoose.Schema({
    name: { type: String, required: true, trim:true, maxlength:45 },
    website: { type: String, required: true, trim:true},
    // email: { type: String, required: true, unique: true, trim:true },
    // mobile: { type: String,  unique: true, required: true, trim:true, maxlength:10, maxlength:10 },
    email: { type: String, required: true, trim:true },
    mobile: { type: String, required: true, trim:true, maxlength:10, maxlength:10 },
    contactPerson: {type: String, trim:true, maxlength:25},
    aboutHelp: {type: String, required: true, trim:true, maxlength:160},
    preferredDate: {type: Date, required: true},
    preferredTimeSlot: {type: String, trim: true},
    
    demoRequestDate: { type: Date, default: null },
    isResolved: { type: Boolean, default: false },
    demoResolveDate: { type: Date, default: null },
    resolvedCount: {type: Number, default:0},
})

const DemoReqByOrganizationModal = mongoose.model('Organization_Demo_Request', organizationDemoSchema);

export default DemoReqByOrganizationModal;