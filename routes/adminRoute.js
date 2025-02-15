import express from 'express';
import NiftyData from '../models/NiftyData.js';  // Import the NiftyData model

const router = express.Router();

// Endpoint to save data to MongoDB
router.post('/', async (req, res) => {
  try {
    const { name, value } = req.body;  // Assuming the data being sent is { name, value }
    const newData = new NiftyData({ name, value });
    await newData.save();  // Save the data to MongoDB
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
});


export default router;
