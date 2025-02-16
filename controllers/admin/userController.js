import User from "../../models/UserModal.js";

export const getUsers = async (req, res) => {
  try {
    res.json(await User.find({ status: true }));
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = false;
    await user.save();
    res.json({ message: "User removed successfully (soft delete)" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    Object.keys(req.body).forEach(key => user[key] = req.body[key] ?? user[key]);
    user.updateDate = Date.now();
    res.json(await user.save());
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};