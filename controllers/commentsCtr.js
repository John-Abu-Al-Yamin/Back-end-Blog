const asyncHandler = require("express-async-handler");
const {
  Comments,
  validateCreateComment,
  validateUpdateComment,
  Comment,
} = require("../models/Comment");
const { User } = require("../models/User");

// Create New Comment
// Route /api/comments
// method POST  (Only Logged In User)
module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateCreateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const profile = await User.findById(req.user.id);

  const comment = await Comments.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.username,
  });

  res.status(201).json(comment);
});

// GET All Comment
// Route /api/comments
// method Get  (Only Admin)
module.exports.getAllCommentCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user");
  res.status(200).json(comments);
});

// Delete Comment
// Route /api/comments/:id
// method Get  (Only Admin)
module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await Comments.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "Comment Not Found" });
  }

  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comments.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "comment has been deleted" });
  } else {
    res.status(403).json({ message: "access denied, not allowed" });
  }
});

// Update Comment
// Route /api/comments/:id
// method PUT  (Only Owner )
module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({ message: "comment Not found" });
  }

  if (req.user.id !== comment.user.toString()) {
    return res.status(403).json({
      message: "access denied, only user himself can edit tihs comment",
    });
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        text: req.body.text,
      },
    },
    { new: true }
  );
  res.status(200).json(updatedComment);
});
