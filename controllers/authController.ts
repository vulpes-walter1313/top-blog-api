import { type Request, type Response, type NextFunction } from "express";

const signup_POST = (req: Request, res: Response) => {
  res.send("POST -> /signup is not yet implemented");
};

const login_POST = (req: Request, res: Response) => {
  res.send("POST -> /signup is not yet implemented");
};

export default {
  signup_POST,
  login_POST,
};
