import express from 'express'
import { addGalleryCategory, updateGalleryCategory, deleteAllGalleryCategories, deleteGalleryCategory, displayGalleryCategories } 
from "../../../controllers/admin/galleryCategoryController.js";

const router = express.Router();

router.get('/getGalleryCategories/:sortBy/:order', displayGalleryCategories)
router.get('/getGalleryCategories/:search/:sortBy/:order', displayGalleryCategories)
router.post('/addGalleryCategory', addGalleryCategory)
router.put('/updateGalleryCategory/:id', updateGalleryCategory);
router.patch('/deleteGalleryCategory/:id', deleteGalleryCategory);
router.patch('/deleteAllGalleryCategories', deleteAllGalleryCategories);

export default router;