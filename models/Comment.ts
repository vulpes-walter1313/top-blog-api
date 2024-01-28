import mongoose, { Types } from "mongoose";
import {DateTime} from 'luxon';
const {Schema} = mongoose;

const commentSchema = new Schema({
  commentAuthor: {type: Types.ObjectId, ref: 'user'},
  postId: { types: Types.ObjectId, ref: "post"},
  body: String,
}, {timestamps: true});

commentSchema.virtual("createdAtFormatted").get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(
    DateTime.DATETIME_MED
  );
});

commentSchema.virtual("updatedAtFormatted").get(function () {
  return DateTime.fromJSDate(this.updatedAt).toLocaleString(
    DateTime.DATETIME_MED
  );
});