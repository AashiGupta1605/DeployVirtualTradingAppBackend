import galleryData from "../../models/EventsGalleryModal.js";
import { v2 as cloudinary } from 'cloudinary';
import { galleryItemSchema } from "../../helpers/adminValidations.js";

// Configuration
cloudinary.config({ 
    cloud_name: 'damdh1six', 
    api_key: '286332626673617', 
    api_secret: '3PH6rCY3h78W7mYu8rQ_F5uG58U'
});
 
export const addGalleryItem = async (req, res) => {
    try {
      const { error } = galleryItemSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message,
        });
      }
  
      const { categoryName, title, desc, photo: base64Photo } = req.body;
  
      // --- Cloudinary Upload ---
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${base64Photo}`,
        {
          folder: 'gallery',
          resource_type: 'image',
        }
      );
  
      if (!result || !result.url) {
        console.error('Cloudinary Upload Failed:', result);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary. Please try again.',
        });
      }
  
      const photoUrl = result.secure_url || result.url;
  
      const newGalleryItem = new galleryData({
        categoryName,
        title: title || null,
        desc: desc || null,
        photo: photoUrl,
        createdDate: new Date(),
      });
  
      await newGalleryItem.save();
  
      return res.status(201).json({
        success: true,
        message: 'Image added to Gallery successfully.',
        galleryItem: newGalleryItem,
      });
  
    } catch (error) {
      console.error('Add Gallery Item Error:', error);
  
      if (error.http_code) {
        return res.status(error.http_code || 500).json({
          success: false,
          message: `Cloudinary error: ${error.message}. Please try again.`,
          error: error.message,
        });
      }
  
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${error.message}`,
          error: error.errors,
        });
      }
  
      return res.status(500).json({
        success: false,
        message: `Failed to add Image in gallery: ${error.message}. Please try again.`,
        error: error.message,
      });
    }
  };



