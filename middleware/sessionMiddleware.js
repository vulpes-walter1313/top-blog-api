const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const getUserFromSession = asyncHandler(async (req, res, next) => {
  if (req.session.user) {
    const user = await User.findById(req.session.user.userId).exec();
    req.user = user;
    return next();
  } else {
    return next();
  }
});

module.exports = {
  getUserFromSession,
};
