import mongoose from "mongoose";

const userDemoSchema = new mongoose.Schema({
    name: { type: String, required: true, trim:true },
    // email: { type: String, required: true, unique: true, trim:true },
    // mobile: { type: String,  unique: true, required: true, trim:true, maxlength:10, maxlength:10 },
    email: { type: String, required: true, trim:true },
    mobile: { type: String, required: true, trim:true},
    gender: { type: String, required: true, trim:true },
    dob: { type: Date, required: true },
    aboutHelp: {type: String, required: true, trim:true},
    // partOfOrganization: {type: Boolean, default: false},
    // organizationName: {type:String, trime:true},
    // preferredDate: {type: Date, default: null},
    // preferredDay: {type: String, required: true, trim: true},
    preferredDate: {type: Date, required: true},
    preferredTimeSlot: {type: String, trim: true},
    
    demoRequestDate: { type: Date, default: null },
    isResolved: { type: Boolean, default: false },
    demoResolveDate: { type: Date, default: null },
    resolvedCount: {type: Number, default:0},
    isCancelled: {type: Boolean, default:false},
})

const DemoReqByUserModal = mongoose.model('User_Demo_Request', userDemoSchema);

export default DemoReqByUserModal;