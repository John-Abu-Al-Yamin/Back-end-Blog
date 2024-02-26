const { object } = require("joi");
const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
// User Schema
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      minlength: 5,
      maxlength: 100,
    },
    password: {
      type: String,
      require: true,
      trim: true,
      minlength: 8,
    },
    profilePhoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    bio: {
      type: String,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    isAccountVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Populate Posts that Belongs To This User When he/she Get his Profile
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

// Generat JWT
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRWT
  );
};

const User = mongoose.model("User", UserSchema);

// validation register
function validateRegister(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).max(100).required(),
  });
  return schema.validate(obj);
}

// validation login
function validateLogin(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).required().email(),
    password: Joi.string().trim().min(8).max(100).required(),
  });
  return schema.validate(obj);
}

// validation Update User
function validateUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    password: Joi.string().trim().min(8).max(100),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegister,
  validateLogin,
  validateUpdateUser,
};
