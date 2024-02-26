const router = require("express").Router();
const {
  createPostCtrl,
  getAllPostCtrl,
  getSinglePostCtrl,
  getCountPostCtrl,
  deletePostCtrl,
  updatePostsCtrl,
  updatePostsImageCtrl,
  toggleLikeCtrl,
} = require("../controllers/postsCtr");
const photoUpload = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const validateid = require("../middlewares/validateid");
// api/posts
router
  .route("/")
  .post(verifyToken, photoUpload.single("image"), createPostCtrl)
  .get(getAllPostCtrl);

// api/posts/count
router.route("/count").get(getCountPostCtrl);

// api/posts/id
router
  .route("/:id")
  .get(validateid, getSinglePostCtrl)
  .delete(validateid, verifyToken, deletePostCtrl)
  .put(validateid, verifyToken, updatePostsCtrl);

// api/posts/update-image/:id
router
  .route("/update-image/:id")
  .put(
    validateid,
    verifyToken,
    photoUpload.single("image"),
    updatePostsImageCtrl
  );

// api/posts/like/:id
router.route("/like/:id").put(validateid, verifyToken, toggleLikeCtrl);
module.exports = router;
