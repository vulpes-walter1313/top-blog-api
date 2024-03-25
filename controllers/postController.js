const asyncHandler = require("express-async-handler");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { body, validationResult, matchedData } = require("express-validator");
const { isAuthed, isAdmin } = require("../middleware/sessionMiddleware");

const posts_GET = asyncHandler(async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  const showComments = (req.query.comments || "").toLowerCase() === "true";
  // caps the limit to 20 to avoid abuse
  if (limit > 20) {
    limit = 20;
  }
  if (req.user) {
    if (req.user.isAdmin) {
      const totalCount = await Post.countDocuments({});
      const totalPages = Math.ceil(totalCount / limit);
      if (page > totalPages) {
        page = totalPages;
      }
      const posts = await Post.find({})
        .sort({ updatedAt: "desc" })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("author", "name")
        .exec();
      let postsWithCommentCount = [];
      if (showComments) {
        postsWithCommentCount = await Promise.all(
          posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({
              postId: post._id,
            });
            return { ...post.toObject(), commentCount };
          }),
        );
      }
      res.status(200).json({
        success: true,
        posts: showComments ? postsWithCommentCount : posts,
        totalPages: totalPages,
        currentPage: page,
      });
    } else {
      // user authenticated but not admin
      const totalCount = await Post.countDocuments({ isPublished: true });
      const totalPages = Math.ceil(totalCount / limit);
      if (page > totalPages) {
        page = totalPages;
      }
      const posts = await Post.find({})
        .where("isPublished")
        .equals(true)
        .sort({ updatedAt: "desc" })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate("author", "name -_id")
        .exec();

      let postsWithCommentCount = [];
      if (showComments) {
        postsWithCommentCount = await Promise.all(
          posts.map(async (post) => {
            const commentCount = await Comment.countDocuments({
              postId: post._id,
            });
            return { ...post.toObject(), commentCount };
          }),
        );
      }
      res.status(200).json({
        success: true,
        posts: showComments ? postsWithCommentCount : posts,
        totalPages: totalPages,
        currentPage: page,
      });
    }
  } else {
    // user not authenticated
    const totalCount = await Post.countDocuments({ isPublished: true });
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      page = totalPages;
    }
    const posts = await Post.find({})
      .where("isPublished")
      .equals(true)
      .sort({ updatedAt: "desc" })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("author", "name -_id")
      .exec();
    let postsWithCommentCount = [];
    if (showComments) {
      postsWithCommentCount = await Promise.all(
        posts.map(async (post) => {
          const commentCount = await Comment.countDocuments({
            postId: post._id,
          });
          return { ...post.toObject(), commentCount };
        }),
      );
    }
    res.status(200).json({
      success: true,
      posts: showComments ? postsWithCommentCount : posts,
      totalPages: totalPages,
      currentPage: page,
    });
  }
});

const posts_POST = [
  isAuthed,
  isAdmin,
  body("title").isLength({ min: 3, max: 140 }).escape(),
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
      const published = data.isPublished;

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
  body("title").isLength({ min: 3, max: 140 }).escape(),
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
     * @typedef {Object} PostPayload
     * @property {string} title
     * @property {string} body
     * @property {boolean} isPublished
     */
    /**@type PostPayload */
    const data = matchedData(req);
    if (result.isEmpty()) {
      const post = await Post.findById(req.params.postId)
        .populate("author")
        .exec();
      post.title = data.title;
      post.body = data.body;
      post.isPublished = data.isPublished;
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
    // Delete all comments of a post, if any
    try {
      await Comment.deleteMany({ postId: req.params.postId });
    } catch (err) {
      return next(err);
    }
    // Once there are no more comments, delete post
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
    const limit = 10;
    let page = parseInt(req.query.page) || 1;

    const post = await Post.exists({ _id: req.params.postId }).exec();
    if (!post) {
      // if post doesn't exists then quit before fetching comments.
      const error = new Error();
      error.status = 404;
      error.message = "That post doesn't exist";
      return next(error);
    }
    const totalCount = await Comment.countDocuments({
      postId: req.params.postId,
    }).exec();
    const totalPages = Math.ceil(totalCount / limit);
    if (page > totalPages) {
      page = totalPages;
    }
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ updatedAt: "desc" })
      .limit(limit)
      .skip((page - 1) * limit)
      .populate("commentAuthor", "name")
      .exec();
    if (comments) {
      return res.status(200).json({
        success: true,
        comments: comments,
        numComments: totalCount,
        totalPages: totalPages,
        currentPage: page,
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

const comments_DELETE = [
  isAuthed,
  asyncHandler(async (req, res, next) => {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId)
      .populate("commentAuthor")
      .exec();
    if (!comment) {
      const error = new Error();
      error.status = 404;
      error.message = `Comment: ${commentId} doesn't exist.`;
      return next(error);
    }
    if (req.user.isAdmin || comment.commentAuthor.id === req.user.id) {
      await Comment.findByIdAndDelete(commentId);
      return res.status(200).json({
        success: true,
        message: `comment: ${comment._id} has been deleted`,
      });
    } else {
      const error = new Error();
      error.status = 403;
      error.message = "You don't have the permissions to perform this action";
      return next(error);
    }
  }),
];

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
