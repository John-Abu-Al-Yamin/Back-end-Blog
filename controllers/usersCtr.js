const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");
const { required } = require("joi");
const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");

// Get All Users Profile
// Route /api/auth/profile
// method Get // (ADMIN)
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json(users);
});

// Get  User Profile
// Route /api/auth/profile/:id
// method GEt
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json(user);
});

// Update User Profile
// Route /api/auth/profile/:id
// method PUT  (Private Only User Himself)

module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  const updatedUsre = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password");
  res.status(200).json(updatedUsre);
});

// Get Users Count
// Route /api/auth/count
// method Get // (ADMIN)
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const count = await db.collection("User").countDocuments();
  res.status(200).json(count);
});

// Profile Photo Uploade
// Route /api/auth/profile/profile-photo-upload
// method POST  (Only logged in Usre)

module.exports.profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  // Validation
  if (!req.file) {
    return res.status(400).json({ message: "Not file Provided" });
  }

  // Get The Path to the image
  const imagepath = path.join(__dirname, `../images/${req.file.filename}`);

  // Upload to CLOUDINARY
  const result = await cloudinaryUploadImage(imagepath);

  // Get the user from DB
  const user = await User.findById(req.user.id);

  // delete the old profile photo if exist
  if (user.profilePhoto.publicId != null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  // change the profile photo field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };
  await user.save();
  // Send response to client
  res.status(200).json({
    message: "Your Profile Photo Upload Successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  //Remove image from the server
  fs.unlinkSync(imagepath);
});

// Delete User Profile
// Route /api/auth/profile/id
// method POST  (Only Admin & him himself)
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  // 1- Get the user from DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ meaasge: "User not found" });
  }

  //  => 2- Get all Posts from DB
  const posts = await Post.find({ user: user._id });

  //  => 3- Get the Public id from post
  const publicIds = posts?.map((post) => post.image.publicId);

  // 4-Deleted all posts image from cloudinary That belong to thid user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  // 5- Deleted the profile picture from cloudinary
  await cloudinaryRemoveImage(user.profilePhoto.publicId);

  // => 6- Deleted user post & comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // 7-delet the user himself
  await User.findByIdAndDelete(req.params.id);

  // 8-send a response to the client
  res.status(200).json({ message: "Your Profile has been Deleted" });
});
