import mongoose from 'mongoose';

const galleryDataSchema = new mongoose.Schema({
    // categoryId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "galleryCategory",
    //     required: true
    // },

    // id: { type: String, required: true, unique:true, trim:true }, //no need, as _id (default id of mongo) is sufficient
    categoryName: { type: String, required: true, trim:true},
    title: { type: String, trim:true, default: null, maxlength:80, minlength:8 },
    desc: { type: String, trim:true, default: null, maxlength:600, minlength:15},
    photo: { type: String, required: true, trim:true},

    createdDate: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedDate: { type: Date, default: null },
    updatedDate: { type: Date, default: null },
});

const galleryData = mongoose.model('galleryData', galleryDataSchema);
export default galleryData;
