const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { body, validationResult, matchedData } = require("express-validator");
const { isAuthed, isAdmin } = require("../middleware/sessionMiddleware");

const posts_GET = asyncHandler(async (req, res) => {
  if (req.user) {
    if (req.user.isAdmin) {
      const posts = await Post.find({})
        .sort({ createdAt: "desc" })
        .limit(20)
        .populate("author", "name")
        .exec();
      res.status(200).json({ success: true, posts: posts });
    } else {
      // user authenticated but not admin
      const posts = await Post.find({})
        .where("isPublished")
        .equals(true)
        .sort({ createdAt: "desc" })
        .limit(20)
        .populate("author", "name -_id")
        .exec();
      res.status(200).json({ success: true, posts: posts });
    }
  } else {
    // user not authenticated
    const posts = await Post.find({})
      .where("isPublished")
      .equals(true)
      .sort({ createdAt: "desc" })
      .limit(20)
      .populate("author", "name -_id")
      .exec();
    res.status(200).json({ success: true, posts: posts });
  }
});

const posts_POST = [
  isAuthed,
  isAdmin,
  body("title").isLength({ min: 3, max: 60 }).escape(),
  body("body").notEmpty().escape(),
  body("isPublished").isBoolean(),
  asyncHandler(async (req, res) => {
    const result = validationResult(req);
    /**
     * @typedef {Object} data
     * @property {string} title
     * @property {string} body
     * @property {string} isPublished
     */
    const data = matchedData(req);
    if (result.isEmpty()) {
      const { title, body } = data;
      const published = data.isPublished === "true" ? true : false;

      const post = new Post({
        title: title,
        body: body,
        author: req.user,
        isPublished: published,
      });
      await post.save();
      res
        .status(201)
        .json({ success: true, message: `New post created: ${post._id}` });
    } else {
      // validation errors
      res.status(400).json({ success: false, errors: result.array() });
    }
  }),
];

const post_GET = asyncHandler(async (req, res) => {
  let post = null;
  try {
    post = await Post.findById(req.params.postId)
      .populate("author", "name -_id")
      .exec();
  } catch (err) {
    return res.status(400).json({ success: false, errors: err });
  }
  if (!post) {
    // if post doesn't exist
    const error = new Error();
    error.status = 404;
    error.message = "Post by that id was not found";
    return res.status(404).json({ success: false, errors: error });
  }

  if (post.isPublished || (req.user && req.user.isAdmin)) {
    // if the post is public or user is admin
    res.status(200).json({ success: true, post: post });
  } else {
    res.status(403).json({
      success: true,
      errors: {
        status: 403,
        message:
          "You either need to authenticate, or if you are authenticated, you don't have permissions to view this resource.",
      },
    });
  }
});

const post_PUT = [
  isAuthed,
  body("title").isLength({ min: 3, max: 60 }).escape(),
  body("body").notEmpty().escape(),
  body("isPublished").isBoolean(),
  asyncHandler(async (req, res) => {
    if (!req.user.isAuthor) {
      // if the user is not the author
      return res.status(403).json({
        success: false,
        errors: {
          status: 403,
          message: "You don't have the permissions to use this resource",
        },
      });
    }
    const result = validationResult(req);
    /**
     * @typedef {Object} data
     * @property {string} title
     * @property {string} body
     * @property {string} isPublished
     */
    const data = matchedData(req);
    if (result.isEmpty()) {
      const post = await Post.findById(req.params.postId)
        .populate("author")
        .exec();
      post.title = data.title;
      post.body = data.body;
      post.isPublished = data.isPublished === "true" ? true : false;
      await post.save();
      res
        .status(200)
        .json({ success: true, message: `post: ${post._id} updated` });
    } else {
      // validation failed
      return res.status(400).json({ success: false, errors: result.array() });
    }
  }),
];

const post_DELETE = [
  isAuthed,
  isAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      await Post.findByIdAndDelete(req.params.postId).exec();
      return res.status(200).json({
        success: true,
        message: `Post: ${req.params.postId} successfully deleted`,
      });
    } catch (err) {
      err.status = 400;
      return next(err);
    }
  }),
];

const comments_GET = [
  asyncHandler(async (req, res, next) => {
    const post = await Post.exists({ _id: req.params.postId }).exec();
    if (!post) {
      const error = new Error();
      error.status = 404;
      error.message = "That post doesn't exist";
      return next(error);
    }
    const comments = await Comment.find({ postId: req.params.postId })
      .populate("commentAuthor", "name")
      .exec();
    if (comments) {
      return res.status(200).json({
        success: true,
        comments: comments,
        numComments: comments.length,
      });
    } else {
      const error = new Error();
      error.status = 404;
      error.message = "post not found";
      return next(error);
    }
  }),
];

const comments_POST = [
  isAuthed,
  body("body").notEmpty().escape(),
  asyncHandler(async (req, res) => {
    const result = validationResult(req);
    /**
     * data from comments POST route
     * @typedef {Object} CommentData
     * @property {string} body
     */
    /**
     * @type {CommentData}
     */
    const data = matchedData(req);
    if (result.isEmpty()) {
      const post = await Post.findById(req.params.postId).exec();
      if (!post) {
        const error = new Error();
        error.status = 404;
        error.message = "Post you wish to comment on doesn't exist";
        next(error);
      } else {
        // post does exist
        const comment = new Comment({
          commentAuthor: req.user._id,
          postId: post._id,
          body: data.body,
        });
        await comment.save();
        res.status(201).json({
          success: true,
          message: `Comment: ${comment._id} was just saved on Post: ${post._id}`,
        });
      }
    } else {
      // validation errors
      next(result.array());
    }
  }),
];

const comments_DELETE = (req, res) => {
  res.send("DELETE -> /posts/:postId/commentsi/:commentId");
};

module.exports = {
  posts_GET,
  posts_POST,
  post_GET,
  post_PUT,
  post_DELETE,
  comments_GET,
  comments_POST,
  comments_DELETE,
};
