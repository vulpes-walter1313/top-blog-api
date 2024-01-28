import { type Request, type Response, type NextFunction } from "express";
const posts_GET = (req: Request, res: Response) => {
  res.send("GET -> /posts is not implemented yet");
};

const posts_POST = (req: Request, res: Response) => {
  res.send("POST -> /posts is not implemented yet");
};

const post_GET = (req: Request, res: Response) => {
  res.send(`GET => /posts/${req.params.postId} is not implemented yet`);
};

const post_PUT = (req: Request, res: Response) => {
  res.send("PUT => /posts/:postId is not implemented yet");
};

const post_DELETE = (req: Request, res: Response) => {
  res.send("DELETE => /posts/:postId is not implemented yet");
};

const comments_GET = (req: Request, res: Response) => {
  res.send("GET -> /posts/:postId/comments");
};

const comments_POST = (req: Request, res: Response) => {
  res.send("POST -> /posts/:postId/comments");
};

const comments_DELETE = (req: Request, res: Response) => {
  res.send("DELETE -> /posts/:postId/commentsi/:commentId");
};

export default {
  posts_GET,
  posts_POST,
  post_GET,
  post_PUT,
  post_DELETE,
  comments_GET,
  comments_POST,
  comments_DELETE,
};
