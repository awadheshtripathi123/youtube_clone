import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  RefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory 
} from "../controllers/user.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/authentication.js";
import { validate, registerSchema, loginSchema, updateAccountSchema, changePasswordSchema } from "../utils/validation.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1
    },
    {
      name: 'coverImage',
      maxCount: 1
    }
  ]),
  registerUser);

router.route("/login").post(validate(loginSchema), loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(RefreshAccessToken);
router.route("/change-password").post(verifyJWT, validate(changePasswordSchema), changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, validate(updateAccountSchema), updateAccountDetails);
router.route("/update-avatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route("/update-coverImage").patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
router.route("/watch-history").get(verifyJWT, getWatchHistory);

export { router as userRouter };
