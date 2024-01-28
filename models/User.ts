import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  isAuthor: Boolean,
  isAdmin: Boolean,
});

const User = mongoose.model("user", userSchema);

export default User;
