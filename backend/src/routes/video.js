import { Router } from "express";
import {
  publishVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getUserVideos,
} from "../controllers/video.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/authentication.js";
import { validate, publishVideoSchema, updateVideoSchema } from "../utils/validation.js";

const router = Router();

router.route("/publish").post(
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  validate(publishVideoSchema),
  publishVideo
);

router.route("/").get(getAllVideos);
router.route("/user/:userId").get(getUserVideos);
router.route("/:videoId").get(getVideoById);
router.route("/:videoId").patch(verifyJWT, upload.single("thumbnail"), validate(updateVideoSchema), updateVideo);
router.route("/:videoId").delete(verifyJWT, deleteVideo);
router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus);

export { router as videoRouter };