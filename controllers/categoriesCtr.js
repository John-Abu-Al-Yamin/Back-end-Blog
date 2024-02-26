const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/Category");

// Create New Category
// Route /api/Categories
// method POST // (ADMIN)
module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(403).json({ message: error.details[0].message });
  }

  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });

  res.status(201).json(category);
});

// Get All Category
// Route /api/Categories
// method Get // (Public)
module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

// Delete Category
// Route /api/Categories/:id
// method Delete // (Admin)
module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ mesage: "Category Not Fond" });
  }

  await Category.findByIdAndDelete(req.params.id);

  res
    .status(200)
    .json({
      message: "categroy has been delete SuccessFully",
      categoryId: category._id,
    });
});
