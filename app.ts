import express, { type Express, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import "dotenv/config";
import indexRouter from "./routes/index";
import postRouter from "./routes/postRoutes";
import mongoose from "mongoose";

const app: Express = express();
const port = process.env.PORT || 3000;
async function main() {
  await mongoose.connect(process.env.MONGODB as string);
}
main().catch((err) => console.log(err));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use(postRouter);

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM signal reveiced: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
  });
});
