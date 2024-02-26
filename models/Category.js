const mongoose = require("mongoose");
const Joi = require("joi");

// Category Schema
const CategorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    title: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

// Category Model
const Category = mongoose.model("Category", CategorySchema);

// validate Create Category
function validateCreateCategory(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required().label("Text"),
  });
  return schema.validate(obj);
}

module.exports = {
  Category,
  validateCreateCategory,
};
