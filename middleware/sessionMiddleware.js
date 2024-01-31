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

const isAuthed = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else {
    const error = new Error();
    error.message =
      "You're not authenticated. Pleace login before using this resource";
    error.status = 401;
    res.status(401).json({ success: false, errors: error });
  }
};

const isAdmin = (req, res, next) => {
  // this middleware relies on the fact that the auth status has
  // been checked and the user is authenticated.
  if (req.user.isAdmin) {
    return next();
  } else {
    const error = new Error();
    error.message =
      "You don't have the admin privilages needed to use this resource.";
    error.status = 403;
    res.status(403).json({ success: false, errors: error });
  }
};

module.exports = {
  getUserFromSession,
  isAuthed,
  isAdmin,
};
