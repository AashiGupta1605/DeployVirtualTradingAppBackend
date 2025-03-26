// import jwt from "jsonwebtoken";
// import User from "../models/UserModal.js";

// const userMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     const token = authHeader.split(" ")[1];

//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) {
//       return res.status(401).json({ message: "Invalid token" });
//     }

//     // Find the user
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("JWT Middleware Error:", error.message);
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };

// export default userMiddleware;

import jwt from "jsonwebtoken";
import User from "../models/UserModal.js";

const userMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in userMiddleware:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};

export default userMiddleware;

