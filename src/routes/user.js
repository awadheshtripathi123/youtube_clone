import { registerUser, loginUser, logoutUser, RefreshAccessToken } from "../controllers/user.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/authentication.js";

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

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(RefreshAccessToken);

export { router as userRouter };
