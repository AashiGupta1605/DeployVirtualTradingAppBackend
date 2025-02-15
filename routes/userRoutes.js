import express from "express";
import { getUsers, getUserById, deleteUser, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.route("/").get(getUsers);
router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

export default router;
