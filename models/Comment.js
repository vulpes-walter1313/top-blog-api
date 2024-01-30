const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    commentAuthor: { type: mongoose.Types.ObjectId, ref: "user" },
    postId: { types: mongoose.Types.ObjectId, ref: "post" },
    body: String,
  },
  { timestamps: true },
);

commentSchema.virtual("createdAtFormatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

commentSchema.virtual("updatedAtFormatted").get(function () {
  return DateTime.fromJSDate(this.updatedAt).toLocaleString(
    DateTime.DATETIME_MED,
  );
});

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;
