import { Router } from "express";
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.js";
import { verifyJWT } from "../middlewares/authentication.js";
import { validate, addCommentSchema } from "../utils/validation.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, validate(addCommentSchema), addComment).get(getVideoComments);
router.route("/:commentId").patch(verifyJWT, updateComment).delete(verifyJWT, deleteComment);

export { router as commentRouter };
