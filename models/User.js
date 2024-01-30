const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  isAuthor: Boolean,
  isAdmin: Boolean,
});

const User = mongoose.model("user", userSchema);

module.exports = User;
