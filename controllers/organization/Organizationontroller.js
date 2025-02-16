import bcrypt from 'bcrypt';
import OrgRegistration from '../../models/OrgRegisterModal.js';
import organizationValidationSchema from '../../helpers/joiValidation.js';
import organizationLoginValidationSchema from '../../helpers/joiValidation.js';
export const registerOrganization = async (req, res) => {
  const { name, address, website, contactPerson, email, mobile, approvalStatus, password } = req.body;

  // Validate the request body
  const { error } = organizationValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if the organization already exists
    const existingOrg = await OrgRegistration.findOne({ email });
    if (existingOrg) {
      return res.status(400).json({ message: "Organization already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new organization
    const newOrg = new OrgRegistration({
      name,
      address,
      website,
      contactPerson,
      email,
      mobile,
      approvalStatus,
      password: hashedPassword
    });

    // Save the organization to the database
    await newOrg.save();

    res.status(201).json({ message: "Organization registered successfully!" });
  } catch (error) {
    console.error("Error registering organization:", error);
    res.status(500).json({ message: "Server error" });
  }
};




// export const loginOrganization = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate the request body
//   const { error } = organizationLoginValidationSchema.validate(req.body);
//   if (error) {
//     return res.json({ message: error.details[0].message });
//   }

//   try {
//     // Check if the organization exists
//     const existingOrg = await OrgRegistration.findOne({ email });
//     if (!existingOrg) {
//       return res.json({ message: "Invalid email or password" });
//     }


//       // Compare the password
//       const isPasswordValid = await bcrypt.compare(password, existingOrg.password);
//       if (!isPasswordValid) {
//         return res.json({ message: "Invalid email or password" });
//       }
      

//     // Check approval status
//     if (existingOrg.approvalStatus === "pending") {
//       return res.json({ message: "Your request is pending approval by the admin." });
//     } else if (existingOrg.approvalStatus === "rejected") {
//       return res.json({ message: "Your request has been rejected by the admin." });
//     }

  
//     // Login successful
//     res.status(200).json({ message: "Login successful" });
//   } catch (error) {
//     console.error("Error during login:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };


export const loginOrganization = async (req, res) => {
  const { email, password } = req.body;

  // Validate the request body
  const { error } = organizationLoginValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    // Check if the organization exists
    const existingOrg = await OrgRegistration.findOne({ email });
    if (!existingOrg) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, existingOrg.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    // Check approval status
    if (existingOrg.approvalStatus === "pending") {
      return res.status(400).json({ success: false, message: "Your request is pending approval by the admin." });
    } else if (existingOrg.approvalStatus === "rejected") {
      return res.status(400).json({ success: false, message: "Your request has been rejected by the admin." });
    }

    // Login successful
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};