export const updateGalleryItembyPatch = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        if(!id)
        return res.status(500).json({ success: false, message: "Server Error: ID required." });

        // Fetch the existing item
        let galleryItem = await galleryData.findOne({ _id: id, isDeleted: false });
        if (!galleryItem) {
            return res.status(409).json({ success: false, message: "Image not found in gallery." });
        }

        // Prepare an update object
        const updateFields = {};

        // Validate and update categoryName
        if (updates.categoryName !== undefined) {
            if (typeof updates.categoryName !== "string" || updates.categoryName.trim() === "") {
                return res.status(409).json({ success: false, message: "Category name cannot be empty." });
            }
            updateFields.categoryName = updates.categoryName.trim();
        }

        // Validate and update title
        if (updates.title !== undefined) {
            if (updates.title !== null && (typeof updates.title !== "string" || updates.title.length < 8 || updates.title.length > 80)) {
                return res.status(409).json({ success: false, message: "Title must be between 8 to 80 characters." });
            }
            updateFields.title = updates.title.trim();
        }

        // Validate and update desc
        if (updates.desc !== undefined) {
            if (updates.desc !== null && (typeof updates.desc !== "string" || updates.desc.length < 15 || updates.desc.length > 600)) {
                return res.status(409).json({ success: false, message: "Description must be between 15 to 600 characters." });
            }
            updateFields.desc = updates.desc ? updates.desc.trim() : null;
        }

        // Validate and update photo
        if (updates.photo !== undefined) {
            if (typeof updates.photo !== "string" || updates.photo.trim() === "") {
                return res.status(409).json({ success: false, message: "Photo URL cannot be empty." });
            }
            updateFields.photo = updates.photo.trim();
        }

        // Always update updatedDate
        updateFields.updatedDate = new Date();

        // Update the document
        const updatedGalleryItem = await galleryData.findByIdAndUpdate(id, updateFields, { new: true });
        
        if (!updatedGalleryItem) {
            return res.status(409).json({ success: false, message: "Gallery Image updation unsuccessful. Please try again." });
        }
        else{
        res.status(201).json({ success:true, message: "Gallery Image updated successfully.", updatedGalleryItem });
        }
    } 
    catch (error) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}.`, error: error.message });
    }
};

export const updateGalleryItem = async(req, res) => {
    try {
      const {id} = req.params;
      const { categoryName, title, desc, photo } = req.body;
  
      if(!id) {
        return res.status(400).json({ 
          success: false, 
          message: "ID is required." 
        });
      }
  
      // Validate inputs
      if(!categoryName || categoryName.trim() === "") {
        return res.status(400).json({ 
          success: false, 
          message: "Category Name is required." 
        });
      }
      
      if(!photo || photo.trim() === "") {
        return res.status(400).json({ 
          success: false, 
          message: "Photo is required." 
        });
      }
  
      // Validate title length if provided
      if (title !== undefined && title !== null) {
        if (title.length < 8 || title.length > 80) {
          return res.status(400).json({ 
            success: false, 
            message: "Title must be between 8 to 80 characters." 
          });
        }
      }
  
      // Validate description length if provided
      if (desc !== undefined && desc !== null) {
        if (desc.length < 15 || desc.length > 600) {
          return res.status(400).json({ 
            success: false, 
            message: "Description must be between 15 to 600 characters." 
          });
        }
      }
  
      const updatedGalleryItem = await galleryData.findByIdAndUpdate(
        id,
        { 
          categoryName, 
          title: title || null, 
          desc: desc || null, 
          photo, 
          updatedDate: new Date() 
        },
        { new: true }
      );
  
      if(!updatedGalleryItem) {
        return res.status(404).json({
          success: false, 
          message: "Gallery item not found or update failed"
        });
      }
  
      res.status(200).json({
        success: true, 
        message: "Gallery Image updated successfully.",
        updatedGalleryItem
      });
    } catch(error) {
      console.error("Update Gallery Item Error:", error);
      res.status(500).json({ 
        success: false, 
        message: `Failed to update Gallery Image: ${error.message}`
      });
    }
  }

export const deleteGalleryItem = async(req, res) => {
    try{
        const { id } = req.params;

        if (!id) {
            return res.status(500).json({ success: false, message: "Server Error: ID required." });
        } 
        else {
            const existingGalleryItem = await galleryData.findOne({ _id: id, isDeleted: false });;

            if (!existingGalleryItem) {
                return res.status(409).json({ success: false, message: "Image not found in Gallery." });
            } 
            else {
                // Perform deletion (soft delete)
                const deletedGalleryItem = await galleryData.findByIdAndUpdate(
                    id,
                    {
                        isDeleted: true,
                        deletedDate: new Date()
                    },
                    { new: true }
                );

                if (!deletedGalleryItem) {
                    return res.status(500).json({ success: false, message: "Failed to delete Image from Gallery. Please try again." });
                } 
                else {
                    return res.status(201).json({
                        success: true,
                        message: "Image from Gallery deleted successfully.",
                        deletedGalleryItem
                    });
                }
            }
        }
    }
    catch(error){
        console.error("Delete Gallery Item Error:", error);
        return res.status(500).json({ success: false, message: `Failed to delete Image from gallery: ${error.message}.`, error: error.message });
    }
}

export const deleteAllGalleryItems = async(req, res) => {
    try{
        let filter = { isDeleted: false };

        const galleryItemsCount = await galleryData.countDocuments(filter);
        if (galleryItemsCount === 0) {
            return res.status(409).json({ success: false, message: "Empty Gallery: No Image found in Gallery to delete." });
        } 
        else {
            // Perform soft delete on all images
            const deletedImages = await galleryData.updateMany(
                filter,
                {
                    isDeleted: true,
                    deletedDate: new Date()
                }
            );

            if (deletedImages.modifiedCount === 0) {
                return res.status(500).json({ success: false, message: "Failed to delete all Images." });
            } 
            else {
                return res.status(201).json({
                    success: true,
                    message: "All Gallery Images deleted successfully.",
                    deletedCount: deletedImages.modifiedCount
                });
            }
        }
    }
    catch(error){
        console.error("Delete All Gallery Items Error:", error);
        return res.status(500).json({ success: false, message: `Failed to delete Images from Gallery: ${error.message}.`, error: error.message });
    }
}

export const displayGalleryItems = async(req, res) => {
    try{
        const { search } = req.params;
        let filter = { isDeleted: false };

        // if (search && search.trim() !== "" && search !== "all") {
        //     filter.$or = [
        //         { title: { $regex: new RegExp("^" + search, "i") } } ,
        //         { title: { $regex: new RegExp(search, "i") } } ,
        //         { desc: { $regex: new RegExp(search, "i") } }
        //     ];
        // }

        let ImageData=[]

        if (search && search.trim() !== "" && search !== "all") {
            // First, try finding items where the category name starts with the search query
            ImageData = await galleryData.find({
                ...filter,
                categoryName: { $regex: new RegExp("^" + search, "i") }
            });

            if (ImageData.length > 0) {
                return res.status(201).json({
                    success: true,
                    message: "Gallery Images retrieved successfully.",
                    ImageData
                });
            }

            // If no exact match found, modify filter to search anywhere in the name
            ImageData = await galleryData.find({
                ...filter,
                $or: [
                    { title: { $regex: new RegExp(search, "i") } },
                    { desc: { $regex: new RegExp(search, "i") } }
                ]
            });            
        }

        else
        ImageData = await galleryData.find(filter);

        res.status(201).json({
            success: true,
            message: "Gallery Images retrieved successfully.",
            ImageData
        });
    }
    catch(error){
        console.error("Error in getting gallery Items:", error);
        res.status(500).json({
            success: false,
            message: `Failed to get Gallery Images: ${error.message}.`,
            error: error.message
        });
    }
}

export const permanentDeleteGalleryItem = async(req, res) => {
    try{

    }
    catch(error){
        
    }
}

export const displayDeletedGalleryItems = async(req, res) => {
    try{

    }
    catch(error){
        
    }
}


export const uploadImage = async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({
          success: false,
          message: "No image provided",
        });
      }
  
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${image}`,
        {
          folder: 'gallery',
          resource_type: 'image',
        }
      );
  
      if (!result || !result.url) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary',
        });
      }
  
      res.status(200).json({
        success: true,
        url: result.secure_url || result.url
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Image upload failed: ${error.message}`
      });
    }
  };