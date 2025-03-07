// config/config.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },
  frontend: {
    url: process.env.FRONTEND_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export { config, validateConfig };