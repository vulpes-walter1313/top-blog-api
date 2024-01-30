const express = require("express");
const logger = require("morgan");
require("dotenv").config();
const indexRouter = require("./routes/index");
const postRouter = require("./routes/postRoutes");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const app = express();
const port = process.env.PORT || 3000;
async function main() {
  await mongoose.connect(process.env.MONGODB);
}
main().catch((err) => console.log(err));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // normally true in other tutorials but false could work
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB,
      collectionName: "sessions",
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "none",
    },
  }),
);

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