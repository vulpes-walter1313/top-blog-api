const { body, validationResult, matchedData } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const signup_POST = [
  body("name").isLength({ min: 1, max: 24 }).escape(),
  body("email").isEmail().escape(),
  body("password").isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      const { name, email, password } = matchedData(req);
      // console.log(email, password);
      const hash = await bcrypt.hash(password, 8);
      const user = new User({
        name,
        email,
        password: hash,
        isAuthor: false,
        isAdmin: false,
      });
      await user.save();

      res.json({ success: true, userId: user._id });
    } else {
      // validation result failed
      console.log("validation result failed");
      const { email, password } = matchedData(req);
      console.log(email, password);
      res.status(400).json({
        errors: result.array(),
      });
    }
  }),
];

const login_POST = [
  body("email").isEmail().escape(),
  body("password").isLength({ min: 6 }),
  asyncHandler(async (req, res) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      const { email, password } = matchedData(req);
      const user = await User.find({ email: email }).exec();
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          req.session.user = { userId: user._id}
        }
      }
    }
  }),
];

module.exports = {
  signup_POST,
  login_POST,
};
