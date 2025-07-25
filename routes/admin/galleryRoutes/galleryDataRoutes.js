import express from 'express'
// import multer from 'multer';

import { addGalleryItem,uploadImage, updateGalleryItem, updateGalleryItembyPatch, deleteGalleryItem, deleteAllGalleryItems, displayGalleryItems, permanentDeleteGalleryItem, displayDeletedGalleryItems } 
from "../../../controllers/admin/galleryDataController.js";

// Configure multer for memory storage (file stays in memory)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 15 * 1024 * 1024, // 15MB limit
//     files: 1
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed!'), false);
//     }
//   }
// });

const router = express.Router();
router.post('/uploadImage', uploadImage);
router.get('/getGalleryItems/:search', displayGalleryItems)
router.get('/getGalleryItems', displayGalleryItems)
router.post('/addGalleryItem', addGalleryItem)
// router.post('/addGalleryItem', upload.single('photo'), addGalleryItem)
router.patch('/updateGalleryItembyPatch/:id', updateGalleryItembyPatch)
router.put('/updateGalleryItem/:id', updateGalleryItem);
router.patch('/deleteGalleryItem/:id', deleteGalleryItem);
router.patch('/deleteAllGalleryItems', deleteAllGalleryItems);

export default router;