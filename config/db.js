// config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB connection string is not defined in environment variables');
    }

    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: false // Disable automatic index creation
    });

    console.log('✅ MongoDB Connected:', connection.connection.host);
    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export default connectDB;