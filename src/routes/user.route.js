import { Router } from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { JWTVerify } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured routes

router.route("/logout").post(JWTVerify, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(JWTVerify, changeCurrentPassword);

router.route("/user").get(JWTVerify, getCurrentUser);

router.route("/update-details").patch(JWTVerify, updateAccoutDetails);

router
  .route("/update-avatar")
  .patch(upload.single("avatar"), JWTVerify, updateUserAvatar);

router
  .route("/update-coverimage")
  .patch(upload.single("coverImage"), JWTVerify, updateUserCoverImage);

export default router;
