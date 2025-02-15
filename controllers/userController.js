import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ status: true }); // Fetch only active users
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


// Get user by ID
export const getUserById = async (req, res) => {
  // try {
  //   const user = await User.findById(req.params.id);
  //   if (user) {
  //     res.json(user);
  //   } else {
  //     res.status(404).json({ message: "User not found" });
  //   }
  // } catch (error) {
  //   res.status(500).json({ message: "Server Error" });
  // }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.status = false;
      await user.save();
      res.json({ message: "User removed successfully (soft delete)" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};


// Update user
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobile = req.body.mobile || user.mobile;
      user.gender = req.body.gender || user.gender;
      user.dob = req.body.dob || user.dob;
      user.status = req.body.status ?? user.status;
      user.orgtype = req.body.orgtype || user.orgtype;
      user.updateDate = Date.now();

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};
