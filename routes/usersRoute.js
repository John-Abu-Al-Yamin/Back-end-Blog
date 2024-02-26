const {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCountCtrl,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl,
} = require("../controllers/usersCtr");
const {
  verifyTokenAdmin,
  verifyTokenOnlyUser,
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");
const router = require("express").Router();
const validatid = require("../middlewares/validateid");
const photoUpload = require("../middlewares/photoUpload");

// api/users/profile
router.route("/profile").get(verifyTokenAdmin, getAllUsersCtrl);

// api/users/profile/:id
router
  .route("/profile/:id")
  .get(validatid, getUserProfileCtrl)
  .put(validatid, verifyTokenOnlyUser, updateUserProfileCtrl)
  .delete(validatid, verifyTokenAndAuthorization, deleteUserProfileCtrl);

// api/users/profile/profile-photo-upload
router
  .route("/profile/profile-photo-upload")
  .post(verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);

// api/users/count
router.route("/count").get(verifyTokenAdmin, getUsersCountCtrl);

module.exports = router;
