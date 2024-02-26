const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");
// Create New Posts
// Route /api/posts
// method POST  (Only Logged In User)
module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  // 1. validation Image
  if (!req.file) {
    return res.status(400).json({ message: "no image Provided" });
  }

  // 2. validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 3.Upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // 4. create New post and Save it to db
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // 5. Send Response to the Client
  res.status(200).json(post);

  // 6. Rewmove image fro server
  fs.unlinkSync(imagePath);
});

// Get All Posts
// Route /api/posts
// method GET  (Public)
module.exports.getAllPostCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

// Get Single Posts
// Route /api/posts
// method GET  (Public)
module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");
  if (!post) {
    return res.status(404).json({ message: "post Not Found" });
  }
  res.status(200).json(post);
});

// Get Count Posts
// Route /api/posts/count
// method GET  (Public)
module.exports.getCountPostCtrl = asyncHandler(async (req, res) => {
  const count = await Post.count();
  res.status(200).json(count);
});

// Deleted Posts
// Route /api/posts/id
// method DELETE  (Only admin owner of the post)
module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post Not Found" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    //  Delete all comments that belong to This post
    await Comment.deleteMany({ postId: post._id });

    res
      .status(200)
      .json({ message: "post has deleted successfulluy", postId: post._id });
  } else {
    res.status(403).json({ message: "access denied , frobidden" });
  }
});

// Update Posts
// Route /api/posts
// method PUT  (Only Owner of the post)
module.exports.updatePostsCtrl = asyncHandler(async (req, res) => {
  // validation
  const { erroe } = validateUpdatePost(req.body);
  if (erroe) {
    return res.status(400).json({ message: erroe.details[0].message });
  }

  // Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post Not Found" });
  }

  // check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // Update Post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  // send res to Client
  return res.status(200).json(updatedPost);
});

// Update Posts Image
// Route /api/posts/upload-image/:id
// method PUT  (Only Owner of the post)
module.exports.updatePostsImageCtrl = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(400).json({ message: "No image Provided" });
  }

  // Get the post from DB and check if post exist
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  // check if this post belong to logged in user
  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "access denied, you are not allowed" });
  }

  // Delete The old Post image
  await cloudinaryRemoveImage(post.image.publicId);
  //upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // update image DB
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  // send res to Client
  res.status(200).json(updatedPost);

  // Remover image from the DB
  fs.unlinkSync(imagePath);
});

// Toogle Likes
// Route /api/posts/like/:id
// method PUT  (Only Loggedin)
module.exports.toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post Not Found" });
  }
  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );

  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: loggedInUser },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: loggedInUser },
      },
      { new: true }
    );
  }
  res.status(200).json(post);
});
