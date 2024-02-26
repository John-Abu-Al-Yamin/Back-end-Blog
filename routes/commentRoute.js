const router = require("express").Router();
const { createCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, updateCommentCtrl } = require("../controllers/commentsCtr");
const {verifyToken, verifyTokenAdmin} = require("../middlewares/verifyToken");
const validateid = require("../middlewares/validateid")

// api/comments
router.route("/")
.post(verifyToken, createCommentCtrl)
.get(verifyTokenAdmin, getAllCommentCtrl);

// api/comments/:id
router.route("/:id")
.delete(validateid, verifyToken, deleteCommentCtrl)
.put(validateid, verifyToken, updateCommentCtrl);

module.exports = router;