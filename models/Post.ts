import mongoose, { Types } from "mongoose";
import { DateTime } from "luxon";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: String,
    body: String,
    author: { type: Types.ObjectId, ref: "user", required: true },
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

export default Post;
