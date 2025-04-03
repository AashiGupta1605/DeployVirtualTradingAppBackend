import express from 'express'
import { addGalleryItem, updateGalleryItem, updateGalleryItembyPatch, deleteGalleryItem, deleteAllGalleryItems, displayGalleryItems, permanentDeleteGalleryItem, displayDeletedGalleryItems } 
from "../../../controllers/admin/galleryDataController.js";

const router = express.Router();

router.get('/getGalleryItems/:search', displayGalleryItems)
router.get('/getGalleryItems', displayGalleryItems)
router.post('/addGalleryItem', addGalleryItem)
router.put('/updateGalleryItem/:id', updateGalleryItem);
router.patch('updateGalleryItembyPatch/:id',updateGalleryItembyPatch)
router.patch('/deleteGalleryItem/:id', deleteGalleryItem);
router.patch('/deleteAllGalleryItems', deleteAllGalleryItems);

export default router;