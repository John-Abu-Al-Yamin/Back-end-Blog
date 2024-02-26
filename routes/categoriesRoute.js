const router = require("express").Router();
const {
  createCategoryCtrl,
  getAllCategoriesCtrl,
  deleteCategoryCtrl,
} = require("../controllers/categoriesCtr");
const validateid = require("../middlewares/validateid");
const { verifyTokenAdmin } = require("../middlewares/verifyToken");

// /api/categorise
router
  .route("/")
  .post(verifyTokenAdmin, createCategoryCtrl)
  .get(getAllCategoriesCtrl);

// /api/categorise/:id
router.route("/:id").delete(validateid, verifyTokenAdmin, deleteCategoryCtrl);

module.exports = router;
