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
      const hash = await bcrypt.hash(password, 8);
      const user = new User({
        name,
        email,
        password: hash,
        isAuthor: false,
        isAdmin: false,
      });
      await user.save();

      return res.status(201).json({ success: true, userId: user._id });
    } else {
      // validation result failed
      const { email, password } = matchedData(req);
      return res.status(400).json({
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
      const user = await User.findOne({ email: email }).exec();
      if (user) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          req.session.user = { userId: user._id };
          return res.json({ success: true, user: user._id });
        } else {
          // User exists but invalid password

          const error = new Error();
          error.message = "Password is incorrect";
          error.status = 400;
          return res
            .status(400)
            .json({ errors: { ...error, message: error.message } });
        }
      } else {
        // User does not exist
        const error = new Error();
        error.message = "User does not exist. Please register first.";
        error.status = 400;
        return res.status(400).json({ errors: error });
      }
    } else {
      // validation errors
      res.status(400).json({ errors: result.array() });
    }
  }),
];

const logout_GET = (req, res, next) => {
  if (req.session.user) {
    const { userId } = req.session.user;
    req.session.destroy((err) => {
      if (err) return next(err);
      res
        .status(200)
        .json({
          success: true,
          message: `user: ${userId} logged out successfully`,
        });
    });
  } else {
    const error = new Error();
    error.message = "There is no logged in user";
    error.status = 400;
    res.status(400).json({ errors: error });
  }
};

module.exports = {
  signup_POST,
  login_POST,
  logout_GET,
};
