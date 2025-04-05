import multer from 'multer';

// Configure multer for memory storage (file stays in memory)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

import express from 'express'
import { addGalleryItem, updateGalleryItem, updateGalleryItembyPatch, deleteGalleryItem, deleteAllGalleryItems, displayGalleryItems, permanentDeleteGalleryItem, displayDeletedGalleryItems } 
from "../../../controllers/admin/galleryDataController.js";

const router = express.Router();

router.get('/getGalleryItems/:search', displayGalleryItems)
router.get('/getGalleryItems', displayGalleryItems)
// router.post('/addGalleryItem', addGalleryItem)
router.post('/addGalleryItem', upload.single('photo'), addGalleryItem)
router.put('/updateGalleryItem/:id', updateGalleryItem);
router.patch('updateGalleryItembyPatch/:id',updateGalleryItembyPatch)
router.patch('/deleteGalleryItem/:id', deleteGalleryItem);
router.patch('/deleteAllGalleryItems', deleteAllGalleryItems);

export default router;