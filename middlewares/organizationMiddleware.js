// import jwt from "jsonwebtoken";
// import OrgRegistration from "../models/OrgRegisterModal.js";

// const authMiddleware = async (req, res, next) => {
//   // Get the token from the request headers
//   const token = req.header("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Access denied. No token provided." });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Check if the organization exists in the database
//     const organization = await OrgRegistration.findById(decoded.orgId);
//     if (!organization) {
//       return res.status(404).json({ success: false, message: "Organization not found." });
//     }

//     // Attach the organization to the request object
//     req.organization = organization;
//     next(); // Proceed to the next middleware or route handler
//   } catch (error) {
//     console.error("Error in authMiddleware:", error);
//     res.status(400).json({ success: false, message: "Invalid token." });
//   }
// };

// export default authMiddleware;






import jwt from "jsonwebtoken";
import OrgRegistration from "../models/OrgRegisterModal.js";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const organization = await OrgRegistration.findById(decoded.orgId);
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found." });
    }
    req.organization = organization;
    next();
  } catch (error) {
    console.error("Error in authMiddleware:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    res.status(400).json({ success: false, message: "Invalid token." });
  }
};


export default authMiddleware;