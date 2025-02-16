import express from "express";
import { getUsers, deleteUser, updateUser } from "../../controllers/admin/userController.js";

const router = express.Router();

router.route("/").get(getUsers);
router.route("/:id").put(updateUser).delete(deleteUser);

export default router;