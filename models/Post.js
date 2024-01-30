const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: String,
    body: String,
    author: { type: mongoose.Types.ObjectId, ref: "user", required: true },
    isPublished: Boolean,
  },
  { timestamps: true },
);

postSchema.virtual("createdAtFormatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

postSchema.virtual("updatedAtFormatted").get(function () {
  return DateTime.fromJSDate(this.updatedAt).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

const Post = mongoose.model("post", postSchema);

module.exports = Post;
