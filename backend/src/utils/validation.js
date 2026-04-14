import { z } from "zod";
import { ApiError } from "./ApiError.js";

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        throw new ApiError(400, "Validation failed", errors);
      }
      throw new ApiError(500, "Internal validation error");
    }
  };
};

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  username: z.string().optional(),
  password: z.string().min(1, "Password is required"),
}).refine((data) => data.email || data.username, {
  message: "Email or username is required",
});

const updateAccountSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email("Invalid email format").optional(),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const publishVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

const updateVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});

const createTweetSchema = z.object({
  content: z.string().min(1, "Content is required").max(280, "Content must not exceed 280 characters"),
});

const addCommentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  parentCommentId: z.string().optional(),
});

const createPlaylistSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const updatePlaylistSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

const addVideoToPlaylistSchema = z.object({
  videoId: z.string().min(1, "Video id is required"),
});

export {
  validate,
  registerSchema,
  loginSchema,
  updateAccountSchema,
  changePasswordSchema,
  publishVideoSchema,
  updateVideoSchema,
  createTweetSchema,
  addCommentSchema,
  createPlaylistSchema,
  updatePlaylistSchema,
  addVideoToPlaylistSchema,
};
