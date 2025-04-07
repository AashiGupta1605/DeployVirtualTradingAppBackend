import mongoose from 'mongoose';

const galleryCategorySchema = new mongoose.Schema({
    // id: { type: String, required: true, unique:true, trim:true }, //no need, as _id (default id of mongo) is sufficient
    
    // galleryItemId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "galleryData",
    //     required: true
    // },

    name: { type: String, required: true, unique:true, trim:true, maxlength:25 },
    
    createdDate: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedDate: { type: Date, default: null },
    updatedDate: { type: Date, default: null }
});

// // Virtual field to calculate the number of items in a category
// galleryCategorySchema.virtual('numberOfItems', {
//     ref: 'galleryData',
//     localField: 'name', 
//     foreignField: 'categoryName',
//     count: true // Returns only the count
// });

// // Ensure virtual fields are included when converting to JSON or Object
// galleryCategorySchema.set('toObject', { virtuals: true });
// galleryCategorySchema.set('toJSON', { virtuals: true });

const galleryCategory = mongoose.model('galleryCategory', galleryCategorySchema);
export default galleryCategory;