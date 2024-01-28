import express from "express";
import postController from "../controllers/postController";

const router = express.Router();

router.get("/posts", postController.posts_GET);

router.post("/posts", postController.posts_POST);

router.get("/posts/:postId", postController.post_GET);

router.put("/posts/:postId", postController.post_PUT);

router.delete("/posts/:postId", postController.post_DELETE);

router.get("/posts/:postId/comments", postController.comments_GET);

router.post("/posts/:postId/comments", postController.comments_POST);

router.delete(
  "/posts/:postId/comments/:commentId",
  postController.comments_POST,
);

export default router;
