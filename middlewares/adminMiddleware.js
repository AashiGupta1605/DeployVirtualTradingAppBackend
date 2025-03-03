import jwt from 'jsonwebtoken';
import User from '../models/UserModal.js'; // Adjust path as needed

const adminMiddleware = async (req, res, next) => {
  try {
    // Check for token in headers
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default adminMiddleware;