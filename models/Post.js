const mongoose = require("mongoose");
const Joi = require("joi");

// Post Schema
const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      require: true,
      trim: true,
      minlength: 10,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    category: {
      type: String,
      require: true,
    },
    image: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Comment for This Post
PostSchema.virtual("comments",{
  ref: "Comment",
  foreignField: "postId",
  localField: "_id"
});

// Post Model
const Post = mongoose.model("Post", PostSchema);

// validate Create post
function validateCreatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200).required(),
    description: Joi.string().trim().min(10).required(),
    category: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// validate Update post
function validateUpdatePost(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().min(2).max(200),
    description: Joi.string().trim().min(10),
    category: Joi.string().trim(),
  });
  return schema.validate(obj);
}
module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
