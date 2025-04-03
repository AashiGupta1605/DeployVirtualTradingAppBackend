import galleryCategory from "../../models/GalleryCategoryModal.js";

export const addGalleryCategory = async(req, res) => {
    try{
        const {name} =req.body;
        if(name && name.length<=25){
            const data = await galleryCategory.findOne({name}); 
            if(data==null){
                const category = new galleryCategory({name, createdDate: new Date()})
                await category.save();
                res.status(201).json({success:true, message:`New Category - ${name} added successfully...`, category});
            }
            else
            res.status(409).json({success:false, message:`Category ${name} already exists...`})
        }
        else
        res.status(409).json({success:false, message:"Enter Category Name Properly..."});
    }
    catch(error){
        console.error("Add Gallery Category Error: ", error)
        res.status(500).json({success:false, message:`Failed to add category...${error.message}`, error:error.message})
    }
}

export const updateGalleryCategory = async (req, res) => {
    try {
        const {id} = req.params;
        const { name } = req.body;

        if(!id)
        return res.status(500).json({ success: false, message: "Server Error: ID required." });
            
        if(!name)
        return res.status(409).json({ success: false, message: "Category Name is required for Update." });
        
        if(name.length>25)
        return res.status(409).json({ success: false, message: "Category Name must not be more than of 25 characters." });

        const existingID = await galleryCategory.findOne({ _id: id, isDeleted: false });
            
        if (!existingID) {
            return res.status(409).json({ success: false, message: "Category not found." });
        } 

        const existingCategory = await galleryCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isDeleted: false, _id: { $ne: id } });

        if (existingCategory) {
            return res.status(409).json({ success: false, message: `Category '${name}' already exists.` });
        }
        
        const updatedCategory = await galleryCategory.findByIdAndUpdate(
            // { _id: id, isDeleted: false },
            id,
            { 
                name: name, 
                updatedDate: new Date()
            },
            { new: true } // Return the updated document
        );

        if (!updatedCategory) {
            return res.status(500).json({ success: false, message: "Category updation unsuccessful." });
        }
        
        res.status(201).json({success: true, message: "Category updated successfully.", updatedCategory });

    } 
    catch (error) {
        console.error("Update Gallery Category Error:", error);
        res.status(500).json({ success: false, message: `Failed to update category: ${error.message}`, error:error.message});
    }
};

export const deleteGalleryCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // let filter = { isDeleted: false };

        if (!id) {
            return res.status(500).json({ success: false, message: "Server Error: Category ID required." });
        } 
        else {
            // const existingCategory = await galleryCategory.find(filter).findById(id);  --wrong
            const existingCategory = await galleryCategory.findOne({_id: id, isDeleted: false});

            if (!existingCategory) {
                return res.status(409).json({ success: false, message: "Category not found." });
            } 
            else {
                // Perform deletion (soft delete)
                const deletedCategory = await galleryCategory.findOneAndUpdate(
                    {_id: id, isDeleted: false},
                    {
                        isDeleted: true,
                        deletedDate: new Date()
                    },
                    { new: true } // Return the updated document
                );

                if (!deletedCategory) {
                    return res.status(500).json({ success: false, message: "Failed to delete category." });
                } 
                else {
                    return res.status(201).json({
                        success: true,
                        message: "Category deleted successfully.",
                        deletedCategory
                    });
                }
            }
        }
    } 
    catch (error) {
        console.error("Delete Gallery Category Error:", error);
        return res.status(500).json({ success: false, message: `Failed to delete category: ${error.message}`, error: error.message });
    }
};

export const deleteAllGalleryCategories = async (req, res) => {
    try {
        let filter = { isDeleted: false };

        // const categoriesCount = await galleryCategory.find(filter).countDocuments();  --wrong
        const categoriesCount = await galleryCategory.countDocuments(filter);
        
        if (categoriesCount === 0) {
            return res.status(409).json({ success: false, message: "No categories found to delete." });
        } 
        else {
            // Perform soft delete on all categories
            const deletedCategories = await galleryCategory.updateMany(
                filter,
                {
                    isDeleted: true,
                    deletedDate: new Date()
                }
            );

            if (deletedCategories.modifiedCount === 0) {
                return res.status(500).json({ success: false, message: "Failed to delete categories." });
            } 
            else {
                return res.status(201).json({
                    success: true,
                    message: "All categories deleted successfully.",
                    deletedCount: deletedCategories.modifiedCount
                });
            }
        }
    } 
    catch (error) {
        console.error("Delete All Gallery Categories Error:", error);
        return res.status(500).json({ success: false, message: `Failed to delete categories: ${error.message}`, error: error.message });
    }
};

export const displayGalleryCategories = async (req, res) => {
    try {
        const { search, sortBy="createdDate", order="decreasing" } = req.params;

        let filter = { isDeleted: false };
        let categoryData = [];

        const validSortOrder = order === "increasing" ? 1 : -1;
        const validSortBy = ["name", "createdDate", "updatedDate"].includes(sortBy) ? sortBy : "createdDate";

        if (search && search.trim() !== "" && search !== "all") {
            // First, try finding categories that start with the search term
            categoryData = await galleryCategory.find({
                ...filter,
                name: { $regex: new RegExp("^" + search, "i") }
            }).sort({ [validSortBy]: validSortOrder });

            if (categoryData.length > 0) {
                return res.status(201).json({
                    success: true,
                    message: "Gallery categories retrieved successfully.",
                    categoryData
                });
            }

            // If no exact match found, modify filter to search anywhere in the name
            categoryData = await galleryCategory.find({
                ...filter,
                name: { $regex: new RegExp(search, "i") }
            }).sort({ [validSortBy]: validSortOrder });
        } 
        else {
            categoryData = await galleryCategory.find(filter).sort({ [validSortBy]: validSortOrder });;
        }

        return res.status(201).json({
            success: true,
            message: "Gallery categories retrieved successfully.",
            categoryData
        });
    } 
    catch (error) {
        console.error("Error in getting gallery category data:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to get gallery category data: ${error.message}`,
            error: error.message
        });
    }
};

export const permanentDeleteGalleryCategory = async(req, res) => {
    try{

    }
    catch(error){
        
    }
}

export const displayDeletedGalleryCategories = async(req, res) => {
    try{

    }
    catch(error){
        
    }
}