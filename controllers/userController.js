const asyncHandler = require("express-async-handler");
const { isAuthed } = require("../middleware/sessionMiddleware");

const currentUser_GET = [
  isAuthed,
  asyncHandler(async (req, res, next) => {
    res.json({ success: true, userId: req.user._id });
  }),
];

module.exports = {
  currentUser_GET,
};